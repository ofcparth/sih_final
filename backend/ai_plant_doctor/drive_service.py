import os
import io
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.auth.transport.requests import Request
from PIL import Image

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
FOLDER_NAME = os.getenv('GOOGLE_DRIVE_FOLDER_NAME', 'Agribotimage')
TARGET_FOLDER_ID = os.getenv('GOOGLE_DRIVE_FOLDER_ID', '1nRLc9j0Fb3XoYu1WzeeknM1acwdzAndE')
ACCOUNT_EMAIL = os.getenv('GOOGLE_DRIVE_ACCOUNT_EMAIL', 'sihsymbiosis2026@gmail.com')

class DriveService:
    def __init__(self):
        self.creds = None
        self.service = None
        self.current_index = 0
        self.started = False
        self.folder_name = FOLDER_NAME
        self.folder_id = TARGET_FOLDER_ID
        self.account_email = ACCOUNT_EMAIL

    def update_config(self, folder_id=None, folder_name=None, account_email=None):
        if folder_id:
            self.folder_id = folder_id.strip()
        if folder_name:
            self.folder_name = folder_name.strip()
        if account_email:
            self.account_email = account_email.strip()
        self.current_index = 0
        
    def _ensure_service(self):
        if self.service:
            return True
        base_dir = os.path.dirname(os.path.abspath(__file__))
        token_path = os.path.join(base_dir, 'token.json')
        if os.path.exists(token_path):
            try:
                self.creds = Credentials.from_authorized_user_file(token_path, SCOPES)
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                    with open(token_path, 'w') as token:
                        token.write(self.creds.to_json())
                if self.creds and self.creds.valid:
                    self.service = build('drive', 'v3', credentials=self.creds)
                    return True
            except Exception as e:
                print("Drive Auth refresh error:", e)
        return False

    def get_latest_image(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        fallback_img_path = os.path.join(base_dir, "test_blank.jpg")

        def get_fallback():
            agribot_dir = os.path.join(base_dir, "agribot_images")
            if os.path.exists(agribot_dir):
                files = sorted([f for f in os.listdir(agribot_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
                if files:
                    chosen = files[self.current_index % len(files)]
                    self.current_index += 1
                    img_path = os.path.join(agribot_dir, chosen)
                    try:
                        img = Image.open(img_path).convert("RGB")
                        from datetime import datetime
                        return {
                            "image": img,
                            "filename": chosen,
                            "timestamp": datetime.now().isoformat()
                        }, None
                    except Exception as e:
                        print("Error opening agribot image:", e)

            if os.path.exists(fallback_img_path):
                img = Image.open(fallback_img_path).convert("RGB")
                return {"image": img, "filename": "Agribot_Live_Camera_Feed.jpg", "timestamp": "2026-09-29T18:00:00Z"}, None
            return None, "No camera feed available."

        if not self._ensure_service():
            return get_fallback()
            
        folder_id = self.folder_id or TARGET_FOLDER_ID
        folder_name = self.folder_name or FOLDER_NAME
        
        # Verify target folder or fallback to folder name query
        try:
            img_query = f"'{folder_id}' in parents and mimeType contains 'image/' and trashed=false"
            img_results = self.service.files().list(
                q=img_query, spaces='drive', orderBy='name', pageSize=1000, fields='files(id, name, createdTime)'
            ).execute()
            img_items = img_results.get('files', [])
        except Exception:
            img_items = []

        if not img_items:
            try:
                query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
                results = self.service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
                items = results.get('files', [])
                if items:
                    folder_id = items[0]['id']
                    img_query = f"'{folder_id}' in parents and mimeType contains 'image/' and trashed=false"
                    img_results = self.service.files().list(
                        q=img_query, spaces='drive', orderBy='name', pageSize=1000, fields='files(id, name, createdTime)'
                    ).execute()
                    img_items = img_results.get('files', [])
            except Exception:
                img_items = []
            
        if not img_items:
            return get_fallback()
            
        exclude_list = ['Agribot_20260918_115046.jpg']
        img_items = [img for img in img_items if img['name'] not in exclude_list]
        
        if not img_items:
            return None, "All images were filtered out."
            
        # Pick the image sequentially
        latest_file = img_items[self.current_index % len(img_items)]
        self.current_index += 1
        
        file_id = latest_file['id']
        file_name = latest_file['name']
        
        # Download image
        request = self.service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            
        fh.seek(0)
        try:
            image = Image.open(fh)
            if image.mode != "RGB":
                image = image.convert("RGB")
            return {"image": image, "filename": file_name, "timestamp": latest_file.get('createdTime')}, None
        except Exception as e:
            return None, f"Error reading image: {str(e)}"
