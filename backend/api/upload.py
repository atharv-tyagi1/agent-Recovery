import os
import uuid
import shutil
import zipfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from database.db import get_db_connection

router = APIRouter()

STORAGE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(STORAGE_DIR, "storage", "uploads")
EXTRACTED_DIR = os.path.join(STORAGE_DIR, "storage", "extracted")

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
        
    # Extract ZIP
    extract_path = os.path.join(EXTRACTED_DIR, scan_id)
    os.makedirs(extract_path, exist_ok=True)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid or corrupted ZIP file.")
        
    # Create Database Record
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO scans (id, repository_name, status) VALUES (?, ?, ?)",
            (scan_id, repo_name, "PENDING")
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred.")
    finally:
        conn.close()
        
    return {"scan_id": scan_id}
