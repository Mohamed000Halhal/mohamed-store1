import * as admin from 'firebase-admin';

let initError: string | null = null;

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      initError = `Missing credentials: PID:${!!projectId}, CE:${!!clientEmail}, PK:${!!privateKey}`;
    } else {
      let cleanedKey = privateKey.trim();
      if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
        cleanedKey = cleanedKey.substring(1, cleanedKey.length - 1);
      }
      
      // Handle both literal \\n and literal \n (rare but possible depending on env loader)
      cleanedKey = cleanedKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: cleanedKey,
        }),
      });
    }
  } catch (error: any) {
    const pk = process.env.FIREBASE_PRIVATE_KEY || '';
    const metadata = ` [Len: ${pk.length}, Starts: ${pk.substring(0, 20)}..., Ends: ...${pk.substring(pk.length - 20)}]`;
    initError = `${error.message}${metadata}`;
    console.error('[Admin SDK] Initialization error:', error.message);
  }
}

const getAdminAuth = () => {
  if (!admin.apps.length) return { auth: null, error: initError || 'Not initialized' };
  return { auth: admin.auth(), error: null };
};

const getAdminDb = () => {
  if (!admin.apps.length) return null;
  return admin.firestore();
};

export { getAdminAuth, getAdminDb };


