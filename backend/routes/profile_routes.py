from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from models.business_unit import BusinessUnit, UserBUAccess
from models.notification import Notification, AccessRequest
from utils.jwt_utils import token_required
import re

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@profile_bp.route('/', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get current user's profile"""
    try:
        user = User.query.get(current_user['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's business units
        if user.role == 'admin':
            business_units = BusinessUnit.query.all()
        else:
            bu_access = UserBUAccess.query.filter_by(user_id=user.id).all()
            business_units = [BusinessUnit.query.get(access.bu_id) for access in bu_access]
        
        # Get pending access requests
        pending_requests = AccessRequest.query.filter_by(
            user_id=user.id,
            status='pending'
        ).all()
        
        return jsonify({
            'profile': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'profile_picture': user.profile_picture,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'business_units': [{'id': bu.id, 'name': bu.name, 'description': bu.description} for bu in business_units if bu],
                'pending_requests': [req.to_dict() for req in pending_requests]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@profile_bp.route('/', methods=['PUT'])
@token_required
def update_profile(current_user):
    """
    Update user profile
    
    Expected JSON:
        {
            "email": "string" (optional),
            "current_password": "string" (required if changing password),
            "new_password": "string" (optional),
            "profile_picture": "string" (optional, base64 encoded image)
        }
    """
    try:
        user = User.query.get(current_user['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update email
        if 'email' in data:
            new_email = data['email'].strip().lower()
            
            if not validate_email(new_email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email already exists
            existing_user = User.query.filter_by(email=new_email).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Email already in use'}), 409
            
            user.email = new_email
        
        # Update profile picture
        if 'profile_picture' in data:
            user.profile_picture = data['profile_picture']
        
        # Update password
        if 'new_password' in data:
            if 'current_password' not in data:
                return jsonify({'error': 'Current password required to change password'}), 400
            
            # Verify current password
            if not user.check_password(data['current_password']):
                return jsonify({'error': 'Current password is incorrect'}), 401
            
            # Validate new password
            new_password = data['new_password']
            if len(new_password) < 8:
                return jsonify({'error': 'Password must be at least 8 characters long'}), 400
            if not any(c.isupper() for c in new_password):
                return jsonify({'error': 'Password must contain at least one uppercase letter'}), 400
            if not any(c.islower() for c in new_password):
                return jsonify({'error': 'Password must contain at least one lowercase letter'}), 400
            if not any(c.isdigit() for c in new_password):
                return jsonify({'error': 'Password must contain at least one digit'}), 400
            
            user.set_password(new_password)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@profile_bp.route('/available-business-units', methods=['GET'])
@token_required
def get_available_business_units(current_user):
    """Get business units that user doesn't have access to"""
    try:
        user_id = current_user['user_id']
        
        # Get all business units
        all_bus = BusinessUnit.query.all()
        
        # Get user's current access
        user_access = UserBUAccess.query.filter_by(user_id=user_id).all()
        user_bu_ids = [access.bu_id for access in user_access]
        
        # Get pending requests
        pending_requests = AccessRequest.query.filter_by(
            user_id=user_id,
            status='pending'
        ).all()
        pending_bu_ids = [req.bu_id for req in pending_requests]
        
        # Filter out BUs user already has access to or has pending request for
        available_bus = [
            {
                'id': bu.id,
                'name': bu.name,
                'description': bu.description,
                'has_pending_request': bu.id in pending_bu_ids
            }
            for bu in all_bus
            if bu.id not in user_bu_ids
        ]
        
        return jsonify({
            'available_business_units': available_bus
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@profile_bp.route('/request-access', methods=['POST'])
@token_required
def request_bu_access(current_user):
    """
    Request access to a business unit
    
    Expected JSON:
        {
            "bu_id": integer,
            "message": "string" (optional)
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'bu_id' not in data:
            return jsonify({'error': 'Missing business unit ID'}), 400
        
        user_id = current_user['user_id']
        bu_id = data['bu_id']
        message = data.get('message', '')
        
        # Check if BU exists
        bu = BusinessUnit.query.get(bu_id)
        if not bu:
            return jsonify({'error': 'Business unit not found'}), 404
        
        # Check if already has access
        existing_access = UserBUAccess.query.filter_by(user_id=user_id, bu_id=bu_id).first()
        if existing_access:
            return jsonify({'error': 'You already have access to this business unit'}), 400
        
        # Check if request already exists
        existing_request = AccessRequest.query.filter_by(
            user_id=user_id,
            bu_id=bu_id,
            status='pending'
        ).first()
        
        if existing_request:
            return jsonify({'error': 'Access request already pending'}), 400
        
        # Create access request
        access_request = AccessRequest(
            user_id=user_id,
            bu_id=bu_id,
            message=message,
            status='pending'
        )
        
        db.session.add(access_request)
        
        # Create notification for admin
        user = User.query.get(user_id)
        admin_notification = Notification(
            user_id=1,  # Admin user
            notification_type='access_request',
            title='New Access Request',
            message=f'{user.username} requested access to {bu.name}',
            related_user_id=user_id,
            related_bu_id=bu_id
        )
        
        db.session.add(admin_notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Access request submitted successfully',
            'access_request': access_request.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500
