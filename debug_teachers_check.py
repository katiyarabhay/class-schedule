
import json

try:
    with open('data.json', 'r') as f:
        data = json.load(f)
        teachers = data.get('teachers', [])
        zero_qual = [t['name'] for t in teachers if len(t.get('qualifiedSubjects', [])) == 0]
        print(f"Teachers with 0 qualified subjects: {len(zero_qual)}")
        for name in zero_qual:
            print(f"- {name}")
except Exception as e:
    print(e)
