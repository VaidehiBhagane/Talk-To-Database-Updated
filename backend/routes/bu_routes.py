from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from models.business_unit import BusinessUnit, UserBUAccess
from utils.jwt_utils import token_required, admin_required

bu_bp = Blueprint('business_units', __name__, url_prefix='/api/bu')

@bu_bp.route('/', methods=['GET'])
@token_required
def get_business_units(current_user):
    """
    Get all business units accessible to the current user
    
    Headers:
        Authorization: Bearer <token>
    """
    try:
        user_id = current_user['user_id']
        role = current_user['role']
        
        if role == 'admin':
            # Admins can see all business units
            business_units = BusinessUnit.query.all()
        else:
            # Regular users see only their accessible BUs
            accessible_bu_ids = db.session.query(UserBUAccess.bu_id).filter_by(user_id=user_id).all()
            accessible_bu_ids = [bu_id[0] for bu_id in accessible_bu_ids]
            business_units = BusinessUnit.query.filter(BusinessUnit.id.in_(accessible_bu_ids)).all()
        
        return jsonify({
            'business_units': [bu.to_dict() for bu in business_units]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bu_bp.route('/<int:bu_id>', methods=['GET'])
@token_required
def get_business_unit(current_user, bu_id):
    """
    Get specific business unit details
    
    Headers:
        Authorization: Bearer <token>
    """
    try:
        user_id = current_user['user_id']
        role = current_user['role']
        
        bu = BusinessUnit.query.get(bu_id)
        
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        # Check access
        if role != 'admin':
            access = UserBUAccess.query.filter_by(user_id=user_id, bu_id=bu_id).first()
            if not access:
                return jsonify({'error': 'Access denied to this business unit'}), 403
        
        return jsonify({'business_unit': bu.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bu_bp.route('/', methods=['POST'])
@admin_required
def create_business_unit(current_user):
    """
    Create a new business unit (Admin only)
    
    Expected JSON:
        {
            "name": "string",
            "description": "string",
            "schema_name": "string"
        }
    
    Headers:
        Authorization: Bearer <token>
    """
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['name', 'schema_name']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        name = data['name'].strip()
        description = data.get('description', '').strip()
        schema_name = data['schema_name'].strip()
        
        # Check if BU already exists
        existing_bu = BusinessUnit.query.filter_by(name=name).first()
        if existing_bu:
            return jsonify({'error': 'Business unit with this name already exists'}), 409
        
        # Create new business unit
        new_bu = BusinessUnit(
            name=name,
            description=description,
            schema_name=schema_name,
            created_by=current_user['user_id']
        )
        
        db.session.add(new_bu)
        db.session.commit()
        
        return jsonify({
            'message': 'Business unit created successfully',
            'business_unit': new_bu.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bu_bp.route('/<int:bu_id>', methods=['PUT'])
@admin_required
def update_business_unit(current_user, bu_id):
    """
    Update business unit (Admin only)
    
    Expected JSON:
        {
            "name": "string" (optional),
            "description": "string" (optional),
            "schema_name": "string" (optional)
        }
    """
    try:
        bu = BusinessUnit.query.get(bu_id)
        
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            bu.name = data['name'].strip()
        if 'description' in data:
            bu.description = data['description'].strip()
        if 'schema_name' in data:
            bu.schema_name = data['schema_name'].strip()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Business unit updated successfully',
            'business_unit': bu.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bu_bp.route('/<int:bu_id>', methods=['DELETE'])
@admin_required
def delete_business_unit(current_user, bu_id):
    """
    Delete business unit (Admin only)
    """
    try:
        bu = BusinessUnit.query.get(bu_id)
        
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        db.session.delete(bu)
        db.session.commit()
        
        return jsonify({'message': 'Business unit deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bu_bp.route('/<int:bu_id>/grant-access', methods=['POST'])
@admin_required
def grant_access(current_user, bu_id):
    """
    Grant user access to a business unit (Admin only)
    
    Expected JSON:
        {
            "user_id": integer
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'Missing user_id'}), 400
        
        user_id = data['user_id']
        
        # Check if BU exists
        bu = BusinessUnit.query.get(bu_id)
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if access already exists
        existing_access = UserBUAccess.query.filter_by(user_id=user_id, bu_id=bu_id).first()
        if existing_access:
            return jsonify({'error': 'User already has access to this business unit'}), 409
        
        # Grant access
        new_access = UserBUAccess(user_id=user_id, bu_id=bu_id)
        db.session.add(new_access)
        db.session.commit()
        
        return jsonify({
            'message': 'Access granted successfully',
            'access': new_access.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bu_bp.route('/<int:bu_id>/revoke-access', methods=['POST'])
@admin_required
def revoke_access(current_user, bu_id):
    """
    Revoke user access from a business unit (Admin only)
    
    Expected JSON:
        {
            "user_id": integer
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'Missing user_id'}), 400
        
        user_id = data['user_id']
        
        # Find access record
        access = UserBUAccess.query.filter_by(user_id=user_id, bu_id=bu_id).first()
        
        if not access:
            return jsonify({'error': 'Access record not found'}), 404
        
        db.session.delete(access)
        db.session.commit()
        
        return jsonify({'message': 'Access revoked successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@bu_bp.route('/<int:bu_id>/users', methods=['GET'])
@admin_required
def get_bu_users(current_user, bu_id):
    """
    Get all users with access to a business unit (Admin only)
    """
    try:
        bu = BusinessUnit.query.get(bu_id)
        
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        # Get all users with access
        access_records = UserBUAccess.query.filter_by(bu_id=bu_id).all()
        user_ids = [access.user_id for access in access_records]
        users = User.query.filter(User.id.in_(user_ids)).all()
        
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
