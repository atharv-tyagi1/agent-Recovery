import requests
import time
import sys
import os

base_url = "http://127.0.0.1:8000"
zip_path = r"c:\Users\ASUS\OneDrive\Desktop\agnet phantom\demo-repo.zip"

print("--- ERROR TESTING ---")
# Invalid ZIP
print("Testing invalid file extension upload...")
res = requests.post(f"{base_url}/api/upload", files={"file": ("test.txt", b"not a zip", "text/plain")})
print("Result:", res.status_code, res.text)
assert res.status_code == 400

# Corrupted ZIP
print("Testing corrupted ZIP upload...")
res = requests.post(f"{base_url}/api/upload", files={"file": ("corrupt.zip", b"PK1234notrealzip", "application/zip")})
print("Result:", res.status_code, res.text)
assert res.status_code == 400

# Missing scan_id
print("Testing missing scan_id...")
res = requests.post(f"{base_url}/api/scan/invalid_id_123")
print("Result:", res.status_code, res.text)
assert res.status_code == 404

print("--- HAPPY PATH TESTING ---")
print("1. Uploading valid ZIP...")
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
assert scan_res.status_code == 200

print("3. Polling Status...")
while True:
    status_res = requests.get(f"{base_url}/api/status/{scan_id}")
    if status_res.status_code == 200:
        data = status_res.json()
        print(f"Status: {data.get('status')} - Progress: {data.get('progress')}%")
        if data.get('status') in ['COMPLETED', 'FAILED']:
            break
    else:
        print(f"Status check failed: {status_res.status_code}")
        break
    time.sleep(2)

print("4. Getting Results...")
results_res = requests.get(f"{base_url}/api/scan/{scan_id}/results")
assert results_res.status_code == 200
results_data = results_res.json()
vulns = results_data.get('vulnerabilities', [])
print(f"Detected {len(vulns)} vulnerabilities.")
for v in vulns:
    print(f" - [{v.get('severity')}] {v.get('type')} in {v.get('file_path')} (Line {v.get('line_number')})")

print("5. Getting Fixes...")
fixes_res = requests.get(f"{base_url}/api/fixes/{scan_id}")
assert fixes_res.status_code == 200
fixes_data = fixes_res.json()
print(f"Generated {len(fixes_data)} fixes.")

print("6. Getting Investigation (Timeline)...")
# Note: actually Timeline is returned in results as part of the JSON cache, but we didn't expose it explicitly via a timeline endpoint.
# Wait, let's just check if it works. Let's check Completion page endpoint:
completion_res = requests.get(f"{base_url}/api/completion/{scan_id}")
if completion_res.status_code == 200:
    print("Completion API works.")
else:
    print("Completion API failed:", completion_res.status_code)

print("7. Downloading PDF Report (Old Route)...")
pdf_res_old = requests.get(f"{base_url}/api/reports/{scan_id}/pdf")
assert pdf_res_old.status_code == 200
assert pdf_res_old.headers.get('Content-Type') == 'application/pdf'
print("PDF Old Route works.")

print("8. Downloading PDF Report (New Route)...")
pdf_res_new = requests.get(f"{base_url}/api/report/{scan_id}")
assert pdf_res_new.status_code == 200
assert pdf_res_new.headers.get('Content-Type') == 'application/pdf'
print("PDF New Route works.")

print("All End-To-End validations completed successfully!")
