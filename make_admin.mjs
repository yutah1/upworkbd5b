import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function makeAdmin() {
  const docRef = doc(db, 'users', 'DOxi3X1WihOlWDLQogdTgKoRbFR2');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log('Current role:', snap.data().role);
    await updateDoc(docRef, { role: 'admin' });
    console.log('Updated role to admin');
  } else {
    console.log('User does not exist');
  }
  process.exit(0);
}
makeAdmin().catch(console.error);
