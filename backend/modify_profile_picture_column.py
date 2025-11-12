"""
Migration script to modify profile_picture column to LONGTEXT
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
    """Modify profile_picture column to LONGTEXT"""
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
        
        # Modify the column to LONGTEXT
        cursor.execute("""
            ALTER TABLE users 
            MODIFY COLUMN profile_picture LONGTEXT NULL
        """)
        connection.commit()
        print('✓ Profile picture column modified to LONGTEXT successfully')
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f'✗ Migration failed: {str(e)}')
        raise

if __name__ == '__main__':
    run_migration()
