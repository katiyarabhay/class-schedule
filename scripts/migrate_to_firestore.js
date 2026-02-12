
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// NOTE: You must set FIREBASE_SERVICE_ACCOUNT_PATH environment variable or hardcode it here for the script to run manually
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './service-account.json';

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Service account file not found at ${serviceAccountPath}`);
    console.error('Please download your service account key from Firebase Console and save it as service-account.json in the root directory.');
    process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrate() {
    const dataPath = path.join(__dirname, '../data.json');
    if (!fs.existsSync(dataPath)) {
        console.error('data.json not found!');
        return;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log('Starting migration...');

    // Migrate Teachers
    if (data.teachers) {
        console.log(`Migrating ${data.teachers.length} teachers...`);
        const batch = db.batch();
        for (const t of data.teachers) {
            const ref = db.collection('teachers').doc(t.id);
            batch.set(ref, t);
        }
        await batch.commit();
    }

    // Migrate Classrooms
    if (data.classrooms) {
        console.log(`Migrating ${data.classrooms.length} classrooms...`);
        const batch = db.batch();
        for (const c of data.classrooms) {
            const ref = db.collection('classrooms').doc(c.id);
            batch.set(ref, c);
        }
        await batch.commit();
    }

    // Migrate Subjects
    if (data.subjects) {
        console.log(`Migrating ${data.subjects.length} subjects...`);
        const batch = db.batch();
        for (const s of data.subjects) {
            const ref = db.collection('subjects').doc(s.id);
            batch.set(ref, s);
        }
        await batch.commit();
    }

    // Migrate Batches
    if (data.batches) {
        console.log(`Migrating ${data.batches.length} batches...`);
        const batch = db.batch();
        for (const b of data.batches) {
            const ref = db.collection('batches').doc(b.id);
            batch.set(ref, b);
        }
        await batch.commit();
    }

    // Migrate Schedule
    if (data.schedule) {
        console.log(`Migrating ${data.schedule.length} schedule entries...`);
        // Batches have a limit of 500 ops, so chunk it if needed
        const chunks = [];
        for (let i = 0; i < data.schedule.length; i += 400) {
            chunks.push(data.schedule.slice(i, i + 400));
        }

        for (const chunk of chunks) {
            const batch = db.batch();
            for (const s of chunk) {
                const ref = db.collection('schedule').doc(s.id);
                batch.set(ref, s);
            }
            await batch.commit();
        }
    }

    // Migrate Config
    if (data.config) {
        console.log('Migrating config...');
        await db.collection('metadata').doc('config').set(data.config);
    }

    console.log('Migration complete!');
}

migrate().catch(console.error);
