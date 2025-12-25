
import json
import uuid

def create_id():
    return str(uuid.uuid4())

# Valid Subjects
subjects = [
    {"id": create_id(), "name": "Computer Graphics", "code": "BCA-4001", "type": "Theory", "credits": 4, "requiredBatches": []},
    {"id": create_id(), "name": "Python", "code": "BCA-4004", "type": "Theory", "credits": 4, "requiredBatches": []},
    {"id": create_id(), "name": "Major Project", "code": "BCA-5005", "type": "Theory", "credits": 4, "requiredBatches": []}, # Reduced to 4 for ease
    {"id": create_id(), "name": "Web Design Lab", "code": "OLT5000P", "type": "Lab", "credits": 2, "requiredBatches": []}
]

# Valid Teacher (Matches all)
teacher = {
    "id": create_id(),
    "name": "Super Teacher",
    "department": "CS",
    "qualifiedSubjects": [s['id'] for s in subjects],
    "maxLoadPerDay": 6,  # Increased to ensure feasibility
    "maxLoadPerWeek": 30, # Increased
    "preferredSlots": [],
    "unavailableSlots": []
}

# Valid Batch (Requires all)
batch = {
    "id": create_id(),
    "name": "BCA 3C",
    "size": 40,
    "department": "BCA",
    "requiredSubjects": [s['id'] for s in subjects]
}

# Config
config = {
    "daysPerWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "slotsPerDay": 8,
    "breakAfter": 4
}

# Classrooms
classrooms = [
    {"id": create_id(), "name": "Room 101", "capacity": 50, "type": "Theory"},
    {"id": create_id(), "name": "Lab 1", "capacity": 50, "type": "Lab"}
]

data = {
    "subjects": subjects,
    "teachers": [teacher],
    "batches": [batch],
    "classrooms": classrooms,
    "config": config,
    "schedule": []
}

try:
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)
    print("Data reset successfully.")
except Exception as e:
    print(e)
