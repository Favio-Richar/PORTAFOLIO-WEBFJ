import requests, traceback
try:
    r = requests.get('http://localhost:8000/api/proposals/', headers={'Origin': 'http://localhost:3000'})
    open('err_full.txt', 'w').write(f"Status: {r.status_code}\nText: {r.text}")
except Exception as e:
    open('err_full.txt', 'w').write(traceback.format_exc())
