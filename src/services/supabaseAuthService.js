import { auth } from '../firebase';
import supabase from './supabaseClient.js';

// Create a custom Supabase client that uses Firebase auth token
export const createAuthenticatedSupabaseClient = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated with Firebase');
  }
  
  // Get Firebase ID token
  const idToken = await user.getIdToken();
  
  // You would need to implement a backend endpoint that:
  // 1. Verifies the Firebase token
  // 2. Creates a Supabase JWT token
  // 3. Returns the Supabase token
  
  // For now, we'll use the regular client but add user validation
  return supabase;
};

// Validate Firebase user before Supabase operations
export const validateFirebaseUser = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated with Firebase to perform this action');
  }
  return user;
};