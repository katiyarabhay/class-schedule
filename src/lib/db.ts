
import { QuerySnapshot } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { Teacher, Classroom, Subject, Batch, ScheduleEntry, SchedulerConfig, DAYS_OF_WEEK } from './types';

// Helper to convert Firestore snapshot to array
const snapshotToArray = <T>(snapshot: QuerySnapshot): T[] => {
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export async function getInitialData() {
    try {
        const [teachersSnap, classroomsSnap, subjectsSnap, batchesSnap, scheduleSnap, configSnap] = await Promise.all([
            adminDb.collection('teachers').get(),
            adminDb.collection('classrooms').get(),
            adminDb.collection('subjects').get(),
            adminDb.collection('batches').get(),
            adminDb.collection('schedule').get(),
            adminDb.collection('metadata').doc('config').get(),
        ]);

        const config = configSnap.exists ? configSnap.data() as SchedulerConfig : {
            daysPerWeek: DAYS_OF_WEEK.slice(0, 5),
            slotsPerDay: 6,
        };

        return {
            teachers: snapshotToArray<Teacher>(teachersSnap),
            classrooms: snapshotToArray<Classroom>(classroomsSnap),
            subjects: snapshotToArray<Subject>(subjectsSnap),
            batches: snapshotToArray<Batch>(batchesSnap),
            schedule: snapshotToArray<ScheduleEntry>(scheduleSnap),
            config,
        };
    } catch (error) {
        console.error("Error fetching initial data from Firestore:", error);
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

// --- Teachers ---
export async function addTeacher(teacher: Teacher) {
    await adminDb.collection('teachers').doc(teacher.id).set(teacher);
}
export async function updateTeacher(teacher: Teacher) {
    await adminDb.collection('teachers').doc(teacher.id).update(teacher as any);
}
export async function removeTeacher(id: string) {
    await adminDb.collection('teachers').doc(id).delete();
}

// --- Classrooms ---
export async function addClassroom(classroom: Classroom) {
    await adminDb.collection('classrooms').doc(classroom.id).set(classroom);
}
export async function removeClassroom(id: string) {
    await adminDb.collection('classrooms').doc(id).delete();
}

// --- Subjects ---
export async function addSubject(subject: Subject) {
    await adminDb.collection('subjects').doc(subject.id).set(subject);
}
export async function removeSubject(id: string) {
    await adminDb.collection('subjects').doc(id).delete();
}

// --- Batches ---
export async function addBatch(batch: Batch) {
    await adminDb.collection('batches').doc(batch.id).set(batch);
}
export async function removeBatch(id: string) {
    await adminDb.collection('batches').doc(id).delete();
}

// --- Schedule ---
export async function saveSchedule(schedule: ScheduleEntry[]) {
    // This is a bulk overwrite, essentially.
    // Strategy: Delete all existing schedule entries and add new ones (batching)
    // OR: Just add/update if simple. But schedule generation usually wipes previous.
    // For safety in this app context, let's assume we replace the schedule.

    const batch = adminDb.batch();

    // 1. Get all current schedule docs (inefficient but safe for now)
    const currentSnap = await adminDb.collection('schedule').listDocuments();
    currentSnap.forEach(doc => batch.delete(doc));

    // 2. Add new ones
    schedule.forEach(entry => {
        const ref = adminDb.collection('schedule').doc(entry.id);
        batch.set(ref, entry);
    });

    await batch.commit();
}

// --- Config ---
export async function updateConfig(config: SchedulerConfig) {
    await adminDb.collection('metadata').doc('config').set(config);
}
