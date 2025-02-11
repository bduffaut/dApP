const admin = require('firebase-admin');

// Load the service account key from the correct path
const serviceAccount = require('./serviceAccountKey.json'); // Ensure this file is in the same directory

let db; // Declare the db variable outside the function

function getFirestore() {
    if (!db) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://drunk-66c60.firebaseio.com' // Ensure this is your actual Firebase DB URL
        });
        db = admin.firestore();
    }
    return db;
}

module.exports = { getFirestore };
