from flask import Blueprint, request, jsonify
from models import db
from models.notification import Notification, AccessRequest
from models.user import User
from models.business_unit import BusinessUnit, UserBUAccess
from utils.jwt_utils import token_required
from datetime import datetime

notification_bp = Blueprint('notification', __name__, url_prefix='/api/notifications')

@notification_bp.route('/', methods=['GET'])
@token_required
def get_notifications(current_user):
    """
    Get notifications for current user
    For admin: get all admin notifications
    For user: get user-specific notifications
    """
    try:
        user_id = current_user['user_id']
        role = current_user['role']
        
        if role == 'admin':
            # Get all admin notifications (new users, access requests)
            notifications = Notification.query.filter(
                Notification.notification_type.in_(['new_user', 'access_request'])
            ).order_by(Notification.created_at.desc()).all()
        else:
            # Get user-specific notifications
            notifications = Notification.query.filter_by(user_id=user_id)\
                .order_by(Notification.created_at.desc()).all()
        
        return jsonify({
            'notifications': [n.to_dict() for n in notifications],
            'unread_count': len([n for n in notifications if not n.is_read])
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@notification_bp.route('/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_as_read(current_user, notification_id):
    """Mark notification as read"""
    try:
        notification = Notification.query.get(notification_id)
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@notification_bp.route('/mark-all-read', methods=['PUT'])
@token_required
def mark_all_read(current_user):
    """Mark all notifications as read"""
    try:
        user_id = current_user['user_id']
        role = current_user['role']
        
        if role == 'admin':
            notifications = Notification.query.filter(
                Notification.notification_type.in_(['new_user', 'access_request'])
            ).all()
        else:
            notifications = Notification.query.filter_by(user_id=user_id).all()
        
        for notification in notifications:
            notification.is_read = True
        
        db.session.commit()
        
        return jsonify({'message': 'All notifications marked as read'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# Access Request Routes
@notification_bp.route('/access-requests', methods=['GET'])
@token_required
def get_access_requests(current_user):
    """
    Get access requests
    Admin: all pending requests
    User: their own requests
    """
    try:
        role = current_user['role']
        user_id = current_user['user_id']
        
        if role == 'admin':
            # Get all pending requests
            status_filter = request.args.get('status', 'pending')
            
            if status_filter == 'all':
                requests = AccessRequest.query.order_by(AccessRequest.created_at.desc()).all()
            else:
                requests = AccessRequest.query.filter_by(status=status_filter)\
                    .order_by(AccessRequest.created_at.desc()).all()
        else:
            # Get user's own requests
            requests = AccessRequest.query.filter_by(user_id=user_id)\
                .order_by(AccessRequest.created_at.desc()).all()
        
        return jsonify({
            'access_requests': [req.to_dict() for req in requests],
            'count': len(requests)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@notification_bp.route('/access-requests', methods=['POST'])
@token_required
def create_access_request(current_user):
    """
    Create new access request
    
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

@notification_bp.route('/access-requests/<int:request_id>/approve', methods=['PUT'])
@token_required
def approve_access_request(current_user, request_id):
    """Approve access request (Admin only)"""
    try:
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        access_request = AccessRequest.query.get(request_id)
        
        if not access_request:
            return jsonify({'error': 'Access request not found'}), 404
        
        if access_request.status != 'pending':
            return jsonify({'error': 'Request already processed'}), 400
        
        # Update request status
        access_request.status = 'approved'
        access_request.reviewed_by = current_user['user_id']
        access_request.reviewed_at = datetime.utcnow()
        
        # Grant access
        bu_access = UserBUAccess(
            user_id=access_request.user_id,
            bu_id=access_request.bu_id
        )
        
        db.session.add(bu_access)
        
        # Create notification for user
        user_notification = Notification(
            user_id=access_request.user_id,
            notification_type='access_granted',
            title='Access Request Approved',
            message=f'Your access request to {access_request.business_unit.name} has been approved',
            related_bu_id=access_request.bu_id
        )
        
        db.session.add(user_notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Access request approved',
            'access_request': access_request.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@notification_bp.route('/access-requests/<int:request_id>/reject', methods=['PUT'])
@token_required
def reject_access_request(current_user, request_id):
    """Reject access request (Admin only)"""
    try:
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        access_request = AccessRequest.query.get(request_id)
        
        if not access_request:
            return jsonify({'error': 'Access request not found'}), 404
        
        if access_request.status != 'pending':
            return jsonify({'error': 'Request already processed'}), 400
        
        # Update request status
        access_request.status = 'rejected'
        access_request.reviewed_by = current_user['user_id']
        access_request.reviewed_at = datetime.utcnow()
        
        # Create notification for user
        user_notification = Notification(
            user_id=access_request.user_id,
            notification_type='access_rejected',
            title='Access Request Rejected',
            message=f'Your access request to {access_request.business_unit.name} has been rejected',
            related_bu_id=access_request.bu_id
        )
        
        db.session.add(user_notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Access request rejected',
            'access_request': access_request.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500
