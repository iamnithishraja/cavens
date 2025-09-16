import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'firebase', 'amigos-c994e-firebase-adminsdk-fbsvc-0bf5718a69.json');

let firebaseApp: admin.app.App;

try {
  // Check if Firebase app is already initialized
  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      projectId: 'amigos-c994e',
    });
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  throw error;
}

export { firebaseApp };
export default admin;
