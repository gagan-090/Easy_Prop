import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Building,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  IndianRupee
} from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    {
      title: 'Properties for Sale',
      value: 684,
      icon: Home,
      color: 'blue',
      progress: 75,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Properties for Rent',
      value: 546,
      icon: Building,
      color: 'orange',
      progress: 60,
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Total Customer',
      value: '5,732',
      icon: Users,
      color: 'green',
      progress: 85,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Total City',
      value: 90,
      icon: MapPin,
      color: 'pink',
      progress: 45,
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg`}
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
                  strokeDashoffset: 2 * Math.PI * 28 * (1 - stat.progress / 100)
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={stat.color === 'blue' ? '#3B82F6' : 
                    stat.color === 'orange' ? '#F97316' :
                    stat.color === 'green' ? '#10B981' : '#EC4899'} />
                  <stop offset="100%" stopColor={stat.color === 'blue' ? '#1D4ED8' : 
                    stat.color === 'orange' ? '#EA580C' :
                    stat.color === 'green' ? '#059669' : '#BE185D'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stat.progress}%
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;