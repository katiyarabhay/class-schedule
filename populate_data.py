
import json
import uuid

def create_id():
    return str(uuid.uuid4())

try:
    with open('data.json', 'r') as f:
        data = json.load(f)

    # 1. Ensure Subjects Exist
    # We'll use: BCA-4001, BCA-4004, BCA-5005, OLT5000P
    # Check if they exist, if not add them.
    existing_codes = {s['code']: s for s in data.get('subjects', [])}
    
    needed_subjects = [
        {"name": "Computer Graphics", "code": "BCA-4001", "type": "Theory", "credits": 4},
        {"name": "Python", "code": "BCA-4004", "type": "Theory", "credits": 4},
        {"name": "Major Project", "code": "BCA-5005", "type": "Theory", "credits": 6},
        {"name": "Web Design Lab", "code": "OLT5000P", "type": "Lab", "credits": 2}
    ]
    
    for ns in needed_subjects:
        if ns['code'] not in existing_codes:
            ns['id'] = create_id()
            ns['requiredBatches'] = []
            data['subjects'].append(ns)
            existing_codes[ns['code']] = ns

    # 2. Update Batches
    # Ensure at least one batch has these subjects required
    if not data['batches']:
        data['batches'].append({
            "id": create_id(),
            "name": "BCA 3C",
            "size": 40,
            "department": "BCA",
            "requiredSubjects": []
        })
    
    # Assign all 4 subjects to the first batch
    batch = data['batches'][0]
    batch['requiredSubjects'] = [existing_codes[code]['id'] for code in ["BCA-4001", "BCA-4004", "BCA-5005", "OLT5000P"]]
    print(f"Updated Batch '{batch['name']}' with {len(batch['requiredSubjects'])} subjects.")

    # 3. Update Teachers
    # Ensure we have teachers qualified for these subjects
    teachers = data['teachers']
    
    # Map Subject ID to Code for checking
    sub_id_to_code = {s['id']: s['code'] for s in data['subjects']}
    
    # Simple strategy: Assign one subject to each of the first 4 teachers found, or create new ones.
    # Reset qualifications for first few teachers to ensure coverage? 
    # Or just append a new super-teacher?
    
    # Let's add a new "Super Teacher" who can teach everything to guarantee feasibility for this demo
    super_teacher = {
        "id": create_id(),
        "name": "Demo Super Teacher",
        "department": "CS",
        "qualifiedSubjects": [existing_codes[code]['id'] for code in ["BCA-4001", "BCA-4004", "BCA-5005", "OLT5000P"]],
        "maxLoadPerDay": 4,
        "maxLoadPerWeek": 20,
        "preferredSlots": [],
        "unavailableSlots": []
    }
    data['teachers'].append(super_teacher)
    print("Added 'Demo Super Teacher' qualified for all subjects.")

    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)
        
    print("Data populated successfully.")

except Exception as e:
    print(f"Error: {e}")
