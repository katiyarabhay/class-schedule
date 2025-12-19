import { Teacher, Classroom, Subject, Batch, SchedulerConfig, ScheduleEntry, DAYS_OF_WEEK } from './types';

// Simple Genetic Algorithm or Greedy Approach for MVP
// We will use a Randomized Greedy approach with retries for simplicity and performance in browser.

interface ClassRequest {
    batchId: string;
    subjectId: string;
    teacherId: string; // Pre-assigned for now, logical improvement: find suitable teacher
    type: 'Theory' | 'Lab';
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

    batches.forEach(batch => {
        subjects.forEach(subject => {
            // Find a teacher who can teach this subject
            // In real world, this is assigned. Here we auto-assign for MVP intelligence.
            const teacher = teachers.find(t => t.qualifiedSubjects.includes(subject.id) || t.department === batch.department);

            // If no strict qualification, pick any teacher from same dept or just first one
            const assignedTeacher = teacher || teachers[0]; // Fallback

            if (assignedTeacher) {
                // Add number of sessions based on credits
                for (let i = 0; i < subject.credits; i++) {
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
        return !schedule.some(s =>
            s.day === day &&
            s.period === period &&
            (s.teacherId === teacherId || s.batchIds.includes(batchId) || s.classroomId === roomId)
        );
    };

    for (const req of classQueue) {
        let placed = false;

        // Try to find a slot
        // Shuffle slots for randomness/distribution?
        const shuffledSlots = [...slots].sort(() => Math.random() - 0.5);

        for (const slot of shuffledSlots) {
            if (placed) break;

            // Find a room
            const suitableRoom = classrooms.find(r =>
                r.type === req.type &&
                r.capacity >= (batches.find(b => b.id === req.batchId)?.size || 0) &&
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
            console.warn("Could not place class", req);
            // In a real app, we return a list of unplaced classes
        }
    }

    return schedule;
}
