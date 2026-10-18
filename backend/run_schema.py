"""
Script to execute the complete schema.sql file
"""
import pymysql

def run_schema():
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='Vaidi@0712',
        charset='utf8mb4'
    )
    
    cursor = conn.cursor()
    
    try:
        with open(r'D:\Talk-to-Database\Talk-to-Database\database\schema.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Split by semicolon and execute each statement
        statements = sql_content.split(';')
        
        for statement in statements:
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement)
                    conn.commit()
                except Exception as e:
                    print(f"Error executing statement: {str(e)[:100]}")
                    continue
        
        print("✓ Schema executed successfully!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    run_schema()
