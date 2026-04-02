import requests
r = requests.get('http://localhost:8000/api/proposals/', headers={'Origin': 'http://localhost:3000'})
print(r.json())
