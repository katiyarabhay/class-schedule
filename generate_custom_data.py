
import json
import uuid
import random

def create_id():
    return str(uuid.uuid4())

def generate_data():
    subjects = []
    teachers = []
    batches = []
    classrooms = []
    
    # 1. Subjects Generation
    # 3 Semesters, 5 Subjects each
    semesters = [1, 3, 5]
    subjects_per_sem = 5
    
    # Store subjects by semester to assign to batches later
    sem_subjects = {1: [], 3: [], 5: []}
    
    subject_names = [
        "Mathematics", "Physics", "Digital Electronics", "C Programming", "Communication Skills", 
        "Data Structures", "Java", "Operating Systems", "Computer Networks", "DBMS",
        "Web Tech", "Software Eng", "AI", "Cloud Computing", "Information Security"
    ]
    
    sub_idx = 0
    for sem in semesters:
        for i in range(subjects_per_sem):
            name = f"{subject_names[sub_idx]} (Sem {sem})"
            code = f"SUB-{sem}0{i+1}"
            sub_type = "Theory" # keeping simple for now, can mix Lab if needed
             # Make every 5th subject a Lab for variety?
            if (i+1) % 5 == 0:
                sub_type = "Lab"
                
            subject = {
                "id": create_id(),
                "name": name,
                "code": code,
                "type": sub_type,
                "credits": 4 if sub_type == "Theory" else 2,
                "requiredBatches": [] # Will be populated implicitly by batches requiring them
            }
            subjects.append(subject)
            sem_subjects[sem].append(subject)
            sub_idx = (sub_idx + 1) % len(subject_names)

    # Add Training Subjects (Common for all)
    # Current: ~18 credits academic + 12 training = 30. Need 10 more for 40 slots.
    training_subjects = [
        {"id": create_id(), "name": "Placement Training", "code": "TRN-001", "type": "Theory", "credits": 8, "requiredBatches": []},
        {"id": create_id(), "name": "Soft Skills", "code": "TRN-002", "type": "Theory", "credits": 4, "requiredBatches": []},
        {"id": create_id(), "name": "OLT", "code": "OLT-001", "type": "Lab", "credits": 6, "requiredBatches": []},
        {"id": create_id(), "name": "Hackathon", "code": "HCK-001", "type": "Lab", "credits": 4, "requiredBatches": []} # Total +22 credits
    ]
    subjects.extend(training_subjects)

    # 2. Teachers Generation
    # Need enough teachers. 
    # Total Batches = 3 sem * 3 sec = 9 batches.
    # Total Classes = 9 batches * 5 subjects = 45 classes to schedule.
    # If 1 teacher teaches 1 subject to all 3 sections of a semester -> 3 classes load.
    # 15 Subjects -> 15 Teachers is a safe 1:1 mapping.
    
    teacher_names = [
        "Amit Sharma", "Priya Singh", "Rohan Gupta", "Sneha Patel", "Vikram Verma",
        "Anjali Das", "Rahul Kumar", "Kavita Reddy", "Arjun Nair", "Meera Joshi",
        "Suresh Iyer", "Neha Malhotra", "Rajesh Khanna", "Pooja Hegde", "Vivek Oberoi"
    ]
    
    for i in range(len(subjects) - 2): # Exclude training subjects for regular teachers
        # Each teacher specializes in one subject
        subject = subjects[i]
        teacher = {
            "id": create_id(),
            "name": f"Prof. {teacher_names[i] if i < len(teacher_names) else f'Teacher {i+1}'}",
            "department": "CS",
            "qualifiedSubjects": [subject['id']],
            "maxLoadPerDay": 3,
            "maxLoadPerWeek": 15,
            "preferredSlots": [],
            "unavailableSlots": []
        }
        teachers.append(teacher)

    # Add Trainers
    # 9 Batches * 22 credits = 198 training hours total.
    # Each trainer max 25 hrs/week -> Need ~8-9 trainers.
    for i in range(10):
        teachers.append({
            "id": create_id(),
            "name": f"Trainer {i+1}",
            "department": "Training",
            "qualifiedSubjects": [s['id'] for s in training_subjects],
            "maxLoadPerDay": 6, # High load allowed
            "maxLoadPerWeek": 30,
            "preferredSlots": [],
            "unavailableSlots": []
        })

    # 3. Batches Generation
    # 3 Section per Semester (A, B, C)
    sections = ['A', 'B', 'C']
    
    for sem in semesters:
        required_subject_ids = [s['id'] for s in sem_subjects[sem]]
        # Add training subjects to requirements
        required_subject_ids.extend([s['id'] for s in training_subjects])
        
        for sec in sections:
            batch = {
                "id": create_id(),
                "name": f"BCA {sem}{sec}",
                "size": 60,
                "department": "BCA",
                "requiredSubjects": required_subject_ids
            }
            batches.append(batch)

    # 4. Classrooms Generation
    # 9 Batches running potentially concurrently.
    # Need at least 9 rooms. Let's create 12 Theory + 3 Labs.
    for i in range(12):
        classrooms.append({
            "id": create_id(),
            "name": f"Room {101+i}",
            "capacity": 70,
            "type": "Theory"
        })
        
    for i in range(10):
        classrooms.append({
            "id": create_id(),
            "name": f"Lab {1+i}",
            "capacity": 70,
            "type": "Lab"
        })

    # Config
    config = {
        "daysPerWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slotsPerDay": 9,
        "breakAfter": 4
    }

    final_data = {
        "subjects": subjects,
        "teachers": teachers,
        "batches": batches,
        "classrooms": classrooms,
        "config": config,
        "schedule": [] # Start empty
    }
    
    with open('data.json', 'w') as f:
        json.dump(final_data, f, indent=2)
    
    print(f"Generated {len(subjects)} Subjects")
    print(f"Generated {len(teachers)} Teachers")
    print(f"Generated {len(batches)} Batches")
    print(f"Generated {len(classrooms)} Classrooms")

if __name__ == "__main__":
    try:
        generate_data()
        print("Data generation complete.")
    except Exception as e:
        print(f"Error: {e}")
