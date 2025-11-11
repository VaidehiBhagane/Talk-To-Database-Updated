from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from models.notification import Notification
from utils.jwt_utils import generate_token
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    User signup endpoint
    
    Expected JSON:
        {
            "username": "string",
            "email": "string",
            "password": "string",
            "role": "user" (optional, defaults to 'user')
        }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        role = data.get('role', 'user')
        
        # Validate inputs
        if not username or len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        is_valid, msg = validate_password(password)
        if not is_valid:
            return jsonify({'error': msg}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 409
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            role=role
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        # Users can view all BUs but don't have access by default
        # They need to request access through the profile page
        
        # Create notification for admin about new user
        admin_notification = Notification(
            user_id=1,  # Admin user ID
            notification_type='new_user',
            title='New User Registered',
            message=f'New user {username} ({email}) has registered',
            related_user_id=new_user.id
        )
        db.session.add(admin_notification)
        db.session.commit()
        
        # Generate token
        token = generate_token(new_user.id, new_user.username, new_user.role)
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    
    Expected JSON:
        {
            "username": "string",
            "password": "string"
        }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ['username', 'password']):
            return jsonify({'error': 'Missing username or password'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        # Find user
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate token
        token = generate_token(user.id, user.username, user.role)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    """
    Verify JWT token validity
    
    Headers:
        Authorization: Bearer <token>
    """
    from utils.jwt_utils import decode_token
    
    token = None
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid token format'}), 401
    
    if not token:
        return jsonify({'error': 'Token is missing'}), 401
    
    payload = decode_token(token)
    
    if not payload:
        return jsonify({'valid': False, 'error': 'Token is invalid or expired'}), 401
    
    # Get user details
    user = User.query.get(payload['user_id'])
    
    if not user:
        return jsonify({'valid': False, 'error': 'User not found'}), 404
    
    return jsonify({
        'valid': True,
        'user': user.to_dict()
    }), 200
