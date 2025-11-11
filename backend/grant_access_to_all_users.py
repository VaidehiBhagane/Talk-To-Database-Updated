"""
Grant Business Unit Access to All Users
This script grants access to all business units for all existing users
"""
from app import create_app
from models import db
from models.user import User
from models.business_unit import BusinessUnit, UserBUAccess

def grant_access_to_all():
    """Grant all BU access to all users"""
    app = create_app()
    
    with app.app_context():
        try:
            # Get all users (excluding admin)
            users = User.query.filter_by(role='user').all()
            
            # Get all business units
            business_units = BusinessUnit.query.all()
            
            if not business_units:
                print("❌ No business units found in database")
                return
            
            print(f"📊 Found {len(users)} users and {len(business_units)} business units")
            print("\nGranting access...\n")
            
            for user in users:
                print(f"👤 User: {user.username} ({user.email})")
                
                for bu in business_units:
                    # Check if access already exists
                    existing_access = UserBUAccess.query.filter_by(
                        user_id=user.id,
                        bu_id=bu.id
                    ).first()
                    
                    if existing_access:
                        print(f"   ✓ Already has access to: {bu.name}")
                    else:
                        # Grant access
                        access = UserBUAccess(user_id=user.id, bu_id=bu.id)
                        db.session.add(access)
                        print(f"   ✅ Granted access to: {bu.name}")
                
                print()
            
            # Commit all changes
            db.session.commit()
            
            print("✅ Successfully granted access to all users!")
            
            # Summary
            total_access = UserBUAccess.query.count()
            print(f"\n📈 Total access records: {total_access}")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    grant_access_to_all()
