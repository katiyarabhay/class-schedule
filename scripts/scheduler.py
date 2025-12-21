import sys
import json
from ortools.sat.python import cp_model

def solve_schedule(data):
    # Unpack data
    teachers = data.get('teachers', [])
    classrooms = data.get('classrooms', [])
    subjects = data.get('subjects', [])
    batches = data.get('batches', [])
    config = data.get('config', {'slotsPerDay': 6, 'daysPerWeek': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']})

    days = config['daysPerWeek']
    slots_per_day = config['slotsPerDay']
    total_slots = len(days) * slots_per_day

    # 1. Prepare Data
    # Map IDs to objects for easy lookup
    teacher_map = {t['id']: t for t in teachers}
    room_map = {r['id']: r for r in classrooms}
    subject_map = {s['id']: s for s in subjects}
    batch_map = {b['id']: b for b in batches}

    # Generate Class Instances (Requests)
    # A "Class Instance" is one specific occurrence of a subject being taught to a batch
    requests = []
    
    # Simple logic: Each batch takes each subject it is required to take.
    # We need to deduce this.
    # For MVP: Iterate all batches, and for each batch, iterate all subjects.
    # If subject.requiredBatches is empty OR contains batch.id, assume it's needed.
    
    req_id_counter = 0
    for batch in batches:
        for subject in subjects:
             # Check if this batch takes this subject
            if subject.get('requiredBatches') and batch['id'] not in subject['requiredBatches']:
                continue
            
            # Logic: If subject has no 'requiredBatches', does it mean ALL batches take it? 
            # Or none? Let's assume if array exists and is not empty, it's specific. 
            # If empty/undefined, maybe it's general? Let's stick to: if array exists, check it.
            # If it doesn't exist, we might skip or include. 
            # Safer assumption for School: explicitly linked.
            # But earlier TS code assumed "Each Batch takes ALL Subjects", so let's stick to that for parity 
            # unless specific fields exist.
            
            # Finding a teacher
            # Filter teachers who can teach this subject
            qualified_teachers = [t for t in teachers if subject['id'] in t.get('qualifiedSubjects', [])]
            
            # Fallback: if no qualified teacher, pick one from same department
            if not qualified_teachers:
                qualified_teachers = [t for t in teachers if t.get('department') == batch.get('department')]
            
            # Fallback: pick any teacher
            if not qualified_teachers:
                if teachers: # Assign first teacher available
                     qualified_teachers = [teachers[0]]
                else: 
                     continue # Impossible to schedule without teachers

            # For now, just pick the first qualified teacher. 
            # Optimization: The solver could pick the teacher, but that adds variables.
            assigned_teacher = qualified_teachers[0]

            # Create requests based on credits/hours
            credits = subject.get('credits', 1)
            for _ in range(credits):
                requests.append({
                    'id': req_id_counter,
                    'batch_id': batch['id'],
                    'subject_id': subject['id'],
                    'teacher_id': assigned_teacher['id'],
                    'type': subject.get('type', 'Theory'),
                    'duration': 1 # Assuming 1 slot
                })
                req_id_counter += 1

    # 2. Model
    model = cp_model.CpModel()

    # Variables
    # grid[(request_idx, day_idx, period_idx, room_idx)] = bool
    # This might be too huge. 
    # Better: for each request, pick ONE (day, period, room) tuple.
    
    # We will use boolean vars: x[req_id, day, period, room_id]
    
    # To reduce variable count:
    # Filter rooms by type and capacity FIRST.
    
    x = {} # vars
    
    # For each request, create variables for valid slots/rooms
    for r_idx, req in enumerate(requests):
        batch = batch_map[req['batch_id']]
        batch_size = batch.get('size', 0)
        
        valid_rooms = [
            room for room in classrooms 
            if room['type'] == req['type'] and room['capacity'] >= batch_size
        ]
        
        # If no room fits, we can't schedule this request. Log warning?
        if not valid_rooms:
            # Fallback: allows any room of same type or just any room?
            # Strict for now.
            continue

        for d_idx in range(len(days)):
            for p_idx in range(slots_per_day):
                for room in valid_rooms:
                    x[(r_idx, d_idx, p_idx, room['id'])] = model.NewBoolVar(f'req_{r_idx}_d{d_idx}_p{p_idx}_r{room["id"]}')

    # Constraints
    
    # C1: Each request must be scheduled exactly once
    for r_idx, req in enumerate(requests):
        # Gather all vars for this request
        req_vars = []
        # We need to re-loop or store them efficiently. 
        # Re-looping x keys is slow.
        # Let's iterate our created dict keys.
        # (Optimization: structure x as x[r_idx] = list of vars)
        
        # Optimized lookup
        relevant_vars = [v for k, v in x.items() if k[0] == r_idx]
        if relevant_vars:
            model.Add(sum(relevant_vars) == 1)
        # else: Unscheduled!

    # C2: No Teacher Overlap
    # For each teacher, day, period -> max 1 class
    # We iterate all slots, find requests involving teacher T
    
    # Pre-calculate request indices per teacher
    reqs_per_teacher = {}
    for r_idx, req in enumerate(requests):
        t_id = req['teacher_id']
        if t_id not in reqs_per_teacher: reqs_per_teacher[t_id] = []
        reqs_per_teacher[t_id].append(r_idx)

    for d_idx in range(len(days)):
        for p_idx in range(slots_per_day):
            for t_id, r_indices in reqs_per_teacher.items():
                # Sum of x[r, d, p, any_room] <= 1
                t_vars = []
                for r_idx in r_indices:
                    # Find all vars for this request at this time
                    # We need access to rooms.
                    # It's better to iterate x once and bucket by (d, p, teacher)
                    pass 

    # Efficient Constraint loops
    # Bucket all variables by (day, period)
    # slots_vars[(d, p)] = [ (r_idx, room_id, var) ]
    slots_vars = {}
    
    for (r_idx, d_idx, p_idx, room_id), var in x.items():
        key = (d_idx, p_idx)
        if key not in slots_vars: slots_vars[key] = []
        slots_vars[key].append((r_idx, room_id, var))

    for (d_idx, p_idx), entries in slots_vars.items():
        # entries list of (r_idx, room_id, var)
        
        # 1. Room Conflict: Max 1 class per room per slot
        rooms_in_slot = {}
        for r_idx, room_id, var in entries:
            if room_id not in rooms_in_slot: rooms_in_slot[room_id] = []
            rooms_in_slot[room_id].append(var)
        
        for room_id, room_vars in rooms_in_slot.items():
            model.Add(sum(room_vars) <= 1)

        # 2. Teacher Conflict: Max 1 class per teacher per slot
        teachers_in_slot = {}
        for r_idx, room_id, var in entries:
            t_id = requests[r_idx]['teacher_id']
            if t_id not in teachers_in_slot: teachers_in_slot[t_id] = []
            teachers_in_slot[t_id].append(var)
            
        for t_id, t_vars in teachers_in_slot.items():
            model.Add(sum(t_vars) <= 1)
            
        # 3. Batch Conflict: Max 1 class per batch per slot
        batches_in_slot = {}
        for r_idx, room_id, var in entries:
            b_id = requests[r_idx]['batch_id']
            if b_id not in batches_in_slot: batches_in_slot[b_id] = []
            batches_in_slot[b_id].append(var)
            
        for b_id, b_vars in batches_in_slot.items():
            model.Add(sum(b_vars) <= 1)

    # 3. Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0
    status = solver.Solve(model)

    final_schedule = []

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for (r_idx, d_idx, p_idx, room_id), var in x.items():
            if solver.Value(var) == 1:
                req = requests[r_idx]
                final_schedule.append({
                    'id': f"sched_{r_idx}",
                    'subjectId': req['subject_id'],
                    'teacherId': req['teacher_id'],
                    'classroomId': room_id,
                    'batchIds': [req['batch_id']],
                    'day': days[d_idx],
                    'period': p_idx + 1 # 1-indexed
                })
    
    return final_schedule

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps([]))
            sys.exit(0)
            
        data = json.loads(input_data)
        schedule = solve_schedule(data)
        print(json.dumps(schedule))
    except Exception as e:
        # Log error to stderr
        sys.stderr.write(str(e))
        sys.exit(1)
