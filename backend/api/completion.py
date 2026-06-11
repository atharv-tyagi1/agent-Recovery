import os
import json
from fastapi import APIRouter, HTTPException
from api.scan import SCANS_DIR
from services.parser import get_all_files

router = APIRouter()

STORAGE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRACTED_DIR = os.path.join(STORAGE_DIR, "storage", "extracted")

@router.get("/api/completion/{scan_id}")
async def get_completion(scan_id: str):
    cache_file = os.path.join(SCANS_DIR, f"{scan_id}.json")
    if not os.path.exists(cache_file):
        raise HTTPException(status_code=404, detail="Completion data not found")
        
    with open(cache_file, 'r') as f:
        data = json.load(f)
        
    extract_path = os.path.join(EXTRACTED_DIR, scan_id)
    if os.path.exists(extract_path):
        root_dir = extract_path
        subdirs = os.listdir(extract_path)
        if len(subdirs) == 1 and os.path.isdir(os.path.join(extract_path, subdirs[0])):
            root_dir = os.path.join(extract_path, subdirs[0])
        files_analyzed = len(get_all_files(root_dir))
    else:
        files_analyzed = 0
        
    vulns = data.get("vulnerabilities", [])
    fixes = data.get("fixes", [])
    scores = data.get("scores", {})
    
    return {
        "files_analyzed": files_analyzed,
        "threats_found": len(vulns),
        "fixes_generated": len(fixes),
        "score_before": scores.get("score_before", 0),
        "score_after": scores.get("score_after", 0),
        "duration": "17.4s" # Mocking duration for MVP
    }
