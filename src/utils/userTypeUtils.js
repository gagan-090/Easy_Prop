// Utility functions for user type management
import { updateUserProfile } from '../services/supabaseService';

// Function to update user type
export const updateUserType = async (userId, userType) => {
  try {
    console.log('🔄 Updating user type for:', userId, 'to:', userType);
    
    if (!['agent', 'owner'].includes(userType)) {
      throw new Error('Invalid user type. Must be "agent" or "owner"');
    }
    
    const result = await updateUserProfile(userId, {
      user_type: userType
    });
    
    console.log('✅ User type update result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error updating user type:', error);
    return { success: false, error: error.message };
  }
};

// Function to get user type display text
export const getUserTypeDisplay = (userType) => {
  switch (userType) {
    case 'owner':
      return 'Owner';
    case 'agent':
      return 'Agent';
    default:
      return 'Agent'; // Default fallback
  }
};

// Function to check if user is owner
export const isOwner = (user) => {
  return user?.userType === 'owner';
};

// Function to get dashboard stats configuration based on user type
export const getDashboardStatsConfig = (userType, stats) => {
  const isOwnerUser = userType === 'owner';
  
  return [
    {
      title: isOwnerUser ? "My Properties for Sale" : "Properties for Sale",
      value: stats.propertiesForSale || 0,
      key: 'propertiesForSale'
    },
    {
      title: isOwnerUser ? "My Properties for Rent" : "Properties for Rent",
      value: stats.propertiesForRent || 0,
      key: 'propertiesForRent'
    },
    {
      title: isOwnerUser ? "Total Inquiries" : "Total Customers",
      value: stats.totalCustomers || 0,
      key: 'totalCustomers'
    },
    {
      title: isOwnerUser ? "Property Views" : "Total Cities",
      value: isOwnerUser ? (stats.totalViews || 0) : (stats.totalCities || 0),
      key: isOwnerUser ? 'totalViews' : 'totalCities'
    }
  ];
};