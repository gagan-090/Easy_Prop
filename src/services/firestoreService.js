import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// User Profile Management
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userProfile = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Initialize empty stats for new users
      stats: {
        totalProperties: 0,
        propertiesForSale: 0,
        propertiesForRent: 0,
        totalCustomers: 0,
        totalCities: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalLeads: 0,
        activeLeads: 0,
        convertedLeads: 0
      },
      preferences: {
        theme: 'light',
        notifications: true,
        emailUpdates: true
      }
    };
    
    await setDoc(userRef, userProfile);
    return { success: true, data: userProfile };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Property Management
export const addProperty = async (userId, propertyData) => {
  try {
    const batch = writeBatch(db);
    
    // Add property to properties collection
    const propertyRef = doc(collection(db, 'properties'));
    const property = {
      ...propertyData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      views: 0,
      inquiries: 0
    };
    
    batch.set(propertyRef, property);
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    const statsUpdate = {
      'stats.totalProperties': increment(1),
      updatedAt: serverTimestamp()
    };
    
    if (propertyData.type === 'sale') {
      statsUpdate['stats.propertiesForSale'] = increment(1);
    } else if (propertyData.type === 'rent') {
      statsUpdate['stats.propertiesForRent'] = increment(1);
    }
    
    batch.update(userRef, statsUpdate);
    
    await batch.commit();
    return { success: true, data: { id: propertyRef.id, ...property } };
  } catch (error) {
    console.error('Error adding property:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProperties = async (userId, filters = {}) => {
  try {
    let q = query(
      collection(db, 'properties'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const properties = [];
    
    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: properties };
  } catch (error) {
    console.error('Error getting user properties:', error);
    return { success: false, error: error.message };
  }
};

export const updateProperty = async (propertyId, updates) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating property:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProperty = async (userId, propertyId, propertyType) => {
  try {
    const batch = writeBatch(db);
    
    // Delete property
    const propertyRef = doc(db, 'properties', propertyId);
    batch.delete(propertyRef);
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    const statsUpdate = {
      'stats.totalProperties': increment(-1),
      updatedAt: serverTimestamp()
    };
    
    if (propertyType === 'sale') {
      statsUpdate['stats.propertiesForSale'] = increment(-1);
    } else if (propertyType === 'rent') {
      statsUpdate['stats.propertiesForRent'] = increment(-1);
    }
    
    batch.update(userRef, statsUpdate);
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: error.message };
  }
};

// Lead Management
export const addLead = async (userId, leadData) => {
  try {
    const batch = writeBatch(db);
    
    // Add lead to leads collection
    const leadRef = doc(collection(db, 'leads'));
    const lead = {
      ...leadData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'new'
    };
    
    batch.set(leadRef, lead);
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      'stats.totalLeads': increment(1),
      'stats.activeLeads': increment(1),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    return { success: true, data: { id: leadRef.id, ...lead } };
  } catch (error) {
    console.error('Error adding lead:', error);
    return { success: false, error: error.message };
  }
};

export const getUserLeads = async (userId, filters = {}) => {
  try {
    let q = query(
      collection(db, 'leads'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const leads = [];
    
    querySnapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: leads };
  } catch (error) {
    console.error('Error getting user leads:', error);
    return { success: false, error: error.message };
  }
};

export const updateLeadStatus = async (userId, leadId, oldStatus, newStatus) => {
  try {
    const batch = writeBatch(db);
    
    // Update lead
    const leadRef = doc(db, 'leads', leadId);
    batch.update(leadRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    // Update user stats based on status change
    const userRef = doc(db, 'users', userId);
    const statsUpdate = { updatedAt: serverTimestamp() };
    
    if (oldStatus === 'new' && newStatus === 'converted') {
      statsUpdate['stats.activeLeads'] = increment(-1);
      statsUpdate['stats.convertedLeads'] = increment(1);
    } else if (oldStatus === 'new' && newStatus === 'closed') {
      statsUpdate['stats.activeLeads'] = increment(-1);
    } else if (oldStatus === 'converted' && newStatus === 'closed') {
      statsUpdate['stats.convertedLeads'] = increment(-1);
    }
    
    batch.update(userRef, statsUpdate);
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, error: error.message };
  }
};

// Analytics and Revenue
export const addRevenue = async (userId, revenueData) => {
  try {
    const batch = writeBatch(db);
    
    // Add revenue record
    const revenueRef = doc(collection(db, 'revenue'));
    const revenue = {
      ...revenueData,
      userId,
      createdAt: serverTimestamp()
    };
    
    batch.set(revenueRef, revenue);
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      'stats.totalRevenue': increment(revenueData.amount),
      'stats.monthlyRevenue': increment(revenueData.amount),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    return { success: true, data: { id: revenueRef.id, ...revenue } };
  } catch (error) {
    console.error('Error adding revenue:', error);
    return { success: false, error: error.message };
  }
};

export const getUserRevenue = async (userId, timeframe = 'all') => {
  try {
    let q = query(
      collection(db, 'revenue'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    // Add time-based filtering if needed
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate));
      }
    }
    
    const querySnapshot = await getDocs(q);
    const revenue = [];
    
    querySnapshot.forEach((doc) => {
      revenue.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: revenue };
  } catch (error) {
    console.error('Error getting user revenue:', error);
    return { success: false, error: error.message };
  }
};

// Dashboard Analytics
export const getDashboardStats = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile.success) {
      // Return empty stats for new users
      return {
        success: true,
        data: {
          totalProperties: 0,
          propertiesForSale: 0,
          propertiesForRent: 0,
          totalCustomers: 0,
          totalCities: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalLeads: 0,
          activeLeads: 0,
          convertedLeads: 0
        }
      };
    }
    
    return {
      success: true,
      data: userProfile.data.stats || {
        totalProperties: 0,
        propertiesForSale: 0,
        propertiesForRent: 0,
        totalCustomers: 0,
        totalCities: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalLeads: 0,
        activeLeads: 0,
        convertedLeads: 0
      }
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { success: false, error: error.message };
  }
};

