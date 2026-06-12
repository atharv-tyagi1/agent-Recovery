import httpx
import asyncio

async def test_github():
    print("Running Validation Suite...")
    base_url = "http://127.0.0.1:8000/api/github-scan"
    
    tests = [
        {"name": "Valid Public Repo", "url": "https://github.com/octocat/Hello-World"},
        {"name": "Valid Repo with .git", "url": "https://github.com/octocat/Hello-World.git"},
        {"name": "Malformed URL", "url": "https://github.com/octocat"},
        {"name": "Not Found / Private", "url": "https://github.com/octocat/ThisRepoDoesNotExist12345"},
    ]
    
    async with httpx.AsyncClient(timeout=30) as client:
        for t in tests:
            print(f"\n--- Testing: {t['name']} ---")
            print(f"URL: {t['url']}")
            try:
                res = await client.post(base_url, json={"url": t["url"]})
                print(f"Status: {res.status_code}")
                print(f"Response: {res.text}")
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_github())
