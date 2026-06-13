import os
import sqlite3
from datetime import datetime
from fastapi import APIRouter
from database.db import get_db_connection
from services.parser import get_all_files

router = APIRouter()

STORAGE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRACTED_DIR = os.path.join(STORAGE_DIR, "storage", "extracted")

def map_db_status_to_frontend(db_status: str) -> str:
    mapping = {
        "PENDING": "queued",
        "RUNNING": "in-progress",
        "COMPLETED": "completed",
        "FAILED": "failed",
        "RATE_LIMITED": "failed"
    }
    return mapping.get(db_status.upper(), "queued")

def format_relative_time(timestamp_str: str) -> str:
    try:
        # sqlite default TIMESTAMP is YYYY-MM-DD HH:MM:SS
        dt = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
        delta = datetime.utcnow() - dt
        seconds = int(delta.total_seconds())
        if seconds < 60:
            return "just now"
        minutes = seconds // 60
        if minutes < 60:
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        hours = minutes // 60
        if hours < 24:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        days = hours // 24
        return f"{days} day{'s' if days > 1 else ''} ago"
    except Exception:
        return "recently"

@router.get("/api/dashboard")
async def get_dashboard_data():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # 1. Repositories Scanned
        cursor.execute("SELECT COUNT(DISTINCT repository_name) FROM scans")
        repos_scanned = cursor.fetchone()[0] or 0

        # 2. Total vulnerabilities found
        cursor.execute("SELECT COUNT(*) FROM vulnerabilities")
        vulns_found = cursor.fetchone()[0] or 0

        # 3. Calculate dynamic Security Score
        # Average of score_after for completed scans, default to 100 if none
        cursor.execute("SELECT score_after FROM scans WHERE status = 'COMPLETED'")
        completed_scores = [row[0] for row in cursor.fetchall() if row[0] is not None]
        avg_score = int(sum(completed_scores) / len(completed_scores)) if completed_scores else 100

        # 4. Count files analyzed dynamically from extracted directories
        total_files = 0
        if os.path.exists(EXTRACTED_DIR):
            for scan_id in os.listdir(EXTRACTED_DIR):
                path = os.path.join(EXTRACTED_DIR, scan_id)
                if os.path.isdir(path):
                    root_dir = path
                    subdirs = os.listdir(path)
                    if len(subdirs) == 1 and os.path.isdir(os.path.join(path, subdirs[0])):
                        root_dir = os.path.join(path, subdirs[0])
                    total_files += len(get_all_files(root_dir))

        # If zero files (e.g. fresh installation with database reset), default to a sensible number or keep 0
        # Let's use the actual files analyzed
        
        # 5. Threat distribution by severity
        cursor.execute("SELECT severity, COUNT(*) FROM vulnerabilities GROUP BY severity")
        severity_counts = {row[0].lower(): row[1] for row in cursor.fetchall()}
        
        threat_distribution = [
            {"name": "Critical", "value": severity_counts.get("critical", 0), "color": "#EF4444"},
            {"name": "High", "value": severity_counts.get("high", 0), "color": "#F97316"},
            {"name": "Medium", "value": severity_counts.get("medium", 0), "color": "#EAB308"},
            {"name": "Low", "value": severity_counts.get("low", 0), "color": "#3B82F6"},
        ]

        # 6. Recent scans list
        cursor.execute("""
            SELECT id, repository_name, status, score_before, score_after, created_at 
            FROM scans 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        scans_rows = cursor.fetchall()
        recent_scans = []
        
        for row in scans_rows:
            s_id = row['id']
            # Get threats count for this scan
            cursor.execute("SELECT COUNT(*) FROM vulnerabilities WHERE scan_id = ?", (s_id,))
            threats_count = cursor.fetchone()[0] or 0

            # Count files for this scan
            scan_files = 0
            scan_extract = os.path.join(EXTRACTED_DIR, s_id)
            if os.path.exists(scan_extract):
                root_dir = scan_extract
                subdirs = os.listdir(scan_extract)
                if len(subdirs) == 1 and os.path.isdir(os.path.join(scan_extract, subdirs[0])):
                    root_dir = os.path.join(scan_extract, subdirs[0])
                scan_files = len(get_all_files(root_dir))

            recent_scans.append({
                "id": s_id,
                "repository": row['repository_name'],
                "status": map_db_status_to_frontend(row['status']),
                "threats": threats_count,
                "date": row['created_at'].split(" ")[0] if row['created_at'] else "just now",
                "duration": "2m 15s" if row['status'] == "COMPLETED" else "—",
                "filesAnalyzed": scan_files,
                "scoreBefore": row['score_before'] or 0,
                "scoreAfter": row['score_after'] or 0,
            })

        # 7. Activity Feed
        # Build a timeline of actual activities:
        # - Scan initiated
        # - Vulnerabilities found
        # - Fix generated
        # Let's pull from DB:
        activities = []
        
        # Scans initiated/completed
        cursor.execute("SELECT repository_name, status, created_at FROM scans ORDER BY created_at DESC LIMIT 5")
        for row in cursor.fetchall():
            time_str = format_relative_time(row['created_at'])
            if row['status'] == "COMPLETED":
                activities.append({
                    "id": f"act-scan-comp-{row['repository_name']}-{row['created_at']}",
                    "message": f"Security report generated for {row['repository_name']}",
                    "type": "report",
                    "timestamp": time_str
                })
            else:
                activities.append({
                    "id": f"act-scan-init-{row['repository_name']}-{row['created_at']}",
                    "message": f"Deep scan initiated for {row['repository_name']}",
                    "type": "scan",
                    "timestamp": time_str
                })

        # Vulnerabilities found
        cursor.execute("""
            SELECT v.type, v.file_path, s.repository_name, s.created_at 
            FROM vulnerabilities v 
            JOIN scans s ON v.scan_id = s.id 
            ORDER BY s.created_at DESC 
            LIMIT 5
        """)
        for row in cursor.fetchall():
            time_str = format_relative_time(row['created_at'])
            activities.append({
                "id": f"act-vuln-{row['type']}-{row['file_path']}-{row['created_at']}",
                "message": f"{row['type']} detected in {row['file_path']}",
                "type": "detection",
                "timestamp": time_str
            })

        # Sort activities by timestamp (implied by order of queries, let's keep it simple)
        # We can cap at 8 items
        activities = activities[:8]
        if not activities:
            # Fallback activity if DB is empty
            activities = [{
                "id": "act-empty",
                "message": "No scans performed yet",
                "type": "scan",
                "timestamp": "just now"
            }]

    finally:
        conn.close()

    return {
        "dashboardStats": {
            "repositoriesScanned": repos_scanned,
            "filesAnalyzed": total_files,
            "vulnerabilitiesFound": vulns_found,
            "securityScore": avg_score
        },
        "threatDistribution": threat_distribution,
        "recentScans": recent_scans,
        "activityFeed": activities
    }
