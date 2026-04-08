const admin = require('firebase-admin');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: config.projectId
});

const db = admin.firestore();
db.settings({ databaseId: config.firestoreDatabaseId });

async function check() {
  const docRef = db.collection('users').doc('DOxi3X1WihOlWDLQogdTgKoRbFR2');
  const snap = await docRef.get();
  if (snap.exists) {
    console.log('User exists:', snap.data());
  } else {
    console.log('User does not exist');
  }
}
check().catch(console.error);
