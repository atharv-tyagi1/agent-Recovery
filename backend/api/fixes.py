import os
import json
from fastapi import APIRouter, HTTPException
from api.scan import SCANS_DIR

router = APIRouter()

@router.get("/api/fixes/{scan_id}")
async def get_fixes(scan_id: str):
    cache_file = os.path.join(SCANS_DIR, f"{scan_id}.json")
    if not os.path.exists(cache_file):
        from database.db import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT status FROM scans WHERE id = ?", (scan_id,))
        scan = cursor.fetchone()
        conn.close()
        if scan and scan['status'] in ["RATE_LIMITED", "FAILED"]:
            reason = "The free model is currently rate-limited. Please try again later." if scan['status'] == "RATE_LIMITED" else "Scan failed"
            raise HTTPException(status_code=400, detail=reason)
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
            "vulnerableCode": f.get('before') or f.get('before_code', ''),
            "fixedCode": f.get('after') or f.get('after_code', ''),
            "fixExplanation": f.get('why') or f.get('explanation', ''),
            "owasp": f.get('owasp', ''),
            "cwe": f.get('cwe', '')
        })
        
    return merged
