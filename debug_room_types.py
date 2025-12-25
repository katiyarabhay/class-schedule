
import json

try:
    with open('data.json', 'r') as f:
        data = json.load(f)
        
    print("Room Types:")
    for r in data.get('classrooms', []):
        print(f"  {r['name']}: {r.get('type', 'UNKNOWN')}")

except Exception as e:
    print(e)
