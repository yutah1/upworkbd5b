const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const docRef = doc(db, 'users', 'DOxi3X1WihOlWDLQogdTgKoRbFR2');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log('User exists:', snap.data());
  } else {
    console.log('User does not exist');
  }
}
check().catch(console.error);
