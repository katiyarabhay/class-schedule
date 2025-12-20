'use server';

import { db } from '@/lib/db';
import { Batch, Classroom, ScheduleEntry, SchedulerConfig, Subject, Teacher } from '@/lib/types';

export async function getInitialData() {
    return await db.read();
}

// Teachers
export async function addTeacherAction(teacher: Teacher) {
    await db.update('teachers', (teachers) => [...teachers, teacher]);
}

export async function removeTeacherAction(id: string) {
    await db.update('teachers', (teachers) => teachers.filter((t) => t.id !== id));
}

// Classrooms
export async function addClassroomAction(classroom: Classroom) {
    await db.update('classrooms', (classrooms) => [...classrooms, classroom]);
}

export async function removeClassroomAction(id: string) {
    await db.update('classrooms', (classrooms) => classrooms.filter((c) => c.id !== id));
}

// Subjects
export async function addSubjectAction(subject: Subject) {
    await db.update('subjects', (subjects) => [...subjects, subject]);
}

export async function removeSubjectAction(id: string) {
    await db.update('subjects', (subjects) => subjects.filter((s) => s.id !== id));
}

// Batches
export async function addBatchAction(batch: Batch) {
    await db.update('batches', (batches) => [...batches, batch]);
}

export async function removeBatchAction(id: string) {
    await db.update('batches', (batches) => batches.filter((b) => b.id !== id));
}

// Schedule
export async function saveScheduleAction(schedule: ScheduleEntry[]) {
    await db.write({ ...(await db.read()), schedule });
}

export async function updateConfigAction(config: SchedulerConfig) {
    await db.write({ ...(await db.read()), config });
}
