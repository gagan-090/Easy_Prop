import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Camera, Bell, Shield, Palette, Globe, CreditCard,
  Key, Trash2, Save, Eye, EyeOff, Upload, Check, X, AlertCircle, Loader
} from 'lucide-react';

// ============================================================================
// FIREBASE CONFIGURATION & INITIALIZATION
// Using the existing Firebase configuration from firebase.js
// ============================================================================
import { auth, db } from '../../firebase';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Custom hook to handle user data from Firestore
 */
const useUserData = (user) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No user data found in Firestore. Initializing with default data.");
        setDoc(userRef, {
          name: user.displayName || user.name || 'New User',
          email: user.email,
          phone: '',
          photo_url: user.photoURL || '',
          profile: { address: '', bio: '' },
          preferences: {
            theme: 'light',
            language: 'en',
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            notifications: {
              email: true,
              push: true,
              sms: false,
              marketing: true
            }
          },
          subscription: {
            plan: 'free',
            paymentMethod: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            billingAddress: '',
            autoRenew: true
          },
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user data from Firestore:", error);
      setError(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { userData, loading, error };
};



// ============================================================================
// IMAGE UPLOAD SERVICE
// Using data URLs for immediate functionality
// ============================================================================
const uploadImagesToStorage = async (images) => {
  console.log('uploadImagesToStorage called with:', images);
  
  try {
    const uploadPromises = images.map(async (fileObj) => {
      const file = fileObj.file;
      console.log('Processing file:', file.name, 'Size:', file.size);
      
      // Convert file to data URL for immediate display
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('File converted to data URL');
          resolve(reader.result);
        };
        reader.onerror = () => {
          console.error('Error reading file');
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    });
    
    console.log('Waiting for all uploads to complete...');
    const urls = await Promise.all(uploadPromises);
    console.log('All uploads completed, URLs:', urls);
    return urls;
  } catch (error) {
    console.error('Error processing images:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: dataLoading, error } = useUserData(user);
  const loading = authLoading || dataLoading;
  
  // Debug logging
  console.log('Settings Component Debug:', {
    user: user,
    userUid: user?.uid,
    authLoading: authLoading,
    dataLoading: dataLoading,
    loading: loading,
    error: error,
    userData: userData
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    photo_url: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true
  });

  // Billing state
  const [billingData, setBillingData] = useState({
    plan: 'free',
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    autoRenew: true
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });

  // Effect to load user data from the useUserData hook
  useEffect(() => {
    if (userData) {
      const [firstName, ...lastNameParts] = (userData.name || '').split(' ');
      const lastName = lastNameParts.join(' ');
      
      setProfileData({
        firstName: firstName || '',
        lastName: lastName || '',
        email: userData.email || user.email || '',
        phone: userData.phone || '',
        address: userData.profile?.address || '',
        bio: userData.profile?.bio || '',
        photo_url: userData.photo_url || ''
      });
      setNotifications(userData.preferences?.notifications || notifications);
      setPreferences(userData.preferences || preferences);
      setBillingData(userData.subscription || billingData);
    }
  }, [userData, user]);

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (event) => {
    console.log('handlePhotoUpload called');
    
    if (!user?.uid) {
      showMessage('error', 'You must be logged in to save changes.');
      return;
    }
    
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size should be less than 5MB');
      return;
    }

    setSaving(true);
    console.log('Starting upload process...');
    
    try {
      const imageData = [{ file }];
      console.log('Calling uploadImagesToStorage with:', imageData);
      
      const uploadedUrls = await uploadImagesToStorage(imageData);
      console.log('Upload completed, URLs:', uploadedUrls);
      
      if (uploadedUrls.length > 0) {
        const photoUrl = uploadedUrls[0];
        console.log('Updating Firestore with photo URL:', photoUrl);
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { photo_url: photoUrl });
        setProfileData(prev => ({ ...prev, photo_url: photoUrl }));
        showMessage('success', 'Profile photo updated successfully! (Using local data URL)');
        console.log('Photo upload completed successfully');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      showMessage('error', `Failed to upload photo: ${error.message}`);
    } finally {
      console.log('Setting saving to false');
      setSaving(false);
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    console.log('handleSaveProfile called with user:', user);
    console.log('user?.uid:', user?.uid);
    console.log('auth.currentUser:', auth.currentUser);
    
    if (!user?.uid) {
      console.log('User not authenticated, showing error message');
      showMessage('error', 'You must be logged in to save changes.');
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        phone: profileData.phone,
        profile: {
          address: profileData.address,
          bio: profileData.bio
        }
      };
      await updateDoc(userRef, updateData);
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    if (!user?.uid) {
      showMessage('error', 'You must be logged in to save changes.');
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Password should be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', 'Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      let errorMessage = 'Failed to update password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      }
      showMessage('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handle notifications save
  const handleSaveNotifications = async () => {
    if (!user?.uid) {
      showMessage('error', 'You must be logged in to save changes.');
      return;
    }
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { preferences: { ...preferences, notifications } });
      showMessage('success', 'Notification preferences updated!');
    } catch (error) {
      console.error('Error updating notifications:', error);
      showMessage('error', 'Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };

  // Handle billing save
  const handleSaveBilling = async () => {
    if (!user?.uid) {
      showMessage('error', 'You must be logged in to save changes.');
      return;
    }
    setSaving(true);
    try {
      const { cvv, ...billingUpdates } = billingData; // Don't save CVV
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { subscription: { ...billingUpdates, updatedAt: new Date().toISOString() } });
      showMessage('success', 'Billing information updated!');
    } catch (error) {
      console.error('Error updating billing:', error);
      showMessage('error', 'Failed to update billing information');
    } finally {
      setSaving(false);
    }
  };

  // Handle preferences save
  const handleSavePreferences = async () => {
    if (!user?.uid) {
      showMessage('error', 'You must be logged in to save changes.');
      return;
    }
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { preferences: { ...preferences, notifications } });
      showMessage('success', 'Preferences updated!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      showMessage('error', 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 max-w-md text-center">
            <p>Firebase connection issue detected. Some features may not work properly.</p>
            <p className="mt-1">Error: {error.message}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      {/* Firebase Connection Warning */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg flex items-center space-x-2 bg-yellow-50 text-yellow-800 border border-yellow-200"
        >
          <AlertCircle className="h-5 w-5" />
          <span>Firebase connection issue detected. Some features may not work properly.</span>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Message Display */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <nav className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>

                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {profileData.photo_url ? (
                        <img
                          src={profileData.photo_url}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                        className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Profile Photo
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload a new profile photo (max 5MB)
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                        className="mt-2 flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <textarea
                      rows={3}
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your address"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Push Notifications
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive push notifications in browser
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          SMS Notifications
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive notifications via SMS
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Marketing Updates
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive updates about new features and promotions
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.marketing}
                        onChange={(e) => setNotifications(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <button
                        onClick={handleUpdatePassword}
                        disabled={saving}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Key className="h-4 w-4" />
                        )}
                        <span>{saving ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Enable 2FA
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-red-600 mb-4">
                      Danger Zone
                    </h3>
                    <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-600">
                            Delete Account
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Appearance & Preferences
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Theme
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['light', 'dark', 'system'].map((theme) => (
                        <div
                          key={theme}
                          onClick={() => setPreferences(prev => ({ ...prev, theme }))}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            preferences.theme === theme
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <div className={`w-full h-20 rounded mb-3 ${
                            theme === 'light' ? 'bg-white border' :
                            theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'
                          }`}></div>
                          <p className="text-center font-medium text-gray-900 dark:text-white capitalize">
                            {theme}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Language
                    </h3>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="en">English (US)</option>
                      <option value="en-gb">English (UK)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Currency
                    </h3>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                      <option value="AUD">Australian Dollar (A$)</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Timezone
                    </h3>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSavePreferences}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Billing & Subscription
                </h2>

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {billingData.plan} Plan
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {billingData.plan === 'free' ? 'Free forever' : `₹999/month • Auto-renew ${billingData.autoRenew ? 'enabled' : 'disabled'}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          billingData.plan === 'free'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {billingData.plan === 'free' ? 'Free' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Choose Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'free', name: 'Free', price: '₹0', features: ['5 Properties', 'Basic Support', 'Standard Features'] },
                        { id: 'pro', name: 'Pro', price: '₹999', features: ['50 Properties', 'Priority Support', 'Advanced Features', 'Analytics'] },
                        { id: 'enterprise', name: 'Enterprise', price: '₹2999', features: ['Unlimited Properties', '24/7 Support', 'All Features', 'Custom Branding'] }
                      ].map((plan) => (
                        <div
                          key={plan.id}
                          onClick={() => setBillingData(prev => ({ ...prev, plan: plan.id }))}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            billingData.plan === plan.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}<span className="text-sm font-normal">/month</span></p>
                          <ul className="mt-2 space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <Check className="h-3 w-3 text-green-500 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  {billingData.plan !== 'free' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Payment Method
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Method
                          </label>
                          <select
                            value={billingData.paymentMethod}
                            onChange={(e) => setBillingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select Payment Method</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="debit_card">Debit Card</option>
                            <option value="upi">UPI</option>
                            <option value="net_banking">Net Banking</option>
                            <option value="wallet">Digital Wallet</option>
                          </select>
                        </div>

                        {(billingData.paymentMethod === 'credit_card' || billingData.paymentMethod === 'debit_card') && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  value={billingData.cardNumber}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');
                                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                    if (value.length <= 19) {
                                      setBillingData(prev => ({ ...prev, cardNumber: value }));
                                    }
                                  }}
                                  placeholder="1234 5678 9012 3456"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  value={billingData.expiryDate}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');
                                    if (value.length >= 2) {
                                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                    }
                                    if (value.length <= 5) {
                                      setBillingData(prev => ({ ...prev, expiryDate: value }));
                                    }
                                  }}
                                  placeholder="MM/YY"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  CVV
                                </label>
                                <input
                                  type="password"
                                  value={billingData.cvv}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 4) {
                                      setBillingData(prev => ({ ...prev, cvv: value }));
                                    }
                                  }}
                                  placeholder="123"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>

                              <div className="flex items-center pt-6">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={billingData.autoRenew}
                                    onChange={(e) => setBillingData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-renew</span>
                                </label>
                              </div>
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Billing Address
                          </label>
                          <textarea
                            rows={3}
                            value={billingData.billingAddress}
                            onChange={(e) => setBillingData(prev => ({ ...prev, billingAddress: e.target.value }))}
                            placeholder="Enter billing address"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing History */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Billing History
                    </h3>
                    <div className="space-y-3">
                      {billingData.plan === 'free' ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No billing history available for free plan</p>
                        </div>
                      ) : (
                        [
                          { date: 'Dec 15, 2024', amount: '₹999.00', status: 'Paid', plan: 'Pro Plan' },
                          { date: 'Nov 15, 2024', amount: '₹999.00', status: 'Paid', plan: 'Pro Plan' },
                          { date: 'Oct 15, 2024', amount: '₹999.00', status: 'Paid', plan: 'Pro Plan' }
                        ].map((invoice, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {invoice.date}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {invoice.plan} Subscription
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {invoice.amount}
                              </p>
                              <span className="text-sm text-green-600">
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveBilling}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      <span>{saving ? 'Saving...' : 'Save Billing Info'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;
