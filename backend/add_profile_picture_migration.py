"""
Migration script to add profile_picture column to users table
"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'talk_to_database')

def run_migration():
    """Add profile_picture column to users table"""
    try:
        # Connect to database
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        
        cursor = connection.cursor()
        
        # Check if column already exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'profile_picture'
        """, (DB_NAME,))
        
        exists = cursor.fetchone()[0]
        
        if exists:
            print('✓ Profile picture column already exists')
        else:
            # Add the column
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN profile_picture TEXT NULL 
                AFTER role
            """)
            connection.commit()
            print('✓ Profile picture column added successfully')
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f'✗ Migration failed: {str(e)}')
        raise

if __name__ == '__main__':
    run_migration()
