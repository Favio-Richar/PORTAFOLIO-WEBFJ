
import requests
import json

try:
    res = requests.get("http://localhost:8000/api/proyectos")
    print(f"STATUS: {res.status_code}")
    if res.ok:
        data = res.json()
        print(f"COUNT: {len(data)}")
        for i, item in enumerate(data):
            print(f"[{i+1}] {item.get('title')} ({item.get('category')}) - Year: {item.get('year')}")
            print(f"    Results: {item.get('results')}")
    else:
        print(f"ERROR: {res.text}")
except Exception as e:
    print(f"FAILED: {e}")
