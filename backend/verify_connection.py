"""
Verify database connection and admin user
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import config
from models import db
from models.user import User
import bcrypt

def verify_connection():
    """Verify database connection and admin user"""
    app = Flask(__name__)
    app.config.from_object(config['default'])
    db.init_app(app)
    
    with app.app_context():
        try:
            # Test database connection
            print("=" * 60)
            print("Testing Database Connection...")
            print("=" * 60)
            
            # Try to connect
            db.engine.connect()
            print("✓ Database connection successful!")
            print(f"  Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
            
            # Check if users table exists
            print("\n--- Checking Users Table ---")
            users_count = User.query.count()
            print(f"✓ Users table exists")
            print(f"  Total users: {users_count}")
            
            # Check admin user
            print("\n--- Checking Admin User ---")
            admin = User.query.filter_by(username='admin').first()
            
            if admin:
                print(f"✓ Admin user found!")
                print(f"  ID: {admin.id}")
                print(f"  Username: {admin.username}")
                print(f"  Email: {admin.email}")
                print(f"  Role: {admin.role}")
                print(f"  Password Hash: {admin.password_hash[:50]}...")
                
                # Test password verification
                test_password = "Admin@123"
                print(f"\n--- Testing Password ---")
                if admin.check_password(test_password):
                    print(f"✓ Password verification SUCCESSFUL for '{test_password}'")
                else:
                    print(f"✗ Password verification FAILED for '{test_password}'")
                    print(f"  Fixing password...")
                    admin.set_password(test_password)
                    db.session.commit()
                    print(f"✓ Password reset to '{test_password}'")
            else:
                print("✗ Admin user NOT found!")
                print("  Creating admin user...")
                
                admin = User(
                    username='admin',
                    email='admin@talktodb.com',
                    role='admin'
                )
                admin.set_password('Admin@123')
                db.session.add(admin)
                db.session.commit()
                print("✓ Admin user created!")
            
            print("\n" + "=" * 60)
            print("FINAL CREDENTIALS:")
            print("  Username: admin")
            print("  Password: Admin@123")
            print("  URL: http://localhost:5000/api/auth/login")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n✗ ERROR: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    verify_connection()
