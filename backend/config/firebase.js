const admin = require('firebase-admin');

let db = null;

function getFirebaseDB() {
    if (db) return db;
    if (!process.env.FIREBASE_PROJECT_ID) {
        console.warn('Firebase env vars missing — real-time features disabled');
        return null;
    }
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
    }
    db = admin.database();
    return db;
}

async function pushStatusUpdate(complaintId, status, wardId) {
    try {
        const fireDb = getFirebaseDB();
        if (!fireDb) return;
        await fireDb.ref(`complaints/${complaintId}`).set({ status, updatedAt: Date.now(), wardId });
    } catch (err) {
        console.error('Firebase push failed (non-fatal):', err.message);
    }
}

module.exports = { getFirebaseDB, pushStatusUpdate };
