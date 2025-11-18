import sys
import io
from config.database import get_db_connection

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print('Testing SQL Server connection with Python...')
print('=' * 50)

try:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Test query
    cursor.execute('SELECT @@VERSION as version')
    result = cursor.fetchone()

    print('\n[OK] Connection successful!')
    print('\nSQL Server Version:')
    print(result[0] if result else 'N/A')

    # Try to check database
    cursor.execute("""
        SELECT name
        FROM sys.databases
        WHERE name = 'lms_system'
    """)

    database = cursor.fetchone()

    if database:
        print('\n[OK] Database "lms_system" found!')
    else:
        print('\n[WARNING] Database "lms_system" not found!')

    conn.close()
    print('\n[OK] Connection test completed successfully')

except Exception as e:
    print(f'\n[ERROR] Connection failed!')
    print(f'Error details: {e}')
    print('\nPlease check:')
    print('1. SQL Server is running')
    print('2. ODBC Driver 17 for SQL Server is installed')
    print('3. The credentials in .env file are correct')
    print('4. Port 1433 is not blocked by firewall')
