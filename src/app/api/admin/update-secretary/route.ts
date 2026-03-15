import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { auth: adminAuth, error: initError } = getAdminAuth();
    
    // Check for Firebase Admin SDK environment variables
    if (!adminAuth) {
      return NextResponse.json({ 
        success: false, 
        error: `Firebase Admin SDK not initialized: ${initError}`
      }, { status: 400 });
    }

    // 1. Basic Authorization Check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Strict admin check - based on the admin email observed in logs
    if (decodedToken.email !== 'mohamed@store.com') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { email, password, name, originalEmail } = await request.json();


    if (!originalEmail) {
      return NextResponse.json({ success: false, error: 'Original email is required' }, { status: 400 });
    }

    // 2. Find user in Firebase Auth
    let user;
    try {
      user = await adminAuth.getUserByEmail(originalEmail);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        return NextResponse.json({ success: false, error: 'User not found in Authentication' }, { status: 404 });
      }
      throw e;
    }

    // 3. Prepare update data
    const updateData: any = {};
    if (email && email.toLowerCase().trim() !== originalEmail.toLowerCase().trim()) {
      updateData.email = email.toLowerCase().trim();
    }
    if (password && password.trim() !== '') {
      updateData.password = password.trim();
    }
    if (name) {
      updateData.displayName = name;
    }

    // 4. Update Auth User
    if (Object.keys(updateData).length > 0) {
      await adminAuth.updateUser(user.uid, updateData);
      console.log(`Successfully updated Auth for user: ${user.uid}`);
    }

    return NextResponse.json({ 
      success: true, 
      uid: user.uid,
      message: 'Admin SDK update successful' 
    });
  } catch (error: any) {
    console.error('API Error updating secretary:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
