import React from 'react';
import { motion } from 'framer-motion';

const PropertyReferrals = () => {
  const referralData = [
    { source: 'Social Media', percentage: 64, color: 'bg-blue-500' },
    { source: 'Marketplaces', percentage: 40, color: 'bg-green-500' },
    { source: 'Websites', percentage: 50, color: 'bg-yellow-500' },
    { source: 'Digital Ads', percentage: 80, color: 'bg-red-500' },
    { source: 'Others', percentage: 15, color: 'bg-gray-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Property Referrals
      </h3>
      
      <div className="space-y-4">
        {referralData.map((item, index) => (
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
        ))}
      </div>
    </motion.div>
  );
};

export default PropertyReferrals;