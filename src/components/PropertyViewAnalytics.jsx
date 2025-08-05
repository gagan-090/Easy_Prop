import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, TrendingUp, Users, Calendar, BarChart3, 
  ArrowUpRight, ArrowDownRight, Activity, Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserViewAnalytics, getUserPropertiesWithAnalytics } from '../services/supabaseService';

const PropertyViewAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Load user's total view analytics
      const analyticsResult = await getUserViewAnalytics(user.uid);
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }

      // Load properties with individual analytics
      const propertiesResult = await getUserPropertiesWithAnalytics(user.uid);
      if (propertiesResult.success) {
        setProperties(propertiesResult.data);
      }
    } catch (error) {
      console.error('Error loading view analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPercentageChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">View Analytics</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Activity className="h-4 w-4" />
            <span>Last 30 days</span>
          </div>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total Views */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Views</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatNumber(analytics.totalViews)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </motion.div>

            {/* Recent Views */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Recent Views</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatNumber(analytics.recentViews)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </motion.div>

            {/* Unique Viewers */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Unique Viewers</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatNumber(analytics.uniqueViewers)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </motion.div>

            {/* Avg Views per Property */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Avg per Property</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatNumber(analytics.averageViewsPerProperty)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Property-Specific Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-3xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-slate-900 mb-6">Property Performance</h3>
        
        <div className="space-y-4">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">{property.title}</h4>
                  <p className="text-sm text-slate-600">{property.address}</p>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Total Views */}
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Total Views</p>
                    <p className="text-lg font-bold text-slate-900">{property.views || 0}</p>
                  </div>

                  {/* Recent Views */}
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Recent</p>
                    <p className="text-lg font-bold text-blue-600">
                      {property.analytics?.views_this_month || 0}
                    </p>
                  </div>

                  {/* Today's Views */}
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Today</p>
                    <p className="text-lg font-bold text-green-600">
                      {property.analytics?.views_today || 0}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      property.analytics?.views_today > 0 
                        ? 'bg-green-500' 
                        : property.analytics?.views_this_month > 0 
                        ? 'bg-yellow-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs text-slate-500">
                      {property.analytics?.views_today > 0 
                        ? 'Active' 
                        : property.analytics?.views_this_month > 0 
                        ? 'Recent' 
                        : 'Quiet'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No properties found. Add properties to see view analytics.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PropertyViewAnalytics; 