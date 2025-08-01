import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, User } from 'lucide-react';
import DashboardStats from '../../components/DashboardStats';
import RevenueChart from '../../components/RevenueChart';
import PropertyReferrals from '../../components/PropertyReferrals';
import TopAgents from '../../components/TopAgents';
import CustomerStats from '../../components/CustomerStats';
import LatestSales from '../../components/LatestSales';

const Dashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>
        
        {/* Top Navigation */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search Property, Customer etc."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
            />
          </div>
          
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Hawkins Maru"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Hawkins Maru
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Company Manager
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        
        {/* Property Referrals */}
        <div>
          <PropertyReferrals />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Agents */}
        <div>
          <TopAgents />
        </div>
        
        {/* Customer Stats */}
        <div>
          <CustomerStats />
        </div>
        
        {/* Latest Sales */}
        <div>
          <LatestSales />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;