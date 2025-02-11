const admin = require('firebase-admin');

const serviceAccount = require('./path/to/your/serviceAccountKey.json'); // Replace with the actual path

let db; // Declare the db variable outside the function

function getFirestore() {
  if (!db) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://drunk-66c60.firebaseio.com' // Replace with your database URL
    });
    db = admin.firestore();
  }
  return db;
}

module.exports = { getFirestore };
