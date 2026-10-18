"""
Test admin login directly
"""
import pymysql
import bcrypt

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='Vaidi@0712',
    database='talk_to_database',
    charset='utf8mb4'
)

cursor = conn.cursor()

# Get admin user
cursor.execute("SELECT id, username, email, password_hash, role FROM users WHERE username = 'admin'")
user = cursor.fetchone()

if user:
    print(f"Admin user found:")
    print(f"  ID: {user[0]}")
    print(f"  Username: {user[1]}")
    print(f"  Email: {user[2]}")
    print(f"  Password Hash: {user[3][:50]}...")
    print(f"  Role: {user[4]}")
    
    # Test password
    test_password = "Admin@123"
    password_hash = user[3].encode('utf-8')
    test_password_bytes = test_password.encode('utf-8')
    
    if bcrypt.checkpw(test_password_bytes, password_hash):
        print(f"\n✓ Password '{test_password}' is CORRECT!")
    else:
        print(f"\n✗ Password '{test_password}' is INCORRECT!")
        
        # Try to fix it
        new_hash = bcrypt.hashpw(test_password_bytes, bcrypt.gensalt())
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash.decode('utf-8'), user[0]))
        conn.commit()
        print("✓ Password has been reset to 'Admin@123'")
else:
    print("✗ Admin user not found!")

conn.close()
