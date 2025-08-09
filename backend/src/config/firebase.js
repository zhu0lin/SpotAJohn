import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Build service account from env vars if present
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

// Determine if we have enough creds to use a service account
const hasServiceAccountCreds = Boolean(
  serviceAccount.project_id &&
  serviceAccount.client_email &&
  serviceAccount.private_key
);

// Initialize the app if it hasn't been initialized
if (!admin.apps.length) {
  if (hasServiceAccountCreds) {
    const config = { credential: admin.credential.cert(serviceAccount) };
    if (process.env.FIREBASE_DATABASE_URL) {
      config.databaseURL = process.env.FIREBASE_DATABASE_URL;
    }
    admin.initializeApp(config);
  } else {
    // Fallback to Application Default Credentials (e.g., Cloud Run service account)
    admin.initializeApp();
  }
}

const db = admin.firestore();

export { admin, db };


