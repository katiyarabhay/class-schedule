
import json

try:
    with open('data.json', 'r') as f:
        data = json.load(f)
        teachers = data.get('teachers', [])
        print(f"Total Teachers: {len(teachers)}")
        for t in teachers:
            qs = t.get('qualifiedSubjects', [])
            print(f"Teacher: {t.get('name')} - Qualified Subjects Count: {len(qs)}")
            if len(qs) > 0:
                print(f"  first subject: {qs[0]}")
except Exception as e:
    print(e)
