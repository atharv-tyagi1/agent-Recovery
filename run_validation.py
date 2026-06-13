import requests
import time
import sys

def run_flow():
    print("Uploading demo-repo.zip...")
    with open('demo-repo.zip', 'rb') as f:
        r = requests.post('http://127.0.0.1:8000/api/upload', files={'file': f})
    
    if r.status_code != 200:
        print(f"Upload failed: {r.text}")
        return False
        
    scan_id = r.json()['scan_id']
    print(f"Scan ID: {scan_id}")
    
    print("Starting scan...")
    r = requests.post(f'http://127.0.0.1:8000/api/scan/{scan_id}')
    if r.status_code != 200:
        print(f"Start scan failed: {r.text}")
        return False
        
    print("Polling status...")
    status_history = []
    
    while True:
        r = requests.get(f'http://127.0.0.1:8000/api/status/{scan_id}')
        data = r.json()
        status = data.get('status')
        if not status_history or status_history[-1] != status:
            status_history.append(status)
            print(f"Status transition: {' -> '.join(status_history)}")
            
        if status in ['COMPLETED', 'FAILED', 'RATE_LIMITED']:
            break
        time.sleep(2)
        
    print(f"\nFinal status: {status}")
    if status == 'COMPLETED':
        print("\nChecking frontend endpoints...")
        
        inv = requests.get(f'http://127.0.0.1:8000/api/investigation/{scan_id}')
        print(f"Investigation page: {inv.status_code}")
        
        rep = requests.get(f'http://127.0.0.1:8000/api/repository/{scan_id}')
        print(f"Repository page: {rep.status_code}")
        
        fix = requests.get(f'http://127.0.0.1:8000/api/fixes/{scan_id}')
        print(f"Fixes page: {fix.status_code}")
        
        comp = requests.get(f'http://127.0.0.1:8000/api/completion/{scan_id}')
        print(f"Completion page: {comp.status_code}")
        
        return True
    elif status == 'RATE_LIMITED':
        print("Rate limited, will try again after 30 seconds...")
        time.sleep(30)
        return False
    else:
        print("Failed.")
        return False

while True:
    if run_flow():
        break