// Property Views and Inquiries
export const incrementPropertyViews = async (propertyId) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing property views:', error);
    return { success: false, error: error.message };
  }
};

export const incrementPropertyInquiries = async (propertyId) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      inquiries: increment(1),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing property inquiries:', error);
    return { success: false, error: error.message };
  }
};

// Analytics and Reporting
export const getAnalyticsData = async (userId, timeframe = '30d') => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get properties analytics
    const propertiesResult = await getUserProperties(userId);
    const properties = propertiesResult.success ? propertiesResult.data : [];
    
    // Get leads analytics
    const leadsResult = await getUserLeads(userId);
    const leads = leadsResult.success ? leadsResult.data : [];
    
    // Calculate analytics
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalInquiries = properties.reduce((sum, p) => sum + (p.inquiries || 0), 0);
    const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;
    
    // Filter leads by timeframe
    const recentLeads = leads.filter(lead => {
      const leadDate = lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
      return leadDate >= startDate && leadDate <= endDate;
    });

    return {
      success: true,
      data: {
        totalViews,
        totalInquiries,
        conversionRate,
        recentLeads: recentLeads.length,
        properties: properties.length,
        leads: leads.length,
        timeframe,
        startDate,
        endDate
      }
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return { success: false, error: error.message };
  }
};

