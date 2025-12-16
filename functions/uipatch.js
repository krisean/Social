const { Firestore } = require('firebase-admin/firestore');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const db = new Firestore({ projectId: 'dummy', credentials: null });
