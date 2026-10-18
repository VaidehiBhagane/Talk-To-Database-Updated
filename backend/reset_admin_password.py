"""
Script to reset admin password
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

def reset_password():
    """Reset admin password"""
    app = create_app()
    
    with app.app_context():
        try:
            admin = User.query.filter_by(username='admin').first()
            
            if admin:
                admin.set_password('Admin@123')
                db.session.commit()
                
                print("✓ Admin password reset successfully!")
                print(f"  Username: admin")
                print(f"  Password: Admin@123")
            else:
                print("✗ Admin user not found!")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    print("=" * 60)
    print("Reset Admin Password Script")
    print("=" * 60)
    reset_password()
    print("=" * 60)
