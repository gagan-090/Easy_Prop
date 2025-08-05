import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserRevenue } from '../services/supabaseService';

const RevenueChart = () => {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRevenue = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const result = await getUserRevenue(user.uid);
      if (result.success) {
        setRevenue(result.data);
      } else {
        console.error("Failed to load revenue:", result.error);
      }
      setLoading(false);
    };

    loadRevenue();
  }, [user]);

  // Generate monthly data from revenue records or use empty data for new users
  const monthlyData = useMemo(() => {
    if (!revenue || revenue.length === 0) {
      // Return empty data for new users
      return [
        { month: 'Jan', lastMonth: 0, runningMonth: 0 },
        { month: 'Feb', lastMonth: 0, runningMonth: 0 },
        { month: 'Mar', lastMonth: 0, runningMonth: 0 },
        { month: 'Apr', lastMonth: 0, runningMonth: 0 },
        { month: 'May', lastMonth: 0, runningMonth: 0 },
        { month: 'Jun', lastMonth: 0, runningMonth: 0 },
        { month: 'Jul', lastMonth: 0, runningMonth: 0 }
      ];
    }

    // Process revenue data by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    return months.slice(Math.max(0, currentMonth - 6), currentMonth + 1).map((month, index) => {
      const monthIndex = months.indexOf(month);
      const monthRevenue = revenue.filter(r => {
        const revenueDate = r.created_at ? new Date(r.created_at) : new Date();
        return revenueDate.getMonth() === monthIndex && revenueDate.getFullYear() === currentYear;
      });
      
      const totalRevenue = monthRevenue.reduce((sum, r) => sum + (r.amount || 0), 0);
      
      return {
        month,
        lastMonth: totalRevenue,
        runningMonth: totalRevenue,
      };
    });
  }, [revenue]);

  const totalRevenue = useMemo(() => revenue.reduce((sum, r) => sum + (r.amount || 0), 0), [revenue]);
  
  const monthlyRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return revenue
      .filter(r => {
        const revenueDate = new Date(r.created_at);
        return revenueDate.getMonth() === currentMonth && revenueDate.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [revenue]);

  const maxValue = Math.max(...monthlyData.flatMap(d => [d.lastMonth, d.runningMonth]), 1);

  
  // Calculate growth percentage
  const growthPercentage = totalRevenue > 0 ? ((monthlyRevenue / totalRevenue) * 100).toFixed(1) : 0;
  const isPositiveGrowth = growthPercentage >= 0;

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)} K`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="backdrop-blur-md bg-white/10 dark:bg-black/10 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-600/30"
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
              {loading ? '...' : formatPrice(totalRevenue)}
            </motion.div>
            {!loading && totalRevenue > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                {isPositiveGrowth ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-medium ${isPositiveGrowth ? 'text-green-500' : 'text-red-500'}`}>
                  {growthPercentage}%
                </span>
                <span className="text-gray-500 dark:text-gray-400">This Month</span>
              </div>
            )}
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

      {!loading && totalRevenue > 0 && (
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {formatPrice(totalRevenue)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Monthly: {formatPrice(monthlyRevenue)}
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative h-64">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center space-y-2">
                  <div className="flex items-end space-x-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: maxValue > 0 ? `${(data.lastMonth / maxValue) * 200}px` : '2px' }}
                      transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                      className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md min-h-[2px]"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: maxValue > 0 ? `${(data.runningMonth / maxValue) * 200}px` : '2px' }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                      className="w-6 bg-gradient-to-t from-purple-400 to-purple-300 rounded-t-md min-h-[2px]"
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
              <span>{formatPrice(maxValue)}</span>
              <span>{formatPrice(maxValue * 0.75)}</span>
              <span>{formatPrice(maxValue * 0.5)}</span>
              <span>{formatPrice(maxValue * 0.25)}</span>
              <span>₹0</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default RevenueChart;
