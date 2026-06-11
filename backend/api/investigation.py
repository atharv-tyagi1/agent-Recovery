import os
import json
from fastapi import APIRouter, HTTPException
from api.scan import SCANS_DIR

router = APIRouter()

@router.get("/api/investigation/{scan_id}")
async def get_investigation(scan_id: str):
    cache_file = os.path.join(SCANS_DIR, f"{scan_id}.json")
    if not os.path.exists(cache_file):
        raise HTTPException(status_code=404, detail="Investigation data not found")
        
    with open(cache_file, 'r') as f:
        data = json.load(f)
        
    return {
        "timeline": data.get("timeline", []),
        # Mocking the live agent reasoning stats for completed scans
        "stats": {
            "model": "Qwen 3 480B",
            "tokensUsed": sum([v.get('confidence', 90) * 12 for v in data.get('vulnerabilities', [])]),
            "reasoningSteps": len(data.get("timeline", [])) * 3
        }
    }
