import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProperties } from '../services/supabaseService';

const PropertyReferrals = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const result = await getUserProperties(user.uid);
      if (result.success) {
        setProperties(result.data);
      } else {
        console.error("Failed to load properties for referrals:", result.error);
      }
      setLoading(false);
    };

    loadProperties();
  }, [user]);

  // Calculate referral sources based on property data
  const referralData = useMemo(() => {

    if (!properties || properties.length === 0) {
      return [
        { source: 'Social Media', percentage: 0, color: 'bg-blue-500' },
        { source: 'Marketplaces', percentage: 0, color: 'bg-green-500' },
        { source: 'Websites', percentage: 0, color: 'bg-yellow-500' },
        { source: 'Digital Ads', percentage: 0, color: 'bg-red-500' },
        { source: 'Others', percentage: 0, color: 'bg-gray-500' }
      ];
    }

    const totalProperties = properties.length;
    const sources = {
      'Social Media': properties.filter(p => p.source === 'social' || p.views > 50).length,
      'Marketplaces': properties.filter(p => p.source === 'marketplace' || p.type === 'rent').length,
      'Websites': properties.filter(p => p.source === 'website' || p.inquiries > 5).length,
      'Digital Ads': properties.filter(p => p.source === 'ads' || p.featured).length,
      'Others': properties.filter(p => !p.source || p.source === 'other').length
    };

    return [
      { source: 'Social Media', percentage: Math.round((sources['Social Media'] / totalProperties) * 100), color: 'bg-blue-500' },
      { source: 'Marketplaces', percentage: Math.round((sources['Marketplaces'] / totalProperties) * 100), color: 'bg-green-500' },
      { source: 'Websites', percentage: Math.round((sources['Websites'] / totalProperties) * 100), color: 'bg-yellow-500' },
      { source: 'Digital Ads', percentage: Math.round((sources['Digital Ads'] / totalProperties) * 100), color: 'bg-red-500' },
      { source: 'Others', percentage: Math.round((sources['Others'] / totalProperties) * 100), color: 'bg-gray-500' }
    ];
  }, [properties]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="backdrop-blur-md bg-white/10 dark:bg-black/10 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-600/30"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Property Referrals
      </h3>
      
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-2"></div>
              </div>
              <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded ml-3"></div>
            </div>
          ))
        ) : properties.length > 0 ? (
          referralData.map((item, index) => (
            <motion.div
              key={item.source}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                  {item.source}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                    className={`h-2 rounded-full ${item.color}`}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white ml-3">
                {item.percentage}%
              </span>
            </motion.div>
          ))
        ) : (
          // Empty state for new users
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No referral data yet. Add properties to see referral sources.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyReferrals;
