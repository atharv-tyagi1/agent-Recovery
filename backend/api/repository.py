from api.scan import SCANS_DIR
import json
import os
from fastapi import APIRouter, HTTPException
from database.db import get_db_connection
from services.parser import build_file_tree, get_all_files

router = APIRouter()

STORAGE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRACTED_DIR = os.path.join(STORAGE_DIR, "storage", "extracted")

@router.get("/api/repository/{scan_id}")
async def get_repository_data(scan_id: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Check if scan exists
        cursor.execute("SELECT id, repository_name FROM scans WHERE id = ?", (scan_id,))
        scan = cursor.fetchone()
        
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
            
        # Get Vulnerabilities for file markers
        cursor.execute("SELECT id, severity, file_path, type FROM vulnerabilities WHERE scan_id = ?", (scan_id,))
        vulns = cursor.fetchall()
    finally:
        conn.close()

    extract_path = os.path.join(EXTRACTED_DIR, scan_id)
    if not os.path.exists(extract_path):
        raise HTTPException(status_code=404, detail="Extracted repository not found")

    # The actual repo is usually inside a single folder from the zip, let's find the root dir
    # For MVP, we will just use the extract_path itself
    root_dir = extract_path
    subdirs = os.listdir(extract_path)
    if len(subdirs) == 1 and os.path.isdir(os.path.join(extract_path, subdirs[0])):
        root_dir = os.path.join(extract_path, subdirs[0])

    tree = {
        "name": scan['repository_name'],
        "type": "folder",
        "children": build_file_tree(root_dir)
    }

    # Annotate tree with vulnerabilities
    # This is a simplified approach: in frontend we just need the `vulnerabilities` array on the file node.
    # The frontend already maps vulns to files. We can just send the tree and the list of vulns.
    
    def annotate(node, current_path=""):
        if node['type'] == 'file':
            node['vulnerabilities'] = [dict(v) for v in vulns if v['file_path'] == current_path]
        else:
            node['vulnerabilities'] = []
            for child in node.get('children', []):
                child_path = f"{current_path}/{child['name']}" if current_path else child['name']
                annotate(child, child_path)
    
    # Start annotation from the root's children, because the root itself represents the repo root ""
    tree['vulnerabilities'] = []
    for child in tree.get('children', []):
        annotate(child, child['name'])

    # Let's also send file_contents. For MVP, read all text files into a dict.
    # Warning: In real prod, don't send all files at once. But MVP requires it to match frontend.
    file_contents = {}
    all_files = get_all_files(root_dir)
    for f in all_files:
        rel_path = os.path.relpath(f, root_dir).replace('\\', '/')
        try:
            with open(f, 'r', encoding='utf-8') as file_data:
                content = file_data.read()
                file_contents[rel_path] = content
        except UnicodeDecodeError:
            file_contents[rel_path] = "// Binary file"


    cache_file = os.path.join(SCANS_DIR, f"{scan_id}.json")
    ai_available = True
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            cdata = json.load(f)
            ai_available = cdata.get("ai_available", True)
    return {
            "ai_available": ai_available,
        "tree": tree,
        "fileContents": file_contents
    }
