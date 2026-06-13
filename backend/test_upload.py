import httpx
import asyncio

async def test_upload():
    with open("../demo-repo.zip", "rb") as f:
        files = {"file": ("demo-repo.zip", f, "application/zip")}
        async with httpx.AsyncClient() as client:
            resp = await client.post("http://localhost:8000/api/upload", files=files)
            print(resp.status_code, resp.text)
            
            if resp.status_code == 200:
                scan_id = resp.json()["scan_id"]
                print(f"Scan ID: {scan_id}")
                
                # Start scan
                resp2 = await client.post(f"http://localhost:8000/api/scan/{scan_id}")
                print("Start scan:", resp2.status_code, resp2.text)
                
                # Poll status
                while True:
                    resp3 = await client.get(f"http://localhost:8000/api/status/{scan_id}")
                    if resp3.status_code == 200:
                        status = resp3.json()
                        print(f"Status: {status['status']}, Progress: {status['progress']}%")
                        if status["status"] in ["COMPLETED", "FAILED"]:
                            break
                    else:
                        print("Status check failed", resp3.status_code, resp3.text)
                        break
                    await asyncio.sleep(2)
                    
                # Second scan with SAME zip to check if restart is needed
                with open("../demo-repo.zip", "rb") as f2:
                    files2 = {"file": ("demo-repo.zip", f2, "application/zip")}
                    resp4 = await client.post("http://localhost:8000/api/upload", files=files2)
                    print("\nSecond upload:", resp4.status_code, resp4.text)
                    if resp4.status_code == 200:
                        scan_id2 = resp4.json()["scan_id"]
                        
                        resp5 = await client.post(f"http://localhost:8000/api/scan/{scan_id2}")
                        print("Start scan 2:", resp5.status_code, resp5.text)
                        
                        # Just do one status check
                        resp6 = await client.get(f"http://localhost:8000/api/status/{scan_id2}")
                        print("Scan 2 status:", resp6.json())

if __name__ == "__main__":
    asyncio.run(test_upload())
