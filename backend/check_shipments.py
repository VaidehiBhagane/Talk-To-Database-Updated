import pymysql

conn = pymysql.connect(
    host='localhost', 
    user='root', 
    password='Vaidi@0712', 
    database='operations_dept'
)

cursor = conn.cursor()
cursor.execute('DESCRIBE shipments')
cols = cursor.fetchall()

print('\nshipments table structure:')
for col in cols:
    print(col)

conn.close()
