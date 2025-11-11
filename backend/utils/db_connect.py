import pymysql
from config import Config

def get_db_connection():
    """Create and return a database connection"""
    connection = pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )
    return connection

def execute_query(sql, params=None, schema=None):
    """
    Execute a SQL query and return results
    
    Args:
        sql: SQL query string
        params: Query parameters (for parameterized queries)
        schema: Database schema to use (for BU isolation)
    
    Returns:
        List of dictionaries containing query results
    """
    connection = None
    try:
        connection = get_db_connection()
        
        with connection.cursor() as cursor:
            # Set schema if provided (for BU isolation)
            if schema:
                cursor.execute(f"USE `{schema}`")
            
            # Execute the query
            if params:
                cursor.execute(sql, params)
            else:
                cursor.execute(sql)
            
            # Fetch results for SELECT queries
            if sql.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                return results
            else:
                # For INSERT, UPDATE, DELETE
                connection.commit()
                return {'affected_rows': cursor.rowcount}
                
    except Exception as e:
        if connection:
            connection.rollback()
        raise e
    finally:
        if connection:
            connection.close()

def test_connection():
    """Test database connection"""
    try:
        connection = get_db_connection()
        connection.close()
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
