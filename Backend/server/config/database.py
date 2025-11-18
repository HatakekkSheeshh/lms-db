import pymssql
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConfig:
    def __init__(self):
        """
        Load environment variables from .env file
        Fallback to localhost if not set
        """
        self.server = os.getenv('DB_SERVER', 'localhost')
        self.port = int(os.getenv('DB_PORT', '1433'))
        self.database = os.getenv('DB_DATABASE', 'lms_system')
        self.username = os.getenv('DB_USER', 'sa')
        self.password = os.getenv('DB_PASSWORD', '')

        """     
        print(f'Server: {self.server}')
        print(f'Port: {self.port}')
        print(f'Database: {self.database}')
        print(f'Username: {self.username}')
        print(f'Password: {self.password}') 
        """
    
    def get_connection(self):
        try:
            conn = pymssql.connect(
                server=self.server,
                port=self.port,
                user=self.username,
                password=self.password,
                database=self.database
            )
            return conn
        except Exception as e:
            print(f'❌ Database connection error: {e}')
            raise e

db_config = DatabaseConfig()

def get_db_connection():
    return db_config.get_connection()
