import os
import re
import uuid
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.scan_manager import process_repository_zip, UPLOAD_DIR

router = APIRouter()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
MAX_DOWNLOAD_SIZE_MB = 500
MAX_DOWNLOAD_BYTES = MAX_DOWNLOAD_SIZE_MB * 1024 * 1024

class GithubScanRequest(BaseModel):
    url: str

@router.post("/api/github-scan")
async def github_scan(request: GithubScanRequest):
    # Validate GitHub URL
    # Match https://github.com/owner/repo ignoring trailing .git, subpaths, etc.
    match = re.match(r"^https?://(?:www\.)?github\.com/([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+)", request.url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL.")
        
    owner, repo = match.groups()
    if repo.endswith(".git"):
        repo = repo[:-4]
        
    scan_id = f"scan_{uuid.uuid4().hex[:12]}"
    repo_name = f"{owner}/{repo}"
    
    zip_url = f"https://api.github.com/repos/{owner}/{repo}/zipball"
    zip_path = os.path.join(UPLOAD_DIR, f"{scan_id}.zip")
    
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            async with client.stream("GET", zip_url, headers=headers) as response:
                if response.status_code == 404:
                    raise HTTPException(status_code=404, detail="Repository Not Found or Private Repository.")
                if response.status_code == 403:
                    # Check for rate limit
                    limit_remaining = response.headers.get("x-ratelimit-remaining")
                    if limit_remaining == "0" or "API rate limit exceeded" in str(response.read()):
                        raise HTTPException(status_code=429, detail="GitHub Rate Limit Exceeded.")
                    raise HTTPException(status_code=403, detail="Access Forbidden to repository.")
                
                response.raise_for_status()
                
                downloaded_size = 0
                with open(zip_path, "wb") as buffer:
                    async for chunk in response.aiter_bytes():
                        downloaded_size += len(chunk)
                        if downloaded_size > MAX_DOWNLOAD_BYTES:
                            raise HTTPException(status_code=413, detail=f"Repository exceeds maximum size limit of {MAX_DOWNLOAD_SIZE_MB}MB.")
                        buffer.write(chunk)
                        
    except HTTPException:
        if os.path.exists(zip_path):
            os.remove(zip_path)
        raise
    except httpx.RequestError as e:
        if os.path.exists(zip_path):
            os.remove(zip_path)
        raise HTTPException(status_code=500, detail="Failed to connect to GitHub API.")
    except Exception as e:
        if os.path.exists(zip_path):
            os.remove(zip_path)
        raise HTTPException(status_code=500, detail=str(e))
        
    # Extract, save to DB using scan manager
    try:
        return process_repository_zip(scan_id, repo_name, zip_path)
    except Exception as e:
        if os.path.exists(zip_path):
            os.remove(zip_path)
        raise e
