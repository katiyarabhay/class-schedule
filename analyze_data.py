
import json

try:
    with open('data.json', 'r') as f:
        data = json.load(f)
        
    print(f"Subjects: {len(data.get('subjects', []))}")
    print(f"Teachers: {len(data.get('teachers', []))}")
    print(f"Batches: {len(data.get('batches', []))}")
    print(f"Classrooms: {len(data.get('classrooms', []))}")
    
    # Check Batch Requirements
    batches = data.get('batches', [])
    req_count = sum(len(b.get('requiredSubjects', [])) for b in batches)
    print(f"Total Batch Subject Requests: {req_count}")

    # Check Teacher Qualifications
    teachers = data.get('teachers', [])
    qual_count = sum(len(t.get('qualifiedSubjects', [])) for t in teachers)
    print(f"Total Teacher Qualifications: {qual_count}")

except Exception as e:
    print(e)
