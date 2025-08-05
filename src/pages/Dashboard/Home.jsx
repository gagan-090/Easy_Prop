import React from "react";
import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import DashboardStats from "../../components/DashboardStats";
import RevenueChart from "../../components/RevenueChart";
import PropertyReferrals from "../../components/PropertyReferrals";
import TopAgents from "../../components/TopAgents";
import CustomerStats from "../../components/CustomerStats";
import LatestSales from "../../components/LatestSales";
import PropertyViewAnalytics from "../../components/PropertyViewAnalytics";

const Dashboard = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
          className="absolute bottom-32 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 rounded-full blur-3xl"
        />

        {/* Waterflow Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-200/10 to-purple-200/10 animate-pulse"></div>
          <div
            className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-transparent via-indigo-200/10 to-cyan-200/10 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-tr from-transparent via-purple-200/10 to-pink-200/10 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>

      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/5 dark:bg-black/5"></div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-8 p-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-2xl p-4 lg:p-6 border border-white/20 dark:border-gray-700/30 shadow-2xl">
            <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 opacity-80 text-sm lg:text-base">
              Welcome back {user?.name ? user.name.split(" ")[0] : "User"},
              manage your properties with style
            </p>
          </div>

          {/* Top Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search Property, Customer etc."
                className="pl-10 pr-4 py-3 w-full sm:w-80 backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-gray-600/30 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 shadow-lg"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-gray-600/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 relative shadow-lg"
              >
                <Bell className="h-6 w-6" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"
                />
              </motion.button>

              {/* User Profile */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-gray-600/30 rounded-2xl p-3 shadow-lg"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-white/50 shadow-lg"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <User
                    className="h-5 w-5 text-white"
                    style={{ display: user?.photoURL ? "none" : "flex" }}
                  />
                </motion.div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Property Manager
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>



        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <DashboardStats />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Revenue Chart - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <RevenueChart />
          </div>

          {/* Property Referrals */}
          <div>
            <PropertyReferrals />
          </div>
        </motion.div>

        {/* View Analytics Section */}
        <motion.div variants={itemVariants}>
          <PropertyViewAnalytics />
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
        >
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
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
