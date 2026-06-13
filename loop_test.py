import httpx
import time

headers = {
    'Authorization': 'Bearer sk-or-v1-YOUR_KEY_HERE',
    'Content-Type': 'application/json'
}
payload = {
    'model': 'qwen/qwen3-coder:free',
    'messages': [{'role': 'user', 'content': 'hello'}]
}

while True:
    try:
        r = httpx.post('https://openrouter.ai/api/v1/chat/completions', headers=headers, json=payload, timeout=30.0)
        print("Status Code:", r.status_code)
        if r.status_code == 200:
            print("Success!")
            print(r.text)
            break
        elif r.status_code == 429:
            data = r.json()
            delay = data.get('error', {}).get('metadata', {}).get('retry_after_seconds', 5)
            print(f"Rate limited, sleeping for {delay} seconds")
            time.sleep(float(delay) + 1.0)
        else:
            print("Unknown status:", r.status_code, r.text)
            break
    except Exception as e:
        print("Error:", e)
        time.sleep(5)
