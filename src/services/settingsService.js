import { updateUserProfile, getUserProfile, uploadImagesToStorage } from './supabaseService';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

export class SettingsService {
  // Profile Management
  static async updateProfile(userId, profileData) {
    try {
      const updateData = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        phone: profileData.phone,
        profile: {
          address: profileData.address,
          bio: profileData.bio
        }
      };
      
      const result = await updateUserProfile(userId, updateData);
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async uploadProfilePhoto(userId, file) {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please select a valid image file' };
      }
      
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Image size should be less than 5MB' };
      }
      
      // Upload to storage
      const imageData = [{ file }];
      const uploadedUrls = await uploadImagesToStorage(imageData, userId);
      
      if (uploadedUrls.length > 0) {
        const photoUrl = uploadedUrls[0];
        
        // Update user profile with new photo URL
        const result = await updateUserProfile(userId, {
          photo_url: photoUrl
        });
        
        if (result.success) {
          return { success: true, photoUrl };
        }
      }
      
      return { success: false, error: 'Failed to upload photo' };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      return { success: false, error: error.message };
    }
  }

  // Password Management
  static async updatePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error updating password:', error);
      
      let errorMessage = 'Failed to update password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Notifications Management
  static async updateNotifications(userId, notifications, preferences) {
    try {
      const result = await updateUserProfile(userId, {
        preferences: {
          ...preferences,
          notifications
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error updating notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Billing Management
  static async updateBilling(userId, billingData) {
    try {
      const result = await updateUserProfile(userId, {
        subscription: {
          ...billingData,
          cvv: undefined, // Never store CVV
          updatedAt: new Date().toISOString()
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error updating billing:', error);
      return { success: false, error: error.message };
    }
  }

  // Preferences Management
  static async updatePreferences(userId, preferences, notifications) {
    try {
      const result = await updateUserProfile(userId, {
        preferences: {
          ...preferences,
          notifications
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Load User Settings
  static async loadUserSettings(userId) {
    try {
      const result = await getUserProfile(userId);
      
      if (result.success && result.data) {
        const userData = result.data;
        
        return {
          success: true,
          data: {
            profile: {
              firstName: userData.name?.split(' ')[0] || '',
              lastName: userData.name?.split(' ').slice(1).join(' ') || '',
              email: userData.email || '',
              phone: userData.phone || '',
              address: userData.profile?.address || '',
              bio: userData.profile?.bio || '',
              photo_url: userData.photo_url || ''
            },
            notifications: userData.preferences?.notifications || {
              email: true,
              push: true,
              sms: false,
              marketing: true
            },
            preferences: {
              theme: userData.preferences?.theme || 'light',
              language: userData.preferences?.language || 'en',
              currency: userData.preferences?.currency || 'INR',
              timezone: userData.preferences?.timezone || 'Asia/Kolkata'
            },
            billing: {
              plan: userData.subscription?.plan || 'free',
              paymentMethod: userData.subscription?.paymentMethod || '',
              cardNumber: userData.subscription?.cardNumber || '',
              expiryDate: userData.subscription?.expiryDate || '',
              cvv: '',
              billingAddress: userData.subscription?.billingAddress || '',
              autoRenew: userData.subscription?.autoRenew !== false
            }
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error loading user settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Plan Management
  static getPlanDetails(planId) {
    const plans = {
      free: {
        name: 'Free',
        price: '₹0',
        features: ['5 Properties', 'Basic Support', 'Standard Features'],
        limits: {
          properties: 5,
          storage: '100MB',
          support: 'Email only'
        }
      },
      pro: {
        name: 'Pro',
        price: '₹999',
        features: ['50 Properties', 'Priority Support', 'Advanced Features', 'Analytics'],
        limits: {
          properties: 50,
          storage: '10GB',
          support: 'Priority email & chat'
        }
      },
      enterprise: {
        name: 'Enterprise',
        price: '₹2999',
        features: ['Unlimited Properties', '24/7 Support', 'All Features', 'Custom Branding'],
        limits: {
          properties: 'Unlimited',
          storage: '100GB',
          support: '24/7 phone & email'
        }
      }
    };
    
    return plans[planId] || plans.free;
  }

  // Security Features
  static async enable2FA(userId) {
    // Placeholder for 2FA implementation
    try {
      // This would integrate with a 2FA service like Google Authenticator
      // For now, just update user preferences
      const result = await updateUserProfile(userId, {
        security: {
          twoFactorEnabled: true,
          twoFactorSetupAt: new Date().toISOString()
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return { success: false, error: error.message };
    }
  }

  static async disable2FA(userId) {
    try {
      const result = await updateUserProfile(userId, {
        security: {
          twoFactorEnabled: false,
          twoFactorDisabledAt: new Date().toISOString()
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return { success: false, error: error.message };
    }
  }

  // Account Management
  static async deleteAccount(userId) {
    try {
      // This would be a soft delete - mark account as deleted
      const result = await updateUserProfile(userId, {
        status: 'deleted',
        deletedAt: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, error: error.message };
    }
  }

  // Export user data (GDPR compliance)
  static async exportUserData(userId) {
    try {
      const result = await getUserProfile(userId);
      
      if (result.success) {
        // Create a comprehensive export of user data
        const exportData = {
          profile: result.data,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        };
        
        return { success: true, data: exportData };
      }
      
      return result;
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { success: false, error: error.message };
    }
  }
}