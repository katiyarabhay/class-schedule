
'use server';

import * as db from '@/lib/db';
import { Batch, Classroom, ScheduleEntry, SchedulerConfig, Subject, Teacher } from '@/lib/types';

export async function getInitialData() {
    return await db.getInitialData();
}

// Teachers
export async function addTeacherAction(teacher: Teacher) {
    await db.addTeacher(teacher);
}

export async function removeTeacherAction(id: string) {
    await db.removeTeacher(id);
}

export async function updateTeacherAction(teacher: Teacher) {
    await db.updateTeacher(teacher);
}

// Classrooms
export async function addClassroomAction(classroom: Classroom) {
    await db.addClassroom(classroom);
}

export async function removeClassroomAction(id: string) {
    await db.removeClassroom(id);
}

export async function updateClassroomAction(classroom: Classroom) {
    await db.update('classrooms', (classrooms) => classrooms.map((c) => c.id === classroom.id ? classroom : c));
}

// Subjects
export async function addSubjectAction(subject: Subject) {
    await db.addSubject(subject);
}

export async function removeSubjectAction(id: string) {
    await db.removeSubject(id);
}

// Batches
export async function addBatchAction(batch: Batch) {
    await db.addBatch(batch);
}

export async function removeBatchAction(id: string) {
    await db.removeBatch(id);
}

// Schedule
export async function saveScheduleAction(schedule: ScheduleEntry[]) {
    await db.saveSchedule(schedule);
}

export async function updateConfigAction(config: SchedulerConfig) {
    await db.updateConfig(config);
}
