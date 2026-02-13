import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.json');

function verify() {
    if (!fs.existsSync(DB_PATH)) {
        console.error('data.json not found');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const teachers = data.teachers;
    const schedule = data.schedule;

    let errors = 0;

    console.log(`Verifying ${teachers.length} teachers...`);
    const teacherIds = new Set(teachers.map((t: any) => t.id));

    teachers.forEach((t: any) => {
        if (t.id.includes('-') && t.id.length > 10 && !t.id.startsWith('FAC-')) {
            // Weak check for UUID, but good enough given our migration logic
            console.warn(`[WARNING] Teacher ${t.name} has suspicious ID: ${t.id}`);
            // Not necessarily an error if user manually added a UUID, but we expect codes now.
        } else {
            console.log(`[OK] Teacher ${t.name}: ${t.id}`);
        }
    });

    console.log(`Verifying ${schedule.length} schedule entries...`);
    schedule.forEach((entry: any) => {
        if (!teacherIds.has(entry.teacherId)) {
            console.error(`[ERROR] Schedule entry ${entry.id} references missing teacher: ${entry.teacherId}`);
            errors++;
        }
    });

    if (errors === 0) {
        console.log('Verification Success: All Data Integrity Checks Passed.');
    } else {
        console.error(`Verification Failed: ${errors} errors found.`);
        process.exit(1);
    }
}

verify();
