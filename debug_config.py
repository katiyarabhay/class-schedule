
import json

try:
    with open('data.json', 'r') as f:
        data = json.load(f)
        config = data.get('config', {})
        classrooms = data.get('classrooms', [])
        batches = data.get('batches', [])
        print(f"Days: {len(config.get('daysPerWeek', []))}")
        print(f"Slots per day: {config.get('slotsPerDay', 'UNKNOWN')}")
        print(f"Classrooms: {len(classrooms)}")
        print(f"Batches: {len(batches)}")
        print(f"Requests (approx): {sum(len(b.get('requiredSubjects', [])) for b in batches)}")
except Exception as e:
    print(e)
