import json
import random
import os

# Configuration for Guaranteed Feasibility
OUTPUT_FILE = 'data.json'
NUM_BATCHES = 10
NUM_TEACHERS = 20 # INCREASED from 15
NUM_CLASSROOMS = 12 # 10 Theory, 2 Labs
DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
# 8 slots: 4 slots + Break + 4 slots (or 3 slots)
SLOTS_PER_DAY = 8 
BREAK_AFTER = 4

# Define Core Subjects with high demand
SUBJECTS = [
    {"id": "sub_math", "name": "Mathematics", "code": "MATH101", "type": "Theory", "credits": 4},
    {"id": "sub_phy", "name": "Physics", "code": "PHY101", "type": "Theory", "credits": 3},
    {"id": "sub_chem", "name": "Chemistry", "code": "CHEM101", "type": "Theory", "credits": 3},
    {"id": "sub_eng", "name": "English", "code": "ENG101", "type": "Theory", "credits": 2},
    {"id": "sub_cs", "name": "Computer Science", "code": "CS101", "type": "Theory", "credits": 4},
    # Labs - usually need special rooms
    {"id": "sub_lab_cs", "name": "CS Lab", "code": "CS101L", "type": "Lab", "credits": 2},
]

def generate_robust_data():
    data = {
        "teachers": [],
        "classrooms": [],
        "subjects": SUBJECTS,
        "batches": [],
        "config": {
            "daysPerWeek": DAYS,
            "slotsPerDay": SLOTS_PER_DAY,
            "breakAfter": BREAK_AFTER
        },
        "schedule": []
    }

    # 1. Batches (Classes)
    for i in range(1, NUM_BATCHES + 1):
        data['batches'].append({
            "id": f"batch_{i}",
            "name": f"Batch {i}",
            "size": 40,
            "department": "General" # Simplified
        })

    # 2. Teachers - Ensure Coverage
    # Strategy: Assign teachers specifically to match demand.
    # We have 20 teachers.
    # Distribute:
    # Math (4 cr * 10 = 40h) -> Need ~2.5 full loads. Assign 4 Teachers.
    # CS (4 cr * 10 = 40h) -> Need ~2.5 full loads. Assign 4 Teachers.
    # Phy (3 cr * 10 = 30h) -> Need 2 full loads. Assign 3 Teachers.
    # Chem (3 cr * 10 = 30h) -> Need 2 full loads. Assign 3 Teachers.
    # Eng (2 cr * 10 = 20h) -> Need 1 full load. Assign 2 Teachers.
    # Lab (2 cr * 10 = 20h) -> Need 1 full load. Assign 2 Teachers.
    # Total assigned so far: 4+4+3+3+2+2 = 18 Teachers.
    # Remaining 2: General floaters.
    
    allocations = [
        ['sub_math'], ['sub_math'], ['sub_math'], ['sub_math'],
        ['sub_cs'], ['sub_cs'], ['sub_cs'], ['sub_cs'],
        ['sub_phy'], ['sub_phy'], ['sub_phy'],
        ['sub_chem'], ['sub_chem'], ['sub_chem'],
        ['sub_eng'], ['sub_eng'],
        ['sub_lab_cs'], ['sub_lab_cs']
    ]
    # Fill remaining teachers with random mix
    while len(allocations) < NUM_TEACHERS:
        allocations.append([s['id'] for s in random.sample(SUBJECTS, k=2)])

    # Build Teacher Objects
    for i in range(1, NUM_TEACHERS + 1):
        # Get primary allocation
        if i <= len(allocations):
            primary_subs = allocations[i-1]
        else:
            primary_subs = [s['id'] for s in random.sample(SUBJECTS, k=2)]
            
        # Add random secondary subject to everyone for flexibility (except maybe single-subject experts)
        # Actually, let's keep them focused to ensure they handle the load, but give 1 extra option.
        if len(primary_subs) == 1:
             extra = random.choice([s for s in SUBJECTS if s['id'] not in primary_subs])
             primary_subs.append(extra['id'])

        data['teachers'].append({
            "id": f"teacher_{i}",
            "name": f"Teacher {chr(64+i)}", # A, B, C...
            "department": "General",
            "qualifiedSubjects": primary_subs,
            "maxLoadPerDay": 6,   # Increased capacity to 6/day
            "maxLoadPerWeek": 25, # Increased capacity to 25/week
            "isAbsent": False
        })

    # 3. Classrooms
    # 10 Theory batches need ~10 Theory rooms.
    # We give 10 Theory Rooms + 2 Labs.
    for i in range(1, 11):
        data['classrooms'].append({
            "id": f"room_{i}",
            "name": f"Room {100+i}",
            "capacity": 50,
            "type": "Theory"
        })
    # Labs
    data['classrooms'].append({"id": "lab_1", "name": "CS Lab A", "capacity": 50, "type": "Lab"})
    data['classrooms'].append({"id": "lab_2", "name": "CS Lab B", "capacity": 50, "type": "Lab"})

    return data

if __name__ == "__main__":
    data = generate_robust_data()
    target_path = os.path.join(os.getcwd(), 'data.json')
    
    with open(target_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Generated ROBUST sample data at {target_path}")
