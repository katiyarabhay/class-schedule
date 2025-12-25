
import json

try:
    with open('data.json', 'r') as f:
        data = json.load(f)
        
    batch_size = data['batches'][0]['size']
    print(f"Batch Size: {batch_size}")
    
    rooms = data.get('classrooms', [])
    valid_rooms = [r for r in rooms if r['capacity'] >= batch_size]
    print(f"Total Rooms: {len(rooms)}")
    print(f"Rooms with capacity >= {batch_size}: {len(valid_rooms)}")
    for r in rooms:
        print(f"  {r['name']}: {r['capacity']}")

except Exception as e:
    print(e)
