import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MoreHorizontal } from 'lucide-react';

const RevenueChart = () => {
  const monthlyData = [
    { month: 'Jan', lastMonth: 500000, runningMonth: 450000 },
    { month: 'Feb', lastMonth: 600000, runningMonth: 520000 },
    { month: 'Mar', lastMonth: 550000, runningMonth: 480000 },
    { month: 'Apr', lastMonth: 400000, runningMonth: 350000 },
    { month: 'May', lastMonth: 700000, runningMonth: 650000 },
    { month: 'Jun', lastMonth: 750000, runningMonth: 680000 },
    { month: 'Jul', lastMonth: 600000, runningMonth: 520000 }
  ];

  const maxValue = Math.max(...monthlyData.flatMap(d => [d.lastMonth, d.runningMonth]));

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Total Revenue
          </h3>
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              ₹2,36,535
            </motion.div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-blue-500 font-medium">0.8%</span>
              <span className="text-gray-500 dark:text-gray-400">Than last Month</span>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="flex items-center space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">₹27,000</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">₹18,000</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between px-4">
          {monthlyData.map((data, index) => (
            <div key={data.month} className="flex flex-col items-center space-y-2">
              <div className="flex items-end space-x-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.lastMonth / maxValue) * 200}px` }}
                  transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                  className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.runningMonth / maxValue) * 200}px` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                  className="w-6 bg-gradient-to-t from-purple-400 to-purple-300 rounded-t-md"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {data.month}
              </span>
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>800K</span>
          <span>600K</span>
          <span>400K</span>
          <span>200K</span>
          <span>0K</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueChart;