import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SettingsService } from '../services/settingsService';
import { validateProfileData, validateBillingData } from '../utils/validation';

export const useSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Settings state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    photo_url: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });

  const [billingData, setBillingData] = useState({
    plan: 'free',
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    autoRenew: true
  });

  // Load user settings
  const loadSettings = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const result = await SettingsService.loadUserSettings(user.uid);

      if (result.success && result.data) {
        setProfileData(result.data.profile);
        setNotifications(result.data.notifications);
        setPreferences(result.data.preferences);
        setBillingData(result.data.billing);
      } else {
        showMessage('error', 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Message helper
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  }, []);

  // Profile operations
  const updateProfile = useCallback(async () => {
    if (!user?.uid) return;

    // Validate profile data
    const validation = validateProfileData(profileData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showMessage('error', firstError);
      return;
    }

    setSaving(true);
    try {
      const result = await SettingsService.updateProfile(user.uid, profileData);

      if (result.success) {
        showMessage('success', 'Profile updated successfully!');
      } else {
        showMessage('error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, profileData, showMessage]);

  const uploadPhoto = useCallback(async (file) => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const result = await SettingsService.uploadProfilePhoto(user.uid, file);

      if (result.success) {
        setProfileData(prev => ({ ...prev, photo_url: result.photoUrl }));
        showMessage('success', 'Profile photo updated successfully!');
      } else {
        showMessage('error', result.error || 'Failed to upload photo');
      }
    } catch (error) {
      showMessage('error', 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, showMessage]);

  // Password operations
  const updatePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
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
      const result = await SettingsService.updatePassword(currentPassword, newPassword);

      if (result.success) {
        showMessage('success', 'Password updated successfully!');
        return true;
      } else {
        showMessage('error', result.error || 'Failed to update password');
        return false;
      }
    } catch (error) {
      showMessage('error', 'Failed to update password');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showMessage]);

  // Notification operations
  const updateNotifications = useCallback(async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const result = await SettingsService.updateNotifications(user.uid, notifications, preferences);

      if (result.success) {
        showMessage('success', 'Notification preferences updated!');
      } else {
        showMessage('error', result.error || 'Failed to update notifications');
      }
    } catch (error) {
      showMessage('error', 'Failed to update notifications');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, notifications, preferences, showMessage]);

  // Billing operations
  const updateBilling = useCallback(async () => {
    if (!user?.uid) return;

    // Validate billing data
    const validation = validateBillingData(billingData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showMessage('error', firstError);
      return;
    }

    setSaving(true);
    try {
      const result = await SettingsService.updateBilling(user.uid, billingData);

      if (result.success) {
        showMessage('success', 'Billing information updated!');
      } else {
        showMessage('error', result.error || 'Failed to update billing');
      }
    } catch (error) {
      showMessage('error', 'Failed to update billing');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, billingData, showMessage]);

  // Preferences operations
  const updatePreferences = useCallback(async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const result = await SettingsService.updatePreferences(user.uid, preferences, notifications);

      if (result.success) {
        showMessage('success', 'Preferences updated!');
      } else {
        showMessage('error', result.error || 'Failed to update preferences');
      }
    } catch (error) {
      showMessage('error', 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, preferences, notifications, showMessage]);

  // Security operations
  const enable2FA = useCallback(async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const result = await SettingsService.enable2FA(user.uid);

      if (result.success) {
        showMessage('success', 'Two-factor authentication enabled!');
      } else {
        showMessage('error', result.error || 'Failed to enable 2FA');
      }
    } catch (error) {
      showMessage('error', 'Failed to enable 2FA');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, showMessage]);

  const disable2FA = useCallback(async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const result = await SettingsService.disable2FA(user.uid);

      if (result.success) {
        showMessage('success', 'Two-factor authentication disabled!');
      } else {
        showMessage('error', result.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      showMessage('error', 'Failed to disable 2FA');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, showMessage]);

  // Account operations
  const deleteAccount = useCallback(async () => {
    if (!user?.uid) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    setSaving(true);
    try {
      const result = await SettingsService.deleteAccount(user.uid);

      if (result.success) {
        showMessage('success', 'Account deletion initiated. You will be logged out shortly.');
        // Logout user after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        showMessage('error', result.error || 'Failed to delete account');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, showMessage]);

  const exportData = useCallback(async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const result = await SettingsService.exportUserData(user.uid);

      if (result.success) {
        // Create and download JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `easyprop-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showMessage('success', 'Data exported successfully!');
      } else {
        showMessage('error', result.error || 'Failed to export data');
      }
    } catch (error) {
      showMessage('error', 'Failed to export data');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, showMessage]);

  return {
    // State
    loading,
    saving,
    message,
    profileData,
    notifications,
    preferences,
    billingData,

    // Setters
    setProfileData,
    setNotifications,
    setPreferences,
    setBillingData,

    // Operations
    updateProfile,
    uploadPhoto,
    updatePassword,
    updateNotifications,
    updateBilling,
    updatePreferences,
    enable2FA,
    disable2FA,
    deleteAccount,
    exportData,

    // Utilities
    showMessage,
    loadSettings
  };
};