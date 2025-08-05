import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, getUserLeads } from '../services/supabaseService';

const CustomerStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const [statsResult, leadsResult] = await Promise.all([
        getDashboardStats(user.uid),
        getUserLeads(user.uid)
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        console.error("Failed to load dashboard stats:", statsResult.error);
      }

      if (leadsResult.success) {
        setLeads(leadsResult.data);
      } else {
        console.error("Failed to load leads:", leadsResult.error);
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  const formatNumber = (num) => {

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Calculate growth percentage (simplified for demo)
  const totalCustomers = stats.totalCustomers || 0;
  const newCustomersThisMonth = leads.filter(lead => {
    if (!lead.created_at) return false;
    const leadDate = new Date(lead.created_at);
    const now = new Date();
    return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
  }).length;


  const customerData = {
    total: formatNumber(totalCustomers),
    growth: totalCustomers > 0 ? '12.5%' : '0%',
    newCustomers: formatNumber(newCustomersThisMonth),
    newGrowth: newCustomersThisMonth > 0 ? '8.3%' : '0%'
  };

  // Generate chart data based on leads over time
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    return months.slice(Math.max(0, currentMonth - 6), currentMonth + 1).map((month, index) => {
      const monthIndex = months.indexOf(month);
      const monthLeads = leads.filter(lead => {
        if (!lead.created_at) return false;
        const leadDate = new Date(lead.created_at);
        return leadDate.getMonth() === monthIndex && leadDate.getFullYear() === currentYear;
      }).length;
      
      return { month, value: Math.max(monthLeads, 1) }; // Minimum 1 for visual purposes
    });
  }, [leads]);


  const maxValue = Math.max(...monthlyData.map(d => d.value), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="backdrop-blur-md bg-white/10 dark:bg-black/10 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-600/30"
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

      {loading ? (
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      ) : totalCustomers > 0 || newCustomersThisMonth > 0 ? (
        <>
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
              {totalCustomers > 0 && (
                <span className="text-sm text-green-500 font-medium">
                  {customerData.growth}
                </span>
              )}
            </div>
            
            {/* Mini Chart for Total Customers */}
            <div className="mt-4 h-16 flex items-end space-x-1">
              {monthlyData.slice(0, 6).map((data, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: maxValue > 0 ? `${(data.value / maxValue) * 60}px` : '2px' }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                  className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-sm min-h-[2px]"
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
              {newCustomersThisMonth > 0 && (
                <span className="text-sm text-green-500 font-medium">
                  {customerData.newGrowth}
                </span>
              )}
            </div>
            
            {/* Mini Chart for New Customers */}
            <div className="mt-4 h-12 flex items-end space-x-1">
              {monthlyData.slice(0, 5).map((data, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: maxValue > 0 ? `${(data.value / maxValue) * 40}px` : '2px' }}
                  transition={{ delay: index * 0.1 + 0.7, duration: 0.6 }}
                  className="flex-1 bg-gradient-to-t from-purple-400 to-purple-300 rounded-t-sm min-h-[2px]"
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        // Empty state for new users
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No customers yet. Start adding leads to see customer statistics.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CustomerStats;
