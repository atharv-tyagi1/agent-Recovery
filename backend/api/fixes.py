import os
import json
from fastapi import APIRouter, HTTPException
from api.scan import SCANS_DIR

router = APIRouter()

@router.get("/api/fixes/{scan_id}")
async def get_fixes(scan_id: str):
    cache_file = os.path.join(SCANS_DIR, f"{scan_id}.json")
    if not os.path.exists(cache_file):
        raise HTTPException(status_code=404, detail="Fixes data not found")
        
    with open(cache_file, 'r') as f:
        data = json.load(f)
        
    # Format fixes to match the frontend expectations
    # The frontend expects a list of vulnerabilities where each contains vulnerableCode, fixedCode, fixExplanation, riskReduction, etc.
    fixes = data.get("fixes", [])
    vulns = data.get("vulnerabilities", [])
    
    # Merge for frontend
    merged = []
    for f in fixes:
        v = next((v for v in vulns if v['id'] == f['vulnerability_id']), None)
        if not v:
            continue
            
        merged.append({
            "id": f['id'],
            "title": f.get('title', v['type']),
            "severity": f.get('severity', v['severity']),
            "file": f.get('file', v['file_path']),
            "confidence": v.get('confidence', 95),
            "riskReduction": 20 if v['severity'] == 'critical' else 10,
            "vulnerableCode": f['before_code'],
            "fixedCode": f['after_code'],
            "fixExplanation": f['explanation'],
            "owasp": f['owasp'],
            "cwe": f['cwe']
        })
        
    return merged
