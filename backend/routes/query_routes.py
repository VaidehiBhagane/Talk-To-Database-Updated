from flask import Blueprint, request, jsonify, send_file
from models import db
from models.business_unit import BusinessUnit, UserBUAccess
from models.query_log import QueryLog
from utils.jwt_utils import token_required
from services.ai_sql_service import ai_sql_service
from services.visualization_service import visualization_service
from utils.db_connect import execute_query
import time
import pandas as pd
import io
from datetime import datetime

query_bp = Blueprint('query', __name__, url_prefix='/api/query')

def get_schema_info(bu_id):
    """
    Get database schema information for a business unit
    
    Args:
        bu_id: Business unit ID
    
    Returns:
        Schema information string
    """
    try:
        bu = BusinessUnit.query.get(bu_id)
        if not bu:
            return None
        
        schema_name = bu.schema_name
        
        # Query to get table and column information
        schema_query = f"""
        SELECT 
            TABLE_NAME,
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '{schema_name}'
        ORDER BY TABLE_NAME, ORDINAL_POSITION
        """
        
        schema_data = execute_query(schema_query)
        
        # Format schema info
        schema_info = f"Database Schema for '{bu.name}':\n\n"
        
        current_table = None
        for row in schema_data:
            if row['TABLE_NAME'] != current_table:
                current_table = row['TABLE_NAME']
                schema_info += f"\nTable: {current_table}\n"
            
            nullable = "NULL" if row['IS_NULLABLE'] == 'YES' else "NOT NULL"
            key = f" [{row['COLUMN_KEY']}]" if row['COLUMN_KEY'] else ""
            schema_info += f"  - {row['COLUMN_NAME']} ({row['DATA_TYPE']}) {nullable}{key}\n"
        
        return schema_info
        
    except Exception as e:
        return f"Error fetching schema: {str(e)}"

@query_bp.route('/execute', methods=['POST'])
@token_required
def execute_natural_query(current_user):
    """
    Execute a natural language query
    
    Expected JSON:
        {
            "bu_id": integer,
            "query": "string"
        }
    
    Returns:
        {
            "sql": "generated SQL",
            "explanation": "AI explanation",
            "data": [query results],
            "row_count": integer,
            "execution_time": float
        }
    """
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['bu_id', 'query']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        bu_id = data['bu_id']
        natural_query = data['query'].strip()
        user_id = current_user['user_id']
        role = current_user['role']
        
        # Validate business unit
        bu = BusinessUnit.query.get(bu_id)
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        # Check access
        if role != 'admin':
            access = UserBUAccess.query.filter_by(user_id=user_id, bu_id=bu_id).first()
            if not access:
                return jsonify({'error': 'Access denied to this business unit'}), 403
        
        # Get schema information
        schema_info = get_schema_info(bu_id)
        
        if not schema_info:
            return jsonify({'error': 'Failed to retrieve schema information'}), 500
        
        # Generate SQL using AI
        ai_result = ai_sql_service.generate_sql(natural_query, schema_info, bu.name)
        
        if not ai_result['success']:
            return jsonify({'error': ai_result['error']}), 500
        
        generated_sql = ai_result['sql']
        explanation = ai_result['explanation']
        
        # Validate SQL
        is_valid, validation_msg = ai_sql_service.validate_sql(generated_sql)
        if not is_valid:
            return jsonify({'error': f'SQL validation failed: {validation_msg}'}), 400
        
        # Execute SQL
        start_time = time.time()
        
        try:
            results = execute_query(generated_sql, schema=bu.schema_name)
            execution_time = time.time() - start_time
            
            # Log the query
            query_log = QueryLog(
                user_id=user_id,
                bu_id=bu_id,
                query_text=natural_query,
                generated_sql=generated_sql,
                result_count=len(results) if isinstance(results, list) else 0,
                execution_time=execution_time,
                status='success'
            )
            db.session.add(query_log)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'sql': generated_sql,
                'explanation': explanation,
                'data': results,
                'row_count': len(results) if isinstance(results, list) else 0,
                'execution_time': execution_time,
                'query_log_id': query_log.id
            }), 200
            
        except Exception as e:
            execution_time = time.time() - start_time
            
            # Log the error
            query_log = QueryLog(
                user_id=user_id,
                bu_id=bu_id,
                query_text=natural_query,
                generated_sql=generated_sql,
                execution_time=execution_time,
                status='error',
                error_message=str(e)
            )
            db.session.add(query_log)
            db.session.commit()
            
            return jsonify({
                'success': False,
                'error': f'Query execution failed: {str(e)}',
                'sql': generated_sql,
                'explanation': explanation
            }), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@query_bp.route('/visualize', methods=['POST'])
@token_required
def visualize_data(current_user):
    """
    Generate visualization from query results
    
    Expected JSON:
        {
            "data": [query results],
            "chart_type": "auto|bar|line|pie|scatter|table",
            "title": "string" (optional),
            "query_text": "string" (optional)
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'Missing data field'}), 400
        
        query_data = data['data']
        chart_type = data.get('chart_type', 'auto')
        title = data.get('title', 'Query Results Visualization')
        query_text = data.get('query_text', '')
        
        # Generate visualization
        viz_result = visualization_service.generate_visualization(
            query_data, 
            chart_type=chart_type, 
            title=title,
            query_text=query_text
        )
        
        if not viz_result['success']:
            return jsonify({'error': viz_result['error']}), 500
        
        return jsonify(viz_result), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@query_bp.route('/export', methods=['POST'])
@token_required
def export_data(current_user):
    """
    Export query results to CSV or Excel
    
    Expected JSON:
        {
            "data": [query results],
            "format": "csv|xlsx",
            "filename": "string" (optional)
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'Missing data field'}), 400
        
        query_data = data['data']
        export_format = data.get('format', 'csv')
        filename = data.get('filename', f'query_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        
        if not query_data:
            return jsonify({'error': 'No data to export'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(query_data)
        
        # Create file in memory
        output = io.BytesIO()
        
        if export_format == 'xlsx':
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Results')
            filename = f'{filename}.xlsx'
            mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        else:
            df.to_csv(output, index=False)
            filename = f'{filename}.csv'
            mimetype = 'text/csv'
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

@query_bp.route('/history', methods=['GET'])
@token_required
def get_query_history(current_user):
    """
    Get query history for the current user
    
    Query params:
        bu_id: Filter by business unit (optional)
        limit: Number of records to return (default: 50)
    """
    try:
        user_id = current_user['user_id']
        bu_id = request.args.get('bu_id', type=int)
        limit = request.args.get('limit', default=50, type=int)
        
        # Build query
        query = QueryLog.query.filter_by(user_id=user_id)
        
        if bu_id:
            query = query.filter_by(bu_id=bu_id)
        
        # Get most recent queries
        query_logs = query.order_by(QueryLog.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'history': [log.to_dict() for log in query_logs]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@query_bp.route('/schema/<int:bu_id>', methods=['GET'])
@token_required
def get_bu_schema(current_user, bu_id):
    """
    Get database schema for a business unit
    """
    try:
        user_id = current_user['user_id']
        role = current_user['role']
        
        # Check access
        if role != 'admin':
            access = UserBUAccess.query.filter_by(user_id=user_id, bu_id=bu_id).first()
            if not access:
                return jsonify({'error': 'Access denied to this business unit'}), 403
        
        schema_info = get_schema_info(bu_id)
        
        if not schema_info:
            return jsonify({'error': 'Failed to retrieve schema information'}), 500
        
        return jsonify({
            'schema_info': schema_info
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
