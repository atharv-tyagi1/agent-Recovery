import os
import json
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from api.scan import SCANS_DIR

STORAGE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS_DIR = os.path.join(STORAGE_DIR, "storage", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_pdf_report(scan_id: str) -> str:
    cache_file = os.path.join(SCANS_DIR, f"{scan_id}.json")
    if not os.path.exists(cache_file):
        raise FileNotFoundError("Scan data not found")
        
    with open(cache_file, 'r') as f:
        data = json.load(f)
        
    pdf_path = os.path.join(REPORTS_DIR, f"{scan_id}_report.pdf")
    
    # Very basic PDF generation for MVP
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 80, "Agent Phantom Security Report")
    
    c.setFont("Helvetica", 12)
    scores = data.get("scores", {})
    c.drawString(50, height - 130, f"Score Before: {scores.get('score_before')}")
    c.drawString(50, height - 150, f"Score After: {scores.get('score_after')}")
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 200, "Vulnerabilities Found:")
    
    y = height - 230
    c.setFont("Helvetica", 10)
    for v in data.get("vulnerabilities", []):
        c.drawString(50, y, f"- {v['severity'].upper()}: {v['type']} in {v['file_path']}")
        y -= 20
        if y < 50:
            c.showPage()
            y = height - 50
            
    c.save()
    
    return pdf_path