// Notification Management
export const createNotification = async (userId, notificationData) => {
  try {
    const notificationRef = doc(collection(db, 'notifications'));
    const notification = {
      ...notificationData,
      userId,
      read: false,
      archived: false,
      createdAt: serverTimestamp()
    };
    
    await setDoc(notificationRef, notification);
    return { success: true, data: { id: notificationRef.id, ...notification } };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.message };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

// Search and Filtering
export const searchProperties = async (userId, searchParams) => {
  try {
    let q = query(
      collection(db, 'properties'),
      where('userId', '==', userId)
    );
    
    // Add filters based on search parameters
    if (searchParams.type) {
      q = query(q, where('type', '==', searchParams.type));
    }
    
    if (searchParams.status) {
      q = query(q, where('status', '==', searchParams.status));
    }
    
    if (searchParams.city) {
      q = query(q, where('city', '==', searchParams.city));
    }
    
    if (searchParams.minPrice && searchParams.maxPrice) {
      q = query(q, 
        where('price', '>=', searchParams.minPrice),
        where('price', '<=', searchParams.maxPrice)
      );
    }
    
    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));
    
    if (searchParams.limit) {
      q = query(q, limit(searchParams.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const properties = [];
    
    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: properties };
  } catch (error) {
    console.error('Error searching properties:', error);
    return { success: false, error: error.message };
  }
};

// Bulk Operations
export const bulkUpdateProperties = async (userId, propertyIds, updates) => {
  try {
    const batch = writeBatch(db);
    
    propertyIds.forEach(propertyId => {
      const propertyRef = doc(db, 'properties', propertyId);
      batch.update(propertyRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error bulk updating properties:', error);
    return { success: false, error: error.message };
  }
};

export const bulkDeleteProperties = async (userId, propertyIds) => {
  try {
    const batch = writeBatch(db);
    
    propertyIds.forEach(propertyId => {
      const propertyRef = doc(db, 'properties', propertyId);
      batch.delete(propertyRef);
    });
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      'stats.totalProperties': increment(-propertyIds.length),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error bulk deleting properties:', error);
    return { success: false, error: error.message };
  }
};

// Data Export
export const exportUserData = async (userId, dataType = 'all') => {
  try {
    const exportData = {};
    
    if (dataType === 'all' || dataType === 'properties') {
      const propertiesResult = await getUserProperties(userId);
      if (propertiesResult.success) {
        exportData.properties = propertiesResult.data;
      }
    }
    
    if (dataType === 'all' || dataType === 'leads') {
      const leadsResult = await getUserLeads(userId);
      if (leadsResult.success) {
        exportData.leads = leadsResult.data;
      }
    }
    
    if (dataType === 'all' || dataType === 'revenue') {
      const revenueResult = await getUserRevenue(userId);
      if (revenueResult.success) {
        exportData.revenue = revenueResult.data;
      }
    }
    
    return { success: true, data: exportData };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return { success: false, error: error.message };
  }
};

// Statistics Calculation
export const recalculateUserStats = async (userId) => {
  try {
    // Get all user data
    const [propertiesResult, leadsResult, revenueResult] = await Promise.all([
      getUserProperties(userId),
      getUserLeads(userId),
      getUserRevenue(userId)
    ]);
    
    const properties = propertiesResult.success ? propertiesResult.data : [];
    const leads = leadsResult.success ? leadsResult.data : [];
    const revenue = revenueResult.success ? revenueResult.data : [];
    
    // Calculate statistics
    const stats = {
      totalProperties: properties.length,
      propertiesForSale: properties.filter(p => p.type === 'sale').length,
      propertiesForRent: properties.filter(p => p.type === 'rent').length,
      totalCustomers: new Set(leads.map(l => l.email)).size,
      totalCities: new Set(properties.map(p => p.city)).size,
      totalRevenue: revenue.reduce((sum, r) => sum + (r.amount || 0), 0),
      monthlyRevenue: revenue.filter(r => {
        const revenueDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
        const now = new Date();
        return revenueDate.getMonth() === now.getMonth() && revenueDate.getFullYear() === now.getFullYear();
      }).reduce((sum, r) => sum + (r.amount || 0), 0),
      totalLeads: leads.length,
      activeLeads: leads.filter(l => ['new', 'contacted', 'qualified'].includes(l.status)).length,
      convertedLeads: leads.filter(l => l.status === 'converted').length
    };
    
    // Update user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      stats,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error recalculating user stats:', error);
    return { success: false, error: error.message };
  }
};