import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.scan_manager import process_repository_zip, UPLOAD_DIR, EXTRACTED_DIR

router = APIRouter()

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EXTRACTED_DIR, exist_ok=True)

@router.post("/api/upload")
async def upload_repository(file: UploadFile = File(...)):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported.")
    
    scan_id = f"scan_{uuid.uuid4().hex[:12]}"
    repo_name = file.filename.replace('.zip', '')
    
    # Save ZIP
    zip_path = os.path.join(UPLOAD_DIR, f"{scan_id}.zip")
    with open(zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract, save to DB using scan manager
    try:
        return process_repository_zip(scan_id, repo_name, zip_path)
    except Exception as e:
        # If extraction/db fails, cleanup the uploaded zip
        if os.path.exists(zip_path):
            os.remove(zip_path)
        raise e
