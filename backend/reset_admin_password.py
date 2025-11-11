"""
Reset Admin Password Script
This script updates the admin user password in the database
"""
import bcrypt
from sqlalchemy import create_engine, text
from config import Config

def reset_admin_password():
    """Reset the admin user password"""
    try:
        # Create database connection
        engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
        
        # Generate new password hash
        password = "Admin@123"
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update admin user password
        with engine.connect() as conn:
            result = conn.execute(
                text("UPDATE users SET password_hash = :hash WHERE username = 'admin'"),
                {"hash": password_hash}
            )
            conn.commit()
            
            # Verify the update
            admin = conn.execute(
                text("SELECT id, username, email, role FROM users WHERE username = 'admin'")
            ).fetchone()
            
            if admin:
                print("✅ Admin password reset successfully!")
                print(f"   Username: admin")
                print(f"   Password: Admin@123")
                print(f"   Email: {admin[2]}")
                print(f"   Role: {admin[3]}")
                print(f"\n   Rows updated: {result.rowcount}")
            else:
                print("❌ Admin user not found in database")
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    reset_admin_password()
