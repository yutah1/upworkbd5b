import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    // Create a test user
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    await createUserWithEmailAndPassword(auth, email, password);
    console.log('Created and signed in as:', email);

    // Try to read gmailSellPosts
    const q = query(collection(db, 'gmailSellPosts'));
    const snap = await getDocs(q);
    console.log('Successfully read gmailSellPosts. Count:', snap.size);

  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

test();
