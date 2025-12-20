import fs from 'fs/promises';
import path from 'path';
import { Teacher, Classroom, Subject, Batch, ScheduleEntry, SchedulerConfig, DAYS_OF_WEEK } from './types';

const DB_PATH = path.join(process.cwd(), 'data.json');

export interface DBData {
    teachers: Teacher[];
    classrooms: Classroom[];
    subjects: Subject[];
    batches: Batch[];
    config: SchedulerConfig;
    schedule: ScheduleEntry[];
}

const defaultData: DBData = {
    teachers: [],
    classrooms: [],
    subjects: [],
    batches: [],
    config: {
        daysPerWeek: DAYS_OF_WEEK.slice(0, 5),
        slotsPerDay: 6,
    },
    schedule: [],
};

export class JSONDB {
    private async ensureDB() {
        try {
            await fs.access(DB_PATH);
        } catch {
            await fs.writeFile(DB_PATH, JSON.stringify(defaultData, null, 2));
        }
    }

    async read(): Promise<DBData> {
        await this.ensureDB();
        const data = await fs.readFile(DB_PATH, 'utf-8');
        try {
            return JSON.parse(data) as DBData;
        } catch (e) {
            console.error("Failed to parse DB, returning default", e);
            return defaultData;
        }
    }

    async write(data: DBData): Promise<void> {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    }

    async update<K extends keyof DBData>(key: K, updateFn: (items: DBData[K]) => DBData[K]): Promise<DBData[K]> {
        const data = await this.read();
        data[key] = updateFn(data[key]);
        await this.write(data);
        return data[key];
    }
}

export const db = new JSONDB();
