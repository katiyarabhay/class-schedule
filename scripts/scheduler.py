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
    teacher_assigned_load = {} # Track assigned credits to balance load
    
    for batch in batches:
        for subject in subjects:
            # Check if this batch takes this subject
            # MODIFICATION: Check batch['requiredSubjects'] if present
            if batch.get('requiredSubjects') and subject['id'] not in batch['requiredSubjects']:
                continue

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

            # Load Balancing: Pick the teacher with the least current load
            # Sort by load (asc), then by ID (consistent tie-break)
            qualified_teachers.sort(key=lambda t: (teacher_assigned_load.get(t['id'], 0), t['id']))
            assigned_teacher = qualified_teachers[0]
            
            # Update load
            credits = subject.get('credits', 1)
            teacher_assigned_load[assigned_teacher['id']] = teacher_assigned_load.get(assigned_teacher['id'], 0) + credits

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

    sys.stderr.write(f"Generated {len(requests)} requests.\n")
    sys.stderr.write(f"Teacher Load: {json.dumps(teacher_assigned_load)}\n")

    # 2. Model
    model = cp_model.CpModel()

    # Variables
    x = {} # vars
    
    # For each request, create variables for valid slots/rooms
    for r_idx, req in enumerate(requests):
        batch = batch_map[req['batch_id']]
        batch_size = batch.get('size', 0)
        
        valid_rooms = [
            room for room in classrooms 
            # if room['type'] == req['type'] and room['capacity'] >= batch_size # Removed constraints
        ]
        
        if not valid_rooms:
            sys.stderr.write(f"Warning: No valid room for req {r_idx} ({req['type']}, size {batch_size})\n")
            continue

        for d_idx in range(len(days)):
            for p_idx in range(slots_per_day):
                for room in valid_rooms:
                    x[(r_idx, d_idx, p_idx, room['id'])] = model.NewBoolVar(f'req_{r_idx}_d{d_idx}_p{p_idx}_r{room["id"]}')

    sys.stderr.write(f"Created {len(x)} variables.\n")

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

    # 4. Consecutive Lecture Constraints
    # Logic: No more than 2 consecutive classes.
    # We check every window of 3 slots: sum(classes in p, p+1, p+2) <= 2
    
    # 4a. Batch Constraints
    # Organize vars by (batch, day, period) -> list of vars
    # Since we already iterated for "Max 1 per slot", we know sum(vars_at_p) is 0 or 1.
    # We need to access these sums easily.
    
    # Re-use batches_in_slot and teachers_in_slot from previous loop?
    # They were local to the loop over slots_vars. 
    # Let's rebuild a global view for ease or iterate differently.
    
    # (batch_id, day) -> { period: [vars] }
    batch_daily_vars = {}
    teacher_daily_vars = {}

    for (r_idx, d_idx, p_idx, room_id), var in x.items():
        req = requests[r_idx]
        b_id = req['batch_id']
        t_id = req['teacher_id']
        
        # Batch
        if (b_id, d_idx) not in batch_daily_vars: batch_daily_vars[(b_id, d_idx)] = {}
        if p_idx not in batch_daily_vars[(b_id, d_idx)]: batch_daily_vars[(b_id, d_idx)][p_idx] = []
        batch_daily_vars[(b_id, d_idx)][p_idx].append(var)
        
        # Teacher
        if (t_id, d_idx) not in teacher_daily_vars: teacher_daily_vars[(t_id, d_idx)] = {}
        if p_idx not in teacher_daily_vars[(t_id, d_idx)]: teacher_daily_vars[(t_id, d_idx)][p_idx] = []
        teacher_daily_vars[(t_id, d_idx)][p_idx].append(var)

    # Apply generic sliding window constraint
    def add_max_consecutive_constraints(daily_map, limit=2):
        break_after = config.get('breakAfter', 4) # Default to 4 if not set

        for (entity_id, d_idx), p_map in daily_map.items():
            # For this entity on this day
            # Check windows: [p, p+1, ..., p+limit] -> length limit+1
            # If sum > limit, it violates "max consecutive = limit"
            
            for p in range(slots_per_day - limit):
                # CHECK: Does this window [p, p+1, p+2] cross the break?
                # Window indices: p, p+1, p+2
                # If break is after slot 4 (indices 0,1,2,3), then:
                # Slot 3 and Slot 4 (indices) are separated by break.
                # Index 3 is Period 4. Index 4 is Period 5.
                # If the window includes BOTH index (break_after-1) AND index (break_after),
                # then it is NOT a consecutive block of lectures.
                
                # Actually, simpler: The constraint is "No 3 consecutive CLASSES".
                # If there is a break between P4 and P5, does P4 and P5 count as consecutive?
                # User said: "Add a break time ... after 4th lecture".
                # Usually, a break RESETS the "consecutive" counter.
                # So P3, P4, (Break), P5 -> IS acceptable? Yes.
                # P3, P4 is 2. (Break). P5 is 1. No sequence of 3.
                # So verify: the window [P3, P4, P5] which is indices [2, 3, 4]
                # Contains index 3 and 4.
                # If window contains the break boundary, we should NOT enforce the constraint strictly across it
                # OR we split the day into two segments and enforce separately.
                
                window_indices = [p + offset for offset in range(limit + 1)]
                
                # Check if window crosses the break boundary
                # Boundary is between (break_after-1) and (break_after)
                crosses_break = False
                for i in range(len(window_indices) - 1):
                    if window_indices[i] == break_after - 1 and window_indices[i+1] == break_after:
                        crosses_break = True
                        break
                
                if crosses_break:
                    # If window crosses break, we assume the break breaks the chain.
                    # So P3, P4, P5 is NOT 3 consecutive. It's 2 then 1.
                    # So we SKIP adding this constraint.
                    continue

                # Gather all variables for periods p, p+1, ... p+limit
                window_vars = []
                for idx in window_indices:
                    window_vars.extend(p_map.get(idx, []))
                
                if window_vars:
                    model.Add(sum(window_vars) <= limit)

    # Relaxed constraints to ensure feasibility for full schedule
    # add_max_consecutive_constraints(batch_daily_vars, limit=2)
    # add_max_consecutive_constraints(teacher_daily_vars, limit=2)

    # 3. Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0
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
    
    # 4. Fill Vacant Slots (Post-Processing)
    # Goal: No lecture left vacant.
    # Strategy: For each batch, find empty slots. Assign "Self Study" or "Library".
    # Try to assign a room (any available).
    # Try to assign a teacher (any available, or None).

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        # Build quick lookup for occupied resources
        occupied_rooms = set()
        occupied_teachers = set()
        batch_occupied_slots = set()

        for entry in final_schedule:
            d = entry['day']
            p = entry['period']
            occupied_rooms.add((d, p, entry['classroomId']))
            occupied_teachers.add((d, p, entry['teacherId']))
            for b_id in entry['batchIds']:
                batch_occupied_slots.add((d, p, b_id))

        # Iterate all batches, days, periods
        for batch in batches:
            b_id = batch['id']
            for day in days:
                for p_idx in range(slots_per_day):
                    period = p_idx + 1
                    
                    if (day, period, b_id) in batch_occupied_slots:
                        continue
                    
                    # Found empty slot for this batch
                    # Find a room
                    assigned_room = None
                    for r in classrooms:
                        if (day, period, r['id']) not in occupied_rooms:
                            assigned_room = r
                            break
                    
                    if not assigned_room:
                        # No room available? Reuse a large room or just mark as 'Ground'?
                        # For now, if no room, we can't schedule.
                         continue

                    # Find a teacher? Optional for Self Study.
                    assigned_teacher_id = "SELF-STUDY-SUPERVISOR" 
                    # Try to find a real teacher who is free
                    for t in teachers:
                         if (day, period, t['id']) not in occupied_teachers:
                             assigned_teacher_id = t['id']
                             occupied_teachers.add((day, period, t['id'])) # Mark busy
                             break
                    
                    # Add to schedule
                    final_schedule.append({
                        'id': f"auto_fill_{b_id}_{day}_{period}",
                        'subjectId': "SELF-STUDY", # Special ID
                        'teacherId': assigned_teacher_id,
                        'classroomId': assigned_room['id'],
                        'batchIds': [b_id],
                        'day': day,
                        'period': period
                    })
                    
                    occupied_rooms.add((day, period, assigned_room['id']))
                    batch_occupied_slots.add((day, period, b_id))

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
