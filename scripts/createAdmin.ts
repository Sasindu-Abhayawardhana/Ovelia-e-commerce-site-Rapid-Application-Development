import * as admin from 'firebase-admin';
import * as path from 'path';

// 1. Initialize Firebase Admin SDK
// You must have a service account key JSON file available locally.
// E.g. download from Firebase Console -> Project Settings -> Service Accounts
// and save as `service-account.json` in the root of the project.
try {
  const serviceAccount = require(path.join(__dirname, '../service-account.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.error("Error: Could not load service-account.json.");
  console.error("Please download your service account key from Firebase Console and save it as 'service-account.json' in the project root.");
  process.exit(1);
}

const db = admin.firestore();

async function makeAdmin(email: string) {
  if (!email) {
    console.error("Usage: ts-node scripts/createAdmin.ts <user-email>");
    process.exit(1);
  }

  try {
    // 1. Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${userRecord.uid}`);

    // 2. Set custom user claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('Successfully set custom claims.');

    // 3. Update Firestore user document
    await db.collection('users').doc(userRecord.uid).set({
      role: 'admin'
    }, { merge: true });
    console.log('Successfully updated Firestore user document.');

    console.log(`\nSuccess! ${email} is now an admin.`);
    console.log("Please sign out and sign back in for the new claims to take effect.");
    process.exit(0);
  } catch (error) {
    console.error("Error making user admin:", error);
    process.exit(1);
  }
}

const emailArg = process.argv[2];
makeAdmin(emailArg);
