import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { sendOTPEmail } from '../services/emailService';
import { createUserProfile, getUserProfile } from '../services/supabaseService';
import supabase from '../services/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          phone: firebaseUser.phoneNumber,
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL
        };
        
        // Check if user profile exists in Supabase, create if not
        try {
          console.log('🔍 Fetching user profile for:', firebaseUser.uid);
          
          // Try to fetch profile with retry mechanism for newly registered users
          let profileResult = null;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            profileResult = await getUserProfile(firebaseUser.uid);
            console.log(`📊 Profile result (attempt ${retryCount + 1}):`, profileResult);
            
            if (profileResult.success && profileResult.data) {
              break; // Profile found, exit retry loop
            }
            
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`⏳ Profile not found, retrying in 1 second... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (profileResult.success && profileResult.data) {
            // Update userData with profile information from Supabase
            userData.userType = profileResult.data.user_type || 'agent';
            userData.company = profileResult.data.company || '';
            userData.phone = profileResult.data.phone || userData.phone;
            userData.photoURL = profileResult.data.photo_url || userData.photoURL;
            console.log('✅ User type set from Supabase:', userData.userType);
          } else {
            // Check if this is a newly registered user with temporary user type
            const tempUserType = localStorage.getItem('temp_user_type');
            if (tempUserType) {
              console.log('🎯 Found temporary user type for new user:', tempUserType);
              userData.userType = tempUserType;
              userData.company = '';
              // Clear the temporary user type
              localStorage.removeItem('temp_user_type');
            } else {
              // For existing users without profiles, ensure profile exists
              console.log('⚠️ User profile not found, ensuring profile exists');
              const ensureResult = await ensureUserProfile(firebaseUser);
              
              if (ensureResult.success) {
                console.log('✅ User profile ensured');
                userData.userType = ensureResult.data?.user_type || 'agent';
                userData.company = ensureResult.data?.company || '';
                userData.phone = ensureResult.data?.phone || userData.phone;
              } else {
                console.log('⚠️ Failed to ensure user profile, using default agent type');
                userData.userType = 'agent';
                userData.company = '';
              }
            }
          }
        } catch (error) {
          console.error('❌ Error checking user profile:', error);
          // Set default userType if there's an error
          userData.userType = 'agent';
          userData.company = '';
        }
        
        console.log('👤 Final user data:', userData);
        
        setUser(userData);
      } else {
        // User is signed out
        setUser(null);
      }
      
      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [initializing]);

  // Email/Password login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Wait for the auth state to update
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsubscribe();
            resolve({ success: true, user: result.user });
          }
        });
        
        // Fallback timeout
        setTimeout(() => {
          unsubscribe();
          resolve({ success: true, user: result.user });
        }, 2000);
      });
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register with email/password
  const register = async (userData) => {
    setLoading(true);
    try {
      const { email, password, name, phone } = userData;
      
      // Create user account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: name
      });

      return { 
        success: true, 
        message: 'Registration successful! You are now logged in.',
        user: result.user 
      };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check if email is already registered
  const checkEmailExists = async (email) => {
    try {
      // Try to create a user with a dummy password to check if email exists
      // This will throw an error if email is already in use
      const tempPassword = 'temp123456';
      await createUserWithEmailAndPassword(auth, email, tempPassword);
      
      // If we reach here, email doesn't exist, so delete the temp user
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.delete();
      }
      
      return { success: true, exists: false };
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        return { success: true, exists: true };
      }
      
      // For other errors, assume email doesn't exist
      return { success: true, exists: false };
    }
  };

  // Send email verification OTP
  const sendEmailOTP = async (email, userName = 'User') => {
    try {
      // First check if email is already registered
      const emailCheck = await checkEmailExists(email);
      if (emailCheck.exists) {
        return { 
          success: false, 
          error: 'Email is already registered. Please use a different email or try logging in.'
        };
      }

      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP securely (in production, use a secure backend database)
      localStorage.setItem(`email_otp_${email}`, JSON.stringify({
        otp: otp,
        timestamp: Date.now(),
        email: email
      }));
      
      // Send OTP via email service
      const emailResult = await sendOTPEmail(email, otp, userName);
      
      if (emailResult.success) {
        return { 
          success: true, 
          message: 'OTP sent to your email address. Please check your inbox.'
        };
      } else {
        // If email sending fails, remove the stored OTP
        localStorage.removeItem(`email_otp_${email}`);
        return emailResult;
      }
    } catch (error) {
      console.error('Email OTP send error:', error);
      return { success: false, error: 'Failed to send OTP. Please try again.' };
    }
  };

  // Verify email OTP
  const verifyEmailOTP = async (email, inputOtp) => {
    try {
      const storedData = localStorage.getItem(`email_otp_${email}`);
      if (!storedData) {
        return { success: false, error: 'No OTP found. Please request a new one.' };
      }

      const { otp, timestamp } = JSON.parse(storedData);
      const currentTime = Date.now();
      const otpAge = currentTime - timestamp;
      
      // OTP expires after 10 minutes
      if (otpAge > 10 * 60 * 1000) {
        localStorage.removeItem(`email_otp_${email}`);
        return { success: false, error: 'OTP has expired. Please request a new one.' };
      }

      if (otp !== inputOtp) {
        return { success: false, error: 'Invalid OTP. Please try again.' };
      }

      // Clear the OTP after successful verification
      localStorage.removeItem(`email_otp_${email}`);
      return { success: true, message: 'Email verified successfully!' };
    } catch (error) {
      console.error('Email OTP verification error:', error);
      return { success: false, error: 'OTP verification failed. Please try again.' };
    }
  };

  // Register with email and OTP verification
  const registerWithEmailOTP = async (userData, otp) => {
    setLoading(true);
    try {
      const { email, password, name, userType } = userData;
      
      // First verify the email OTP
      const otpResult = await verifyEmailOTP(email, otp);
      if (!otpResult.success) {
        return otpResult;
      }

      // Store user type temporarily for the auth state listener
      localStorage.setItem('temp_user_type', userType);
      console.log('💾 Stored temporary user type:', userType);

      // Create user account after OTP verification
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: name
      });

      // Create user profile in Supabase with user type
      try {
        console.log('📝 Creating user profile with user type:', userType);
        const profileResult = await createUserProfile(result.user.uid, {
          email,
          name,
          phone: userData.phone,
          user_type: userType,
          company: userData.company
        });
        console.log('✅ Profile creation result:', profileResult);
        
        if (!profileResult.success) {
          console.error('❌ Failed to create user profile:', profileResult.error);
        }
      } catch (profileError) {
        console.error('❌ Error creating user profile:', profileError);
        // Don't fail registration if profile creation fails
      }

      return { 
        success: true, 
        message: 'Registration successful! You are now logged in.',
        user: result.user 
      };
    } catch (error) {
      console.error('Email registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      // Clean up temporary user type
      localStorage.removeItem('temp_user_type');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Wait for the auth state to update
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
          if (authUser) {
            unsubscribe();
            resolve({ 
              success: true, 
              user: user,
              message: 'Successfully signed in with Google!'
            });
          }
        });
        
        // Fallback timeout
        setTimeout(() => {
          unsubscribe();
          resolve({ 
            success: true, 
            user: user,
            message: 'Successfully signed in with Google!'
          });
        }, 2000);
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data from Supabase
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const profileResult = await getUserProfile(user.uid);
      if (profileResult.success && profileResult.data) {
        setUser(prevUser => ({
          ...prevUser,
          userType: profileResult.data.user_type,
          company: profileResult.data.company,
          phone: profileResult.data.phone,
          photoURL: profileResult.data.photo_url
        }));
      } else {
        // Profile doesn't exist, ensure it exists
        console.log('🔄 Ensuring user profile exists during refresh');
        const ensureResult = await ensureUserProfile(user);
        if (ensureResult.success) {
          setUser(prevUser => ({
            ...prevUser,
            userType: ensureResult.data?.user_type || 'agent',
            company: ensureResult.data?.company || '',
            phone: ensureResult.data?.phone || prevUser.phone,
            photoURL: ensureResult.data?.photo_url || prevUser.photoURL
          }));
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Check Firebase connection
  const checkFirebaseConnection = async () => {
    try {
      // Try to get current user - this will test the connection
      const currentUser = auth.currentUser;
      return { 
        success: true, 
        connected: true,
        user: currentUser,
        message: 'Firebase connection is working properly'
      };
    } catch (error) {
      console.error('Firebase connection error:', error);
      return { 
        success: false, 
        connected: false,
        error: error.message,
        message: 'Firebase connection failed'
      };
    }
  };

  // Function to ensure user profile exists
  const ensureUserProfile = async (firebaseUser) => {
    try {
      const profileResult = await getUserProfile(firebaseUser.uid);
      
      if (profileResult.success && profileResult.data) {
        return { success: true, data: profileResult.data };
      }
      
      // Profile doesn't exist, create one
      console.log('🔄 Creating user profile for:', firebaseUser.uid);
      const createResult = await createUserProfile(firebaseUser.uid, {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        user_type: 'agent',
        company: '',
        phone: firebaseUser.phoneNumber || null
      });
      
      if (createResult.success) {
        console.log('✅ User profile created successfully');
        return createResult;
      } else {
        // If creation failed due to duplicate email, try to find existing user by email
        if (createResult.error && createResult.error.includes('duplicate key value violates unique constraint')) {
          console.log('🔍 User profile creation failed due to duplicate email, searching by email...');
          
          // Try to find user by email instead of ID
          const { data: existingUser, error: searchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', firebaseUser.email)
            .maybeSingle();
          
          if (!searchError && existingUser) {
            console.log('✅ Found existing user profile by email:', existingUser.id);
            // Update the existing user's ID to match Firebase UID if different
            if (existingUser.id !== firebaseUser.uid) {
              console.log('🔄 Updating user ID to match Firebase UID');
              const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({ id: firebaseUser.uid })
                .eq('email', firebaseUser.email)
                .select()
                .single();
              
              if (!updateError && updatedUser) {
                return { success: true, data: updatedUser };
              }
            }
            return { success: true, data: existingUser };
          }
        }
        
        console.error('❌ Failed to create user profile:', createResult.error);
        return { success: false, error: createResult.error };
      }
    } catch (error) {
      console.error('❌ Error ensuring user profile:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to update user data in the context
  const updateUser = (data) => {
    setUser(prevUser => ({
      ...prevUser,
      ...data
    }));
  };

  const value = {
    user,
    login,
    register,
    registerWithEmailOTP,
    sendEmailOTP,
    verifyEmailOTP,
    checkEmailExists,
    signInWithGoogle,
    logout,
    refreshUserData,
    ensureUserProfile,
    updateUser,
    loading: loading || initializing,
    isAuthenticated: !!user,
    checkFirebaseConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
