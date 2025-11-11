from flask import Blueprint, jsonify, request
from models import db
from models.user import User
from models.business_unit import BusinessUnit, UserBUAccess
from models.query_log import QueryLog
from utils.jwt_utils import admin_required
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics(current_user):
    """
    Get comprehensive analytics for admin dashboard
    
    Returns:
        - Total users
        - Total business units
        - Total queries executed
        - Queries by BU
        - Active users by BU
        - Recent activity
    """
    try:
        # Total counts
        total_users = User.query.count()
        total_bus = BusinessUnit.query.count()
        total_queries = QueryLog.query.count()
        
        # Queries by business unit
        queries_by_bu = db.session.query(
            BusinessUnit.name,
            func.count(QueryLog.id).label('query_count')
        ).join(QueryLog, BusinessUnit.id == QueryLog.bu_id)\
         .group_by(BusinessUnit.id, BusinessUnit.name)\
         .all()
        
        queries_by_bu_data = [
            {'bu_name': bu_name, 'query_count': count}
            for bu_name, count in queries_by_bu
        ]
        
        # Active users by business unit
        active_users_by_bu = db.session.query(
            BusinessUnit.name,
            func.count(func.distinct(QueryLog.user_id)).label('user_count')
        ).join(QueryLog, BusinessUnit.id == QueryLog.bu_id)\
         .group_by(BusinessUnit.id, BusinessUnit.name)\
         .all()
        
        active_users_data = [
            {'bu_name': bu_name, 'active_users': count}
            for bu_name, count in active_users_by_bu
        ]
        
        # Query success rate
        success_queries = QueryLog.query.filter_by(status='success').count()
        success_rate = (success_queries / total_queries * 100) if total_queries > 0 else 0
        
        # Recent activity (last 10 queries)
        recent_queries = QueryLog.query\
            .order_by(QueryLog.timestamp.desc())\
            .limit(10)\
            .all()
        
        recent_activity = []
        for log in recent_queries:
            user = User.query.get(log.user_id)
            bu = BusinessUnit.query.get(log.bu_id)
            recent_activity.append({
                'username': user.username if user else 'Unknown',
                'bu_name': bu.name if bu else 'Unknown',
                'query_text': log.query_text[:100] + '...' if len(log.query_text) > 100 else log.query_text,
                'status': log.status,
                'timestamp': log.timestamp.isoformat() if log.timestamp else None
            })
        
        # Average execution time
        avg_execution_time = db.session.query(
            func.avg(QueryLog.execution_time)
        ).filter(QueryLog.status == 'success').scalar()
        
        # User role distribution
        user_roles = db.session.query(
            User.role,
            func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        role_distribution = [
            {'role': role, 'count': count}
            for role, count in user_roles
        ]
        
        return jsonify({
            'total_users': total_users,
            'total_business_units': total_bus,
            'total_queries': total_queries,
            'success_rate': round(success_rate, 2),
            'avg_execution_time': round(avg_execution_time, 4) if avg_execution_time else 0,
            'queries_by_bu': queries_by_bu_data,
            'active_users_by_bu': active_users_data,
            'recent_activity': recent_activity,
            'role_distribution': role_distribution
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    """
    Get all users in the system with their BU access (Admin only)
    """
    try:
        users = User.query.all()
        users_data = []
        
        for user in users:
            user_dict = user.to_dict()
            
            # Get user's business units
            bu_access = UserBUAccess.query.filter_by(user_id=user.id).all()
            business_units = []
            for access in bu_access:
                bu = BusinessUnit.query.get(access.bu_id)
                if bu:
                    business_units.append({
                        'id': bu.id,
                        'name': bu.name,
                        'granted_at': access.granted_at.isoformat() if access.granted_at else None
                    })
            
            user_dict['business_units'] = business_units
            user_dict['bu_count'] = len(business_units)
            
            # Get query count
            query_count = QueryLog.query.filter_by(user_id=user.id).count()
            user_dict['query_count'] = query_count
            
            users_data.append(user_dict)
        
        return jsonify({
            'users': users_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    """
    Delete a user (Admin only)
    """
    try:
        # Prevent admin from deleting themselves
        if user_id == current_user['user_id']:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(current_user, user_id):
    """
    Update user role (Admin only)
    
    Expected JSON:
        {
            "role": "user|admin"
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'role' not in data:
            return jsonify({'error': 'Missing role field'}), 400
        
        role = data['role']
        
        if role not in ['user', 'admin']:
            return jsonify({'error': 'Invalid role. Must be "user" or "admin"'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.role = role
        db.session.commit()
        
        return jsonify({
            'message': 'User role updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>/business-units/<int:bu_id>/grant', methods=['POST'])
@admin_required
def grant_bu_access_to_user(current_user, user_id, bu_id):
    """
    Grant a user access to a business unit (Admin only)
    """
    try:
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify business unit exists
        bu = BusinessUnit.query.get(bu_id)
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        # Check if access already exists
        existing_access = UserBUAccess.query.filter_by(user_id=user_id, bu_id=bu_id).first()
        if existing_access:
            return jsonify({'error': 'User already has access to this business unit'}), 409
        
        # Grant access
        new_access = UserBUAccess(user_id=user_id, bu_id=bu_id)
        db.session.add(new_access)
        db.session.commit()
        
        return jsonify({
            'message': f'Access granted to {user.username} for {bu.name}',
            'access': {
                'user_id': user_id,
                'bu_id': bu_id,
                'granted_at': new_access.granted_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>/business-units/<int:bu_id>/revoke', methods=['DELETE'])
@admin_required
def revoke_bu_access_from_user(current_user, user_id, bu_id):
    """
    Revoke a user's access to a business unit (Admin only)
    """
    try:
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify business unit exists
        bu = BusinessUnit.query.get(bu_id)
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        # Find access record
        access = UserBUAccess.query.filter_by(user_id=user_id, bu_id=bu_id).first()
        if not access:
            return jsonify({'error': 'User does not have access to this business unit'}), 404
        
        # Revoke access
        db.session.delete(access)
        db.session.commit()
        
        return jsonify({
            'message': f'Access revoked from {user.username} for {bu.name}'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@admin_bp.route('/query-logs', methods=['GET'])
@admin_required
def get_all_query_logs(current_user):
    """
    Get all query logs (Admin only)
    
    Query params:
        limit: Number of records (default: 100)
        bu_id: Filter by business unit (optional)
        user_id: Filter by user (optional)
    """
    try:
        from flask import request
        
        limit = request.args.get('limit', default=100, type=int)
        bu_id = request.args.get('bu_id', type=int)
        user_id = request.args.get('user_id', type=int)
        
        query = QueryLog.query
        
        if bu_id:
            query = query.filter_by(bu_id=bu_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        logs = query.order_by(QueryLog.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'query_logs': [log.to_dict() for log in logs]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
