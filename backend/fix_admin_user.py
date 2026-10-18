"""
Script to fix or create the admin user with correct credentials
Username: admin
Password: Admin@123
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import config
from models import db
from models.user import User
import bcrypt

def create_app():
    """Create Flask app"""
    app = Flask(__name__)
    app.config.from_object(config['default'])
    db.init_app(app)
    return app

def fix_admin_user():
    """Fix or create admin user with correct password"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if admin user exists
            admin = User.query.filter_by(username='admin').first()
            
            if admin:
                print(f"✓ Admin user found: {admin.username} ({admin.email})")
                print(f"  Current password hash: {admin.password_hash[:50]}...")
                
                # Update password
                admin.set_password('Admin@123')
                admin.email = 'admin@talktodb.com'
                admin.role = 'admin'
                db.session.commit()
                
                print("✓ Admin password updated successfully!")
                
            else:
                print("✗ Admin user not found. Creating new admin user...")
                
                # Create new admin user
                admin = User(
                    username='admin',
                    email='admin@talktodb.com',
                    role='admin'
                )
                admin.set_password('Admin@123')
                
                db.session.add(admin)
                db.session.commit()
                
                print("✓ Admin user created successfully!")
            
            # Verify the password works
            print("\n--- Testing Login ---")
            test_admin = User.query.filter_by(username='admin').first()
            
            if test_admin and test_admin.check_password('Admin@123'):
                print("✓ Password verification SUCCESSFUL!")
                print(f"\nLogin Credentials:")
                print(f"  Username: admin")
                print(f"  Password: Admin@123")
                print(f"  Email: {test_admin.email}")
                print(f"  Role: {test_admin.role}")
            else:
                print("✗ Password verification FAILED!")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            db.session.rollback()

if __name__ == '__main__':
    print("=" * 60)
    print("Admin User Fix Script")
    print("=" * 60)
    fix_admin_user()
    print("=" * 60)
