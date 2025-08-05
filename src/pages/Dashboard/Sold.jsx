import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProperties, getUserRevenue } from '../../services/supabaseService';
import {
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Share2,
  Copy,
  ExternalLink,
  Plus,
  SortAsc,
  SortDesc,
  MessageSquare,
  IndianRupee,
  Home,
  Activity,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  PieChart
} from 'lucide-react';

const Sold = () => {
  const { user } = useAuth();
  const [soldProperties, setSoldProperties] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadSoldProperties();
    loadRevenue();
  }, [user]);

  // Listen for property sold events to refresh data
  useEffect(() => {
    const handlePropertySold = () => {
      console.log('🔄 Sold: Property sold event received, refreshing data');
      loadSoldProperties();
      loadRevenue();
    };

    window.addEventListener('propertySold', handlePropertySold);
    return () => {
      window.removeEventListener('propertySold', handlePropertySold);
    };
  }, []);

  const loadSoldProperties = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const result = await getUserProperties(user.uid, { status: 'sold' });
      if (result.success) {
        setSoldProperties(result.data);
      } else {
        console.error('Failed to load sold properties:', result.error);
        setSoldProperties([]);
      }
    } catch (error) {
      console.error('Error loading sold properties:', error);
      setSoldProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenue = async () => {
    if (!user?.uid) return;
    
    try {
      const result = await getUserRevenue(user.uid);
      if (result.success) {
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

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sold':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredProperties = soldProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.address && property.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (property.city && property.city.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'price-high':
        return b.price - a.price;
      case 'price-low':
        return a.price - b.price;
      case 'sold-date':
        return new Date(b.updated_at) - new Date(a.updated_at);
      default:
        return 0;
    }
  });

  const totalRevenue = revenue.reduce((sum, item) => sum + (item.amount || 0), 0);
  const monthlyRevenue = revenue
    .filter(item => {
      const itemDate = new Date(item.created_at);
      const currentDate = new Date();
      return itemDate.getMonth() === currentDate.getMonth() && 
             itemDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, item) => sum + (item.amount || 0), 0);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Sold Properties
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Track your sold properties and revenue
          </p>
        </div>
      </motion.div>

      {/* Revenue Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            title: 'Total Sold Properties',
            value: soldProperties.length,
            icon: CheckCircle,
            gradient: 'from-green-500 to-green-600',
            change: '+2 this month'
          },
          {
            title: 'Total Revenue',
            value: formatPrice(totalRevenue),
            icon: DollarSign,
            gradient: 'from-blue-500 to-blue-600',
            change: '+15% this month'
          },
          {
            title: 'Monthly Revenue',
            value: formatPrice(monthlyRevenue),
            icon: BarChart3,
            gradient: 'from-purple-500 to-purple-600',
            change: '+8% this month'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-xl shadow-lg`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </motion.div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Controls */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search sold properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="sold-date">Sold Date</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Properties Grid/List */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group"
                >
                  <div className="relative">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      src={(() => {
                        const isValidImage = (url) => {
                          if (!url) return false;
                          if (url.startsWith('blob:')) return false;
                          if (url.includes('supabase.co') || url.includes('storage.googleapis.com')) return true;
                          return url.startsWith('http://') || url.startsWith('https://');
                        };
                        
                        if (property.images && property.images.length > 0 && isValidImage(property.images[0])) {
                          console.log('✅ Using actual image for sold property:', property.title, property.images[0]);
                          return property.images[0];
                        }
                        
                        const imageMap = {
                          villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center',
                          apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=center',
                          commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center',
                          land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&crop=center'
                        };
                        
                        console.log('⚠️ Using fallback image for sold property:', property.title, 'Type:', property.type);
                        return imageMap[property.type] || imageMap.apartment;
                      })()}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Sold Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Sold
                    </div>

                    {/* Revenue Badge */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 text-xs font-semibold rounded-full flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Revenue
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address && property.city ? `${property.address}, ${property.city}` : property.address || property.city || 'Location not specified'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {property.rating || 4.5}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span>{property.bedrooms} BHK</span>
                      <span>{property.area} sq ft</span>
                      <span>{property.type}</span>
                    </div>

                    <motion.p
                      whileHover={{ scale: 1.05 }}
                      className="text-2xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                    >
                      {formatPrice(property.price)}
                    </motion.p>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                        Sold
                      </motion.span>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full"
                      >
                        <DollarSign className="h-4 w-4 mr-1 text-blue-500" />
                        Revenue Added
                      </motion.span>
                    </div>

                    <div className="flex items-center justify-between">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{formatPrice(property.price)} revenue
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sold Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sold Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedProperties.map((property, index) => (
                      <motion.tr
                        key={property.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={(() => {
                                const isValidImage = (url) => {
                                  if (!url) return false;
                                  if (url.startsWith('blob:')) return false;
                                  if (url.includes('supabase.co') || url.includes('storage.googleapis.com')) return true;
                                  return url.startsWith('http://') || url.startsWith('https://');
                                };
                                
                                if (property.images && property.images.length > 0 && isValidImage(property.images[0])) {
                                  return property.images[0];
                                }
                                
                                const imageMap = {
                                  villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=64&h=64&fit=crop&crop=center',
                                  apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=64&h=64&fit=crop&crop=center',
                                  commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=64&h=64&fit=crop&crop=center',
                                  land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=64&h=64&fit=crop&crop=center'
                                };
                                
                                return imageMap[property.type] || imageMap.apartment;
                              })()}
                              alt={property.title}
                              className="w-16 h-16 rounded-xl object-cover mr-4"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {property.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {property.address && property.city ? `${property.address}, ${property.city}` : property.address || property.city || 'Location not specified'}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {property.bedrooms} BHK • {property.area} sq ft
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(property.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(property.updated_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatPrice(property.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="View Property"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="View Revenue"
                            >
                              <DollarSign className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {sortedProperties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No sold properties found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Start by marking properties as sold to track revenue'
            }
          </p>
          <Link
            to="/dashboard/my-properties"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Home className="h-5 w-5" />
            <span>View My Properties</span>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sold; 