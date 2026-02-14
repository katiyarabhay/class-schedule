import { Teacher, Classroom, Subject, Batch, ScheduleEntry, SchedulerConfig, DAYS_OF_WEEK } from './types';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Helper to read data
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return default structure
        return {
            teachers: [],
            classrooms: [],
            subjects: [],
            batches: [],
            schedule: [],
            config: { daysPerWeek: DAYS_OF_WEEK.slice(0, 5), slotsPerDay: 6 },
        };
    }
}

// Helper to write data
async function writeData(data: any) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getInitialData() {
    const data = await readData();
    return {
        teachers: data.teachers || [],
        classrooms: data.classrooms || [],
        subjects: data.subjects || [],
        batches: data.batches || [],
        schedule: data.schedule || [],
        config: data.config || { daysPerWeek: DAYS_OF_WEEK.slice(0, 5), slotsPerDay: 6 },
    };
}

// --- Teachers ---
export async function addTeacher(teacher: Teacher) {
    const data = await readData();
    data.teachers = data.teachers || [];
    const index = data.teachers.findIndex((t: Teacher) => t.id === teacher.id);
    if (index >= 0) {
        data.teachers[index] = teacher;
    } else {
        data.teachers.push(teacher);
    }
    await writeData(data);
}
export async function updateTeacher(teacher: Teacher) {
    await addTeacher(teacher); // Same logic for JSON
}
export async function removeTeacher(id: string) {
    const data = await readData();
    data.teachers = (data.teachers || []).filter((t: Teacher) => t.id !== id);
    await writeData(data);
}

// --- Classrooms ---
export async function addClassroom(classroom: Classroom) {
    const data = await readData();
    data.classrooms = data.classrooms || [];
    const index = data.classrooms.findIndex((c: Classroom) => c.id === classroom.id);
    if (index >= 0) {
        data.classrooms[index] = classroom;
    } else {
        data.classrooms.push(classroom);
    }
    await writeData(data);
}
export async function updateClassroom(classroom: Classroom) {
    await addClassroom(classroom);
}
export async function removeClassroom(id: string) {
    const data = await readData();
    data.classrooms = (data.classrooms || []).filter((c: Classroom) => c.id !== id);
    await writeData(data);
}

// --- Subjects ---
export async function addSubject(subject: Subject) {
    const data = await readData();
    data.subjects = data.subjects || [];
    const index = data.subjects.findIndex((s: Subject) => s.id === subject.id);
    if (index >= 0) {
        data.subjects[index] = subject;
    } else {
        data.subjects.push(subject);
    }
    await writeData(data);
}
export async function updateSubject(subject: Subject) {
    await addSubject(subject);
}
export async function removeSubject(id: string) {
    const data = await readData();
    data.subjects = (data.subjects || []).filter((s: Subject) => s.id !== id);
    await writeData(data);
}

// --- Batches ---
export async function addBatch(batch: Batch) {
    const data = await readData();
    data.batches = data.batches || [];
    const index = data.batches.findIndex((b: Batch) => b.id === batch.id);
    if (index >= 0) {
        data.batches[index] = batch;
    } else {
        data.batches.push(batch);
    }
    await writeData(data);
}
export async function updateBatch(batch: Batch) {
    await addBatch(batch);
}
export async function removeBatch(id: string) {
    const data = await readData();
    data.batches = (data.batches || []).filter((b: Batch) => b.id !== id);
    await writeData(data);
}

// --- Schedule ---
export async function saveSchedule(schedule: ScheduleEntry[]) {
    const data = await readData();
    data.schedule = schedule;
    await writeData(data);
}

// --- Config ---
export async function updateConfig(config: SchedulerConfig) {
    const data = await readData();
    data.config = config;
    await writeData(data);
}
