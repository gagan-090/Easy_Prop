import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

const CustomerStats = () => {
  const customerData = {
    total: '5007k',
    growth: '31.73%',
    newCustomers: '12k',
    newGrowth: '31.73%'
  };

  const monthlyData = [
    { month: 'Jan', value: 30 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 35 },
    { month: 'Apr', value: 50 },
    { month: 'May', value: 40 },
    { month: 'Jun', value: 60 },
    { month: 'Jul', value: 45 }
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Customer
        </h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Total Customers */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Total Customers
        </p>
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            {customerData.total}
          </motion.div>
          <span className="text-sm text-green-500 font-medium">
            {customerData.growth}
          </span>
        </div>
        
        {/* Mini Chart for Total Customers */}
        <div className="mt-4 h-16 flex items-end space-x-1">
          {monthlyData.slice(0, 6).map((data, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(data.value / maxValue) * 60}px` }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
              className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-sm"
            />
          ))}
        </div>
      </div>

      {/* New Customers This Month */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          New Customers This Month
        </p>
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {customerData.newCustomers}
          </motion.div>
          <span className="text-sm text-green-500 font-medium">
            {customerData.newGrowth}
          </span>
        </div>
        
        {/* Mini Chart for New Customers */}
        <div className="mt-4 h-12 flex items-end space-x-1">
          {monthlyData.slice(0, 5).map((data, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(data.value / maxValue) * 40}px` }}
              transition={{ delay: index * 0.1 + 0.7, duration: 0.6 }}
              className="flex-1 bg-gradient-to-t from-purple-400 to-purple-300 rounded-t-sm"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerStats;