import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getDashboardStats, 
  getUserProperties, 
  getUserLeads, 
  getUserRevenue,
  createUserProfile 
} from '../services/supabaseService';

export const useDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
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
  });
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user profile if it doesn't exist
  const initializeUserProfile = async (userId, userData) => {
    try {
      const result = await createUserProfile(userId, {
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL
      });
      
      if (result.success) {
        console.log('User profile initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      // Get dashboard stats
      const statsResult = await getDashboardStats(user.uid);
      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        // If user profile doesn't exist, create it
        await initializeUserProfile(user.uid, user);
        // Try getting stats again
        const retryStats = await getDashboardStats(user.uid);
        if (retryStats.success) {
          setStats(retryStats.data);
        }
      }

      // Get recent properties
      const propertiesResult = await getUserProperties(user.uid, { limit: 10 });
      if (propertiesResult.success) {
        setProperties(propertiesResult.data);
      }

      // Get recent leads
      const leadsResult = await getUserLeads(user.uid, { limit: 10 });
      if (leadsResult.success) {
        setLeads(leadsResult.data);
      }

      // Get revenue data
      const revenueResult = await getUserRevenue(user.uid, 'month');
      if (revenueResult.success) {
        setRevenue(revenueResult.data);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    loadDashboardData();
  };

  // Load data when user changes
  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    } else {
      // Reset data when user logs out
      setStats({
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
      });
      setProperties([]);
      setLeads([]);
      setRevenue([]);
      setLoading(false);
    }
  }, [user?.uid]);

  // Listen for property sold events to refresh dashboard data
  useEffect(() => {
    const handlePropertySold = () => {
      console.log('🔄 useDashboard: Property sold event received, refreshing dashboard data');
      loadDashboardData();
    };

    window.addEventListener('propertySold', handlePropertySold);
    return () => {
      window.removeEventListener('propertySold', handlePropertySold);
    };
  }, []);

  return {
    stats,
    properties,
    leads,
    revenue,
    loading,
    error,
    refreshDashboard,
    isAuthenticated: !!user
  };
};