import { Teacher, Classroom, Subject, Batch, SchedulerConfig, ScheduleEntry, DAYS_OF_WEEK } from './types';

// Simple Genetic Algorithm or Greedy Approach for MVP
// We will use a Randomized Greedy approach with retries for simplicity and performance in browser.

interface ClassRequest {
    batchId: string;
    subjectId: string;
    teacherId: string; // Pre-assigned for now, logical improvement: find suitable teacher
    type: 'Theory' | 'Lab' | 'SelfStudy';
    duration: number; // in slots (1 for theory, maybe 2 for lab)
}

export function generateSchedule(
    teachers: Teacher[],
    classrooms: Classroom[],
    subjects: Subject[],
    batches: Batch[],
    config: SchedulerConfig
): ScheduleEntry[] {
    const schedule: ScheduleEntry[] = [];

    // 1. Flatten all requirements into a list of "Classes to Schedule"
    // Assumption: We need to know which batch takes which subject with which teacher.
    // Since our UI is simple, we might need to derive this or have a user "Course Plan".
    // For MVP, we will assume: Each Batch takes ALL Subjects. 
    // And for each Subject, we pick the first qualified teacher (or random).

    const classQueue: ClassRequest[] = [];
    const teacherLoad: Record<string, number> = {};
    teachers.forEach(t => teacherLoad[t.id] = 0);

    batches.forEach(batch => {
        subjects.forEach(subject => {
            // Find a teacher who can teach this subject
            // In real world, this is assigned. Here we auto-assign for MVP intelligence.
            // MODIFICATION: Prioritize teachers who are NOT absent.
            const qualifiedTeachers = teachers.filter(t => !t.isAbsent && (t.qualifiedSubjects.includes(subject.id) || t.department === batch.department));

            // SORT BY LEAST LOADED
            qualifiedTeachers.sort((a, b) => (teacherLoad[a.id] || 0) - (teacherLoad[b.id] || 0));

            const assignedTeacher = qualifiedTeachers.length > 0 ? qualifiedTeachers[0] : teachers.find(t => t.qualifiedSubjects.includes(subject.id)); // Fallback

            if (assignedTeacher) {
                // Add number of sessions based on credits
                for (let i = 0; i < subject.credits; i++) {
                    teacherLoad[assignedTeacher.id] = (teacherLoad[assignedTeacher.id] || 0) + 1;
                    classQueue.push({

                        batchId: batch.id,
                        subjectId: subject.id,
                        teacherId: assignedTeacher.id,
                        type: subject.type,
                        duration: 1 // Assuming 1 hour slots for simplicity
                    });
                }
            }
        });
    });

    // Sort queue by constraints? Labs first?
    classQueue.sort((a, b) => (a.type === 'Lab' ? -1 : 1));

    // 2. Scheduler Loop
    // Try to place each class

    const slots = config.daysPerWeek.flatMap(day =>
        Array.from({ length: config.slotsPerDay }, (_, i) => ({ day, period: i + 1 }))
    );

    // Helper to check availability
    const isSlotFree = (day: string, period: number, teacherId: string, batchId: string, roomId: string) => {
        // 1. Basic Overlap Checks
        const conflict = schedule.some(s =>
            s.day === day &&
            s.period === period &&
            (s.teacherId === teacherId || s.batchIds.includes(batchId) || s.classroomId === roomId)
        );
        if (conflict) return false;

        // REMOVED ALL OTHER CONSTRAINTS (Teacher Unavailable, Max Load, Consecutive)
        return true;
    };

    for (const req of classQueue) {
        let placed = false;

        // Try to find a slot
        // Shuffle slots for randomness/distribution?
        const shuffledSlots = [...slots].sort(() => Math.random() - 0.5);

        for (const slot of shuffledSlots) {
            if (placed) break;

            // Find a room
            // Aggressively removed constraints: Type and Capacity
            const suitableRoom = classrooms.find(r =>
                isSlotFree(slot.day, slot.period, req.teacherId, req.batchId, r.id)
            );

            if (suitableRoom) {
                // Place it
                schedule.push({
                    id: crypto.randomUUID(),
                    subjectId: req.subjectId,
                    teacherId: req.teacherId,
                    classroomId: suitableRoom.id,
                    batchIds: [req.batchId],
                    day: slot.day,
                    period: slot.period
                });
                placed = true;
            }
        }

        if (!placed) {
            console.warn(`Could not place class: ${req.subjectId} for Batch ${req.batchId} with Teacher ${req.teacherId}`);
            // In a real app, we return a list of unplaced classes
        }
    }

    return schedule;
}
