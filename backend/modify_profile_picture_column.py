"""
Script to modify the profile_picture column to LONGTEXT
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

def modify_column():
    """Modify profile_picture column to LONGTEXT"""
    app = create_app()
    
    with app.app_context():
        try:
            # Execute raw SQL to modify column
            sql = "ALTER TABLE users MODIFY COLUMN profile_picture LONGTEXT NULL"
            db.session.execute(sql)
            db.session.commit()
            
            print("✓ Successfully modified profile_picture column to LONGTEXT")
            
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    print("=" * 60)
    print("Modify Profile Picture Column Script")
    print("=" * 60)
    modify_column()
    print("=" * 60)
