import fs from 'fs';
import path from 'path';

// Define types locally for the script
interface TimeSlot {
    day: string;
    period: number;
}
interface Teacher {
    id: string;
    name: string;
    department: string;
    qualifiedSubjects: string[];
    maxLoadPerDay: number;
    maxLoadPerWeek: number;
    preferredSlots?: TimeSlot[];
    unavailableSlots?: TimeSlot[];
    isAbsent?: boolean;
}
interface ScheduleEntry {
    id: string;
    subjectId: string;
    teacherId: string;
    classroomId: string;
    batchIds: string[];
    day: string;
    period: number;
}
interface DBData {
    teachers: Teacher[];
    schedule: ScheduleEntry[];
    [key: string]: any;
}

const DB_PATH = path.join(process.cwd(), 'data.json');

async function migrate() {
    if (!fs.existsSync(DB_PATH)) {
        console.error('data.json not found');
        return;
    }

    const data: DBData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const idMap = new Map<string, string>(); // Old ID -> New ID

    // 1. Assign Codes to Teachers
    let counter = 1;
    data.teachers = data.teachers.map((t) => {
        // If it already looks like a code (short, no dashes), keep it? 
        // UUIDs have dashes. Let's assume anything with dashes is a UUID and needs migration.
        if (t.id.includes('-') && t.id.length > 10) {
            const newId = `FAC-${String(counter).padStart(3, '0')}`;
            idMap.set(t.id, newId);
            counter++;
            console.log(`Migrating ${t.name} (${t.id}) -> ${newId}`);
            return { ...t, id: newId };
        }
        return t;
    });

    // 2. Update Schedule
    let scheduleUpdates = 0;
    data.schedule = data.schedule.map((entry) => {
        if (idMap.has(entry.teacherId)) {
            scheduleUpdates++;
            return { ...entry, teacherId: idMap.get(entry.teacherId)! };
        }
        return entry;
    });

    console.log(`Updated ${idMap.size} teachers and ${scheduleUpdates} schedule entries.`);

    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    console.log('Migration complete.');
}

migrate().catch(console.error);
