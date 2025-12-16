import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
firestore.settings({ ignoreUndefinedProperties: true });

export { admin, firestore };
