import requests
import time
import sys

base_url = "http://127.0.0.1:8000"
zip_path = r"c:\Users\ASUS\OneDrive\Desktop\agnet phantom\demo-repo.zip"

print("1. Uploading ZIP...")
with open(zip_path, "rb") as f:
    files = {"file": ("demo-repo.zip", f, "application/zip")}
    response = requests.post(f"{base_url}/api/upload", files=files)

if response.status_code != 200:
    print(f"Upload failed: {response.status_code} - {response.text}")
    sys.exit(1)

scan_id = response.json().get("scan_id")
print(f"Uploaded successfully. Scan ID: {scan_id}")

print("2. Starting Scan...")
scan_res = requests.post(f"{base_url}/api/scan/{scan_id}")
if scan_res.status_code != 200:
    print(f"Start scan failed: {scan_res.status_code} - {scan_res.text}")
    sys.exit(1)

print("3. Polling Status...")
while True:
    status_res = requests.get(f"{base_url}/api/status/{scan_id}")
    if status_res.status_code == 200:
        data = status_res.json()
        print(f"Status: {data.get('status')} - Progress: {data.get('progress')}% - Step: {data.get('current_step')}")
        if data.get('status') in ['COMPLETED', 'FAILED']:
            break
    else:
        print(f"Status check failed: {status_res.status_code}")
        break
    time.sleep(2)

print("4. Getting Results...")
results_res = requests.get(f"{base_url}/api/scan/{scan_id}/results")
if results_res.status_code == 200:
    results_data = results_res.json()
    vulns = results_data.get('vulnerabilities', [])
    print(f"Detected {len(vulns)} vulnerabilities.")
    for v in vulns:
        print(f" - {v.get('type')} in {v.get('file_path')} (Line {v.get('line_number')})")
else:
    print(f"Results check failed: {results_res.status_code} - {results_res.text}")

print("5. Getting Fixes...")
fixes_res = requests.get(f"{base_url}/api/fixes/{scan_id}")
if fixes_res.status_code == 200:
    fixes_data = fixes_res.json()
    print(f"Generated {len(fixes_data)} fixes.")
else:
    print(f"Fixes check failed: {fixes_res.status_code} - {fixes_res.text}")

print("6. Downloading PDF Report...")
pdf_res = requests.get(f"{base_url}/api/report/{scan_id}")
if pdf_res.status_code == 200:
    if pdf_res.headers.get('Content-Type') == 'application/pdf':
        print("PDF downloaded successfully.")
        with open("report.pdf", "wb") as f:
            f.write(pdf_res.content)
    else:
        print(f"Failed: Not a PDF, got {pdf_res.headers.get('Content-Type')}")
else:
    print(f"PDF download failed: {pdf_res.status_code} - {pdf_res.text}")

print("Done.")
