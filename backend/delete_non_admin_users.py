"""
Script to delete all non-admin users from the database
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import config
from models import db
from models.user import User

def create_app():
    """Create Flask app"""
    app = Flask(__name__)
    app.config.from_object(config['default'])
    db.init_app(app)
    return app

def delete_non_admin_users():
    """Delete all users except admin"""
    app = create_app()
    
    with app.app_context():
        try:
            # Get all non-admin users
            non_admin_users = User.query.filter(User.role != 'admin').all()
            
            print(f"Found {len(non_admin_users)} non-admin users to delete")
            
            for user in non_admin_users:
                print(f"  Deleting: {user.username} ({user.email})")
                db.session.delete(user)
            
            db.session.commit()
            print(f"\n✓ Successfully deleted {len(non_admin_users)} users")
            
            # Verify
            remaining = User.query.count()
            print(f"✓ Remaining users: {remaining}")
            
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    print("=" * 60)
    print("Delete Non-Admin Users Script")
    print("=" * 60)
    delete_non_admin_users()
    print("=" * 60)
