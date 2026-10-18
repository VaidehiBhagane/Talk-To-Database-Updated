"""
Migration script to add profile_picture column
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from config import config
from models import db

def create_app():
    """Create Flask app"""
    app = Flask(__name__)
    app.config.from_object(config['default'])
    db.init_app(app)
    return app

def add_profile_picture():
    """Add profile_picture column to users table"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column exists
            result = db.session.execute(
                "SHOW COLUMNS FROM users LIKE 'profile_picture'"
            )
            
            if result.fetchone():
                print("✓ profile_picture column already exists")
            else:
                # Add column
                db.session.execute(
                    "ALTER TABLE users ADD COLUMN profile_picture LONGTEXT NULL"
                )
                db.session.commit()
                print("✓ Successfully added profile_picture column")
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    print("=" * 60)
    print("Add Profile Picture Column Migration")
    print("=" * 60)
    add_profile_picture()
    print("=" * 60)
