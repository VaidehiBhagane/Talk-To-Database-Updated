"""
Script to grant all users access to all business units
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import config
from models import db
from models.user import User
from models.business_unit import BusinessUnit, UserBUAccess

def create_app():
    """Create Flask app"""
    app = Flask(__name__)
    app.config.from_object(config['default'])
    db.init_app(app)
    return app

def grant_access_to_all():
    """Grant all users access to all business units"""
    app = create_app()
    
    with app.app_context():
        try:
            users = User.query.all()
            bus = BusinessUnit.query.all()
            
            print(f"Found {len(users)} users and {len(bus)} business units")
            
            granted_count = 0
            for user in users:
                for bu in bus:
                    # Check if access already exists
                    existing = UserBUAccess.query.filter_by(
                        user_id=user.id,
                        bu_id=bu.id
                    ).first()
                    
                    if not existing:
                        access = UserBUAccess(
                            user_id=user.id,
                            bu_id=bu.id
                        )
                        db.session.add(access)
                        granted_count += 1
                        print(f"  Granted: {user.username} -> {bu.name}")
            
            db.session.commit()
            print(f"\n✓ Successfully granted {granted_count} new access permissions")
            
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    print("=" * 60)
    print("Grant Access to All Users Script")
    print("=" * 60)
    grant_access_to_all()
    print("=" * 60)
