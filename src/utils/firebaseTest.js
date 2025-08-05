import { auth } from '../firebase';
import { connectAuthEmulator } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Check if auth is initialized
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    
    console.log('Firebase Auth initialized:', {
      app: auth.app.name,
      config: {
        apiKey: auth.config.apiKey ? 'Present' : 'Missing',
        authDomain: auth.config.authDomain,
        projectId: auth.config.projectId
      }
    });
    
    // Check current user
    const currentUser = auth.currentUser;
    console.log('Current user:', currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified
    } : 'No user signed in');
    
    return {
      success: true,
      message: 'Firebase connection successful',
      details: {
        authInitialized: true,
        projectId: auth.config.projectId,
        currentUser: currentUser ? currentUser.uid : null
      }
    };
    
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return {
      success: false,
      message: 'Firebase connection failed',
      error: error.message
    };
  }
};

export const getFirebaseConfig = () => {
  return {
    apiKey: auth.config.apiKey ? 'Present' : 'Missing',
    authDomain: auth.config.authDomain,
    projectId: auth.config.projectId,
    storageBucket: auth.config.storageBucket,
    messagingSenderId: auth.config.messagingSenderId,
    appId: auth.config.appId
  };
};