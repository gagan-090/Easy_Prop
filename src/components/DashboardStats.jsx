import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  Building,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardStats } from "../services/supabaseService";
import { useState, useEffect } from "react";

const DashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const result = await getDashboardStats(user.uid);
      if (result.success) {
        setStats(result.data);
      } else {
        console.error("Failed to load dashboard stats:", result.error);
      }
      setLoading(false);
    };

    loadStats();
  }, [user]);

  const formatPrice = (price) => {

    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const statsConfig = [
    {
      title: "Total Properties",
      value: stats?.totalProperties || 0,
      icon: Home,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: IndianRupee,
      color: "green",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Total Cities",
      value: stats?.totalCities || 0,
      icon: MapPin,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
    },
  ];


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

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="backdrop-blur-md bg-white/20 dark:bg-black/20 p-6 rounded-3xl shadow-2xl border border-white/30 dark:border-gray-600/30 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full ml-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {statsConfig.map((stat, index) => (
        <motion.div
          key={stat.title}

          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.03 }}
          className="backdrop-blur-md bg-white/20 dark:bg-black/20 p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 dark:border-gray-600/30 hover:border-white/50 dark:hover:border-gray-500/50 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 10 }}
                className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-2xl shadow-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative w-16 h-16 ml-auto">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke={`url(#gradient-${index})`}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 28 * (1 - (stat.value > 0 ? 50 : 0) / 100), // Dummy progress
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient
                  id={`gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      stat.color === "blue"
                        ? "#3B82F6"
                        : stat.color === "orange"
                        ? "#F97316"
                        : stat.color === "green"
                        ? "#10B981"
                        : "#EC4899"
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      stat.color === "blue"
                        ? "#1D4ED8"
                        : stat.color === "orange"
                        ? "#EA580C"
                        : stat.color === "green"
                        ? "#059669"
                        : "#BE185D"
                    }
                  />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stat.value > 0 ? '50%' : '0%'}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};


export default DashboardStats;
