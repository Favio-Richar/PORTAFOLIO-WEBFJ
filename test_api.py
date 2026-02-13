
import requests
import json

try:
    res = requests.get("http://localhost:8000/api/proyectos")
    print(f"STATUS: {res.status_code}")
    if res.ok:
        data = res.json()
        print(f"COUNT: {len(data)}")
        if len(data) > 0:
            print("FIRST_ITEM_KEYS:", data[0].keys())
            print("FIRST_ITEM_DATA:", json.dumps(data[0], indent=2))
        else:
            print("DATABASE_IS_EMPTY")
    else:
        print(f"ERROR_RESPONSE: {res.text}")
except Exception as e:
    print(f"FETCH_FAILED: {e}")
