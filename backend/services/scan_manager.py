import os
import shutil
import zipfile
from fastapi import HTTPException
from database.db import get_db_connection

STORAGE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(STORAGE_DIR, "storage", "uploads")
EXTRACTED_DIR = os.path.join(STORAGE_DIR, "storage", "extracted")

MAX_UNCOMPRESSED_SIZE = 1 * 1024 * 1024 * 1024  # 1GB

def process_repository_zip(scan_id: str, repository_name: str, zip_path: str):
    """
    Validates, safely extracts, and creates a database record for a repository ZIP.
    Protects against Zip Slip and Zip Bombs.
    """
    extract_path = os.path.join(EXTRACTED_DIR, scan_id)
    os.makedirs(extract_path, exist_ok=True)
    
    try:
        total_size = 0
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for info in zip_ref.infolist():
                # 1. Zip Bomb Protection
                total_size += info.file_size
                if total_size > MAX_UNCOMPRESSED_SIZE:
                    raise HTTPException(status_code=400, detail="Zip archive exceeds extraction limit of 1GB.")
                
                # 2. Zip Slip Protection
                # Ensure the path does not traverse out of the extraction directory
                target_path = os.path.abspath(os.path.join(extract_path, info.filename))
                if not target_path.startswith(os.path.abspath(extract_path)):
                    raise HTTPException(status_code=400, detail="Invalid archive structure (Path Traversal attempted).")
                
                # Safe extraction of the single file/dir
                zip_ref.extract(info, extract_path)
                
    except zipfile.BadZipFile:
        # Cleanup partial extraction
        if os.path.exists(extract_path):
            shutil.rmtree(extract_path)
        raise HTTPException(status_code=400, detail="Invalid or corrupted ZIP file.")
    except HTTPException:
        # Cleanup on our custom exceptions (bomb/slip)
        if os.path.exists(extract_path):
            shutil.rmtree(extract_path)
        raise
    except Exception as e:
        if os.path.exists(extract_path):
            shutil.rmtree(extract_path)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

    # Create Database Record
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO scans (id, repository_name, status) VALUES (?, ?, ?)",
            (scan_id, repository_name, "PENDING")
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        # Cleanup
        if os.path.exists(extract_path):
            shutil.rmtree(extract_path)
        raise HTTPException(status_code=500, detail=f"Database error occurred: {e}")
    finally:
        conn.close()

    return {"scan_id": scan_id}
