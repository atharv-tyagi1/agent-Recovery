from api.scan import SCANS_DIR
import json
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.report_generator import generate_pdf_report

router = APIRouter()

@router.get("/api/report/{scan_id}")
@router.get("/api/reports/{scan_id}/pdf")
async def get_report(scan_id: str):
    try:
        pdf_path = generate_pdf_report(scan_id)
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
        return FileResponse(pdf_path, media_type='application/pdf', filename=f"Agent_Phantom_Report_{scan_id}.pdf")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scan data not found")
