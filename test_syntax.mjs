import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';

async function testRules() {
  try {
    const testEnv = await initializeTestEnvironment({
      projectId: "demo-project-1234",
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
    console.log("Rules loaded successfully!");
    process.exit(0);
  } catch (e) {
    console.error("Rules failed to load:", e);
    process.exit(1);
  }
}

testRules();
