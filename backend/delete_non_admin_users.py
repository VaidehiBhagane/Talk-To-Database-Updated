"""
Script to delete all users except admin
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from config import config
from models import db
from models.user import User

# Create Flask app
app = Flask(__name__)
app.config.from_object(config['default'])
db.init_app(app)

def delete_non_admin_users():
    with app.app_context():
        try:
            # Get all non-admin users
            non_admin_users = User.query.filter(User.role != 'admin').all()
            
            print(f"Found {len(non_admin_users)} non-admin users to delete:")
            for user in non_admin_users:
                print(f"  - {user.username} ({user.email})")
            
            # Delete them
            for user in non_admin_users:
                db.session.delete(user)
            
            db.session.commit()
            print(f"\n✅ Successfully deleted {len(non_admin_users)} users")
            
            # Show remaining users
            remaining_users = User.query.all()
            print(f"\nRemaining users: {len(remaining_users)}")
            for user in remaining_users:
                print(f"  - {user.username} ({user.role})")
                
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    delete_non_admin_users()
