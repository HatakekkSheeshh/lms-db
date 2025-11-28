"""
Azure Blob Storage utility for uploading files
"""
import os
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, ContentSettings
from dotenv import load_dotenv
import uuid
from datetime import datetime

load_dotenv()

class AzureBlobStorage:
    def __init__(self):
        """
        Initialize Azure Blob Storage client
        Requires AZURE_STORAGE_CONNECTION_STRING in .env
        """
        connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        if not connection_string:
            raise ValueError('AZURE_STORAGE_CONNECTION_STRING not found in environment variables')
        
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.container_name = 'assignment'  # Container name for assignments
    
    def ensure_container_exists(self):
        """Ensure the container exists, create if not"""
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            if not container_client.exists():
                container_client.create_container()
                print(f'Container {self.container_name} created')
        except Exception as e:
            print(f'Error ensuring container exists: {e}')
            raise
    
    def upload_assignment_file(self, file, course_id: str, filename: str = None) -> str:
        """
        Upload assignment PDF file to Azure Blob Storage
        
        Args:
            file: File object (from Flask request.files)
            course_id: Course ID to use as folder name
            filename: Optional custom filename. If not provided, uses original filename
        
        Returns:
            URL of the uploaded file
        """
        try:
            # Ensure container exists
            self.ensure_container_exists()
            
            # Use original filename if not provided
            if not filename:
                filename = file.filename if hasattr(file, 'filename') else f'assignment_{uuid.uuid4().hex[:8]}.pdf'
            
            # Ensure filename has .pdf extension
            if not filename.lower().endswith('.pdf'):
                filename += '.pdf'
            
            # Create blob path: assignment/{course_id}/{filename}
            blob_name = f"{course_id}/{filename}"
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            # Upload file with content type and content disposition headers
            # This ensures PDF opens in browser instead of downloading
            content_settings = ContentSettings(
                content_type='application/pdf',
                content_disposition='inline'  # Opens in browser instead of downloading
            )
            
            file.seek(0)  # Reset file pointer
            blob_client.upload_blob(
                file, 
                overwrite=True,
                content_settings=content_settings
            )
            
            # Construct and return the URL
            # Format: https://{storage_account}.blob.core.windows.net/{container}/{blob_name}
            # Extract storage account name from connection string if not provided
            storage_account = os.getenv('AZURE_STORAGE_ACCOUNT_NAME', 'hcmutlmstorage')
            # Try to extract from connection string if available
            connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING', '')
            if connection_string and 'AccountName=' in connection_string:
                try:
                    storage_account = connection_string.split('AccountName=')[1].split(';')[0]
                except:
                    pass
            url = f"https://{storage_account}.blob.core.windows.net/{self.container_name}/{blob_name}"
            
            print(f'File uploaded successfully: {url}')
            return url
            
        except Exception as e:
            print(f'Error uploading file to Azure Blob Storage: {e}')
            import traceback
            traceback.print_exc()
            raise
    
    def update_file_content_disposition(self, blob_name: str):
        """
        Update content disposition of an existing blob to 'inline' so it opens in browser
        
        Args:
            blob_name: Full blob path (e.g., "CO3001/filename.pdf")
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            # Get current blob properties
            properties = blob_client.get_blob_properties()
            
            # Update content settings to inline
            content_settings = ContentSettings(
                content_type=properties.content_settings.content_type or 'application/pdf',
                content_disposition='inline'
            )
            
            blob_client.set_http_headers(content_settings=content_settings)
            print(f'Updated content disposition to inline for: {blob_name}')
        except Exception as e:
            print(f'Error updating file content disposition: {e}')
            raise
    
    def delete_file(self, blob_name: str):
        """
        Delete a file from Azure Blob Storage
        
        Args:
            blob_name: Full blob path (e.g., "CO3001/filename.pdf")
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            blob_client.delete_blob()
            print(f'File deleted: {blob_name}')
        except Exception as e:
            print(f'Error deleting file: {e}')
            raise

# Singleton instance
_azure_storage = None

def get_azure_storage():
    """Get singleton Azure Blob Storage instance"""
    global _azure_storage
    if _azure_storage is None:
        _azure_storage = AzureBlobStorage()
    return _azure_storage

