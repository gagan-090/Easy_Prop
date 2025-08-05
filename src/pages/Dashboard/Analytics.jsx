import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { getUserRevenue } from '../../services/supabaseService';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const { stats, properties, leads, loading } = useDashboard();
  const [timeRange, setTimeRange] = useState('7d');
  const [activeChart, setActiveChart] = useState('overview');
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    loadRevenue();
  }, [user]);

  // Listen for property sold events to refresh revenue data
  useEffect(() => {
    const handlePropertySold = () => {
      console.log('🔄 Analytics: Property sold event received, refreshing revenue data');
      console.log('🔄 Analytics: Current user:', user);
      loadRevenue();
    };

    window.addEventListener('propertySold', handlePropertySold);
    return () => {
      window.removeEventListener('propertySold', handlePropertySold);
    };
  }, [user]);

  const loadRevenue = async () => {
    if (!user?.uid) return;
    
    console.log('🔍 Analytics: Loading revenue for user:', user.uid);
    
    try {
      const result = await getUserRevenue(user.uid);
      console.log('🔍 Analytics: Revenue result:', result);
      
      if (result.success) {
        console.log('🔍 Analytics: Revenue data:', result.data);
        setRevenue(result.data);
      } else {
        console.error('Failed to load revenue:', result.error);
        setRevenue([]);
      }
    } catch (error) {
      console.error('Error loading revenue:', error);
      setRevenue([]);
    }
  };

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

  const timeRanges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
  ];

  // Calculate analytics data from real user data
  const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalInquiries = properties.reduce((sum, p) => sum + (p.inquiries || 0), 0);
  const phoneLeads = leads.filter(l => l.contactMethod === 'phone').length;
  const emailLeads = leads.filter(l => l.contactMethod === 'email').length;
  const totalRevenue = revenue.reduce((sum, item) => sum + (item.amount || 0), 0);
  const monthlyRevenue = revenue
    .filter(item => {
      const itemDate = new Date(item.created_at);
      const currentDate = new Date();
      return itemDate.getMonth() === currentDate.getMonth() && 
             itemDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  console.log('🔍 Analytics: Revenue array:', revenue);
  console.log('🔍 Analytics: Total revenue calculated:', totalRevenue);
  console.log('🔍 Analytics: Monthly revenue calculated:', monthlyRevenue);

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const analyticsData = [
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      change: totalViews > 0 ? '+12.5%' : '0%',
      trend: totalViews > 0 ? 'up' : 'neutral',
      icon: Eye,
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      change: totalRevenue > 0 ? '+15.2%' : '0%',
      trend: totalRevenue > 0 ? 'up' : 'neutral',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Monthly Revenue',
      value: formatPrice(monthlyRevenue),
      change: monthlyRevenue > 0 ? '+8.7%' : '0%',
      trend: monthlyRevenue > 0 ? 'up' : 'neutral',
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'Total Inquiries',
      value: totalInquiries.toString(),
      change: totalInquiries > 0 ? '+15.3%' : '0%',
      trend: totalInquiries > 0 ? 'up' : 'neutral',
      icon: Mail,
      color: 'orange'
    }
  ];

  // Get top performing properties
  const topProperties = properties
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3)
    .map(property => ({
      id: property.id,
      title: property.title || 'Untitled Property',
      views: property.views || 0,
      inquiries: property.inquiries || 0,
      image: (() => {
        // Check if the image is a blob URL (temporary) and skip it
        const isValidImage = (url) => {
          if (!url) return false;
          if (url.startsWith('blob:')) return false; // Skip blob URLs
          // Allow Supabase Storage URLs
          if (url.includes('supabase.co') || url.includes('storage.googleapis.com')) return true;
          // Allow other valid URLs
          return url.startsWith('http://') || url.startsWith('https://');
        };
        
        if (property.images && property.images.length > 0 && isValidImage(property.images[0])) {
          return property.images[0];
        }
        
        // Return a fallback image based on property type
        const imageMap = {
          villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop',
          apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop',
          commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
          land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&h=100&fit=crop'
        };
        
        return imageMap[property.type] || imageMap.apartment;
      })()
    }));

  const trafficSources = [
    { source: 'Direct', percentage: 45, color: 'bg-blue-500' },
    { source: 'Google Search', percentage: 30, color: 'bg-green-500' },
    { source: 'Social Media', percentage: 15, color: 'bg-purple-500' },
    { source: 'Referrals', percentage: 10, color: 'bg-orange-500' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your property performance and visitor insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((item, index) => (
          <motion.div
            key={item.title}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/20`}>
                <item.icon className={`h-6 w-6 text-${item.color}-600 dark:text-${item.color}-400`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                item.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{item.change}</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.title}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visitor Trends
              </h3>
              <div className="flex space-x-2">
                {['overview', 'views', 'inquiries'].map((chart) => (
                  <button
                    key={chart}
                    onClick={() => setActiveChart(chart)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                      activeChart === chart
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {chart}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Chart visualization would go here</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div variants={itemVariants}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Traffic Sources
            </h3>
            
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {source.source}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${source.color}`}
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Performing Properties */}
      <motion.div variants={itemVariants}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Properties
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Property
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Inquiries
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProperties.map((property) => (
                  <tr key={property.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {property.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      {property.views.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      {property.inquiries}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-green-600 font-medium">
                        {((property.inquiries / property.views) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;