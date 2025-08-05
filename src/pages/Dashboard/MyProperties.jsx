import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPropertiesWithAnalytics, deleteProperty, updateProperty } from '../../services/supabaseService';
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
  Clock
} from 'lucide-react';

const MyProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    loadProperties();
  }, [user]);

  // Listen for property added events to refresh data
  useEffect(() => {
    const handlePropertyAdded = () => {
      console.log('🔄 MyProperties: Property added event received, refreshing data');
      loadProperties();
    };

    window.addEventListener('propertyAdded', handlePropertyAdded);
    return () => {
      window.removeEventListener('propertyAdded', handlePropertyAdded);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if dropdown is open and click is not on dropdown content or button
      if (openDropdownId && 
          !event.target.closest('.dropdown-container') && 
          !event.target.closest('.dropdown-button')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const loadProperties = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const result = await getUserPropertiesWithAnalytics(user.uid);
      if (result.success) {
        setProperties(result.data);
      } else {
        console.error('Failed to load properties:', result.error);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId, propertyType) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const result = await deleteProperty(user.uid, propertyId, propertyType);
      if (result.success) {
        setProperties(prevProperties => 
          prevProperties.filter(property => property.id !== propertyId)
        );
      } else {
        alert('Failed to delete property: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
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
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'sold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.address && property.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (property.city && property.city.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesFilter;
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
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

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
            My Properties
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Manage and track your property listings
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/dashboard/add-property"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Property</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          {
            title: 'Total Properties',
            value: properties.length,
            icon: Home,
            gradient: 'from-blue-500 to-blue-600',
            change: '+2 this month'
          },
          {
            title: 'Active Listings',
            value: properties.filter(p => p.status === 'active').length,
            icon: Activity,
            gradient: 'from-green-500 to-green-600',
            change: '+1 this week'
          },
          {
            title: 'Total Views',
            value: properties.reduce((sum, p) => sum + p.views, 0).toLocaleString(),
            icon: Eye,
            gradient: 'from-purple-500 to-purple-600',
            change: '+12% this month'
          },
          {
            title: 'Total Inquiries',
            value: properties.reduce((sum, p) => sum + p.inquiries, 0),
            icon: MessageSquare,
            gradient: 'from-orange-500 to-orange-600',
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
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="inactive">Inactive</option>
            </select>

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
              <option value="views">Most Viewed</option>
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
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
                >
                  <div className="relative">
                                         <motion.img
                       whileHover={{ scale: 1.1 }}
                       transition={{ duration: 0.3 }}
                       src={(() => {
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
                           console.log('✅ Using actual image for property:', property.title, property.images[0]);
                           return property.images[0];
                         }
                         
                         // Return a fallback image based on property type
                         const imageMap = {
                           villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center',
                           apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=center',
                           commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center',
                           land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&crop=center'
                         };
                         
                         console.log('⚠️ Using fallback image for property:', property.title, 'Type:', property.type);
                         return imageMap[property.type] || imageMap.apartment;
                       })()}
                       alt={property.title}
                       className="w-full h-48 object-cover"
                     />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </div>

                    {/* Featured Badge */}
                    {property.featured && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 text-xs font-semibold rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/view-property/${property.id}`);
                        }}
                        className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
                        title="View Property"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/edit-property/${property.id}`);
                        }}
                        className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
                        title="Edit Property"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/share-property/${property.id}`);
                        }}
                        className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
                        title="Share Property"
                      >
                        <Share2 className="h-4 w-4" />
                      </motion.button>
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
                      className="text-2xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                      {formatPrice(property.price)}
                    </motion.p>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full"
                        title={`${property.analytics?.views_today || 0} views today, ${property.analytics?.views_this_month || 0} this month`}
                      >
                        <Eye className="h-4 w-4 mr-1 text-blue-500" />
                        {property.views || 0} views
                        {property.analytics?.views_today > 0 && (
                          <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded">
                            +{property.analytics.views_today}
                          </span>
                        )}
                      </motion.span>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-1 text-green-500" />
                        {property.inquiries || 0} inquiries
                      </motion.span>
                    </div>

                    <div className="flex items-center justify-between">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +0% this month
                      </motion.span>
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === property.id ? null : property.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dropdown-button"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </motion.button>
                        
                        {openDropdownId === property.id && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 min-w-[180px] z-[9999] dropdown-container">

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/view-property/${property.id}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/edit-property/${property.id}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/share-property/${property.id}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-600" />
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to mark this property as sold? This will update the revenue tracking.')) {
                                  try {
                                    console.log('🔍 MyProperties: Marking property as sold:', property);
                                    console.log('🔍 MyProperties: Property user_id:', property.user_id);
                                    console.log('🔍 MyProperties: Current user uid:', user?.uid);
                                    
                                    const { updateProperty } = await import('../../services/supabaseService');
                                    const result = await updateProperty(property.id, { status: 'sold' });
                                    
                                    if (result.success) {
                                      // Add revenue entry for the sold property
                                      const { addRevenue } = await import('../../services/supabaseService');
                                      await addRevenue(user.uid, {
                                        property_id: property.id,
                                        amount: property.price,
                                        type: 'commission',
                                        description: `Property sold: ${property.title}`
                                      });
                                      
                                      alert('Property marked as sold successfully! Revenue has been updated.');
                                      // Refresh the properties list
                                      loadProperties();
                                      // Trigger a global refresh to update dashboard stats
                                      console.log('🎯 MyProperties: Dispatching propertySold event for property:', property.id, 'amount:', property.price);
                                      window.dispatchEvent(new CustomEvent('propertySold', { 
                                        detail: { propertyId: property.id, amount: property.price } 
                                      }));
                                    } else {
                                      alert('Failed to mark property as sold. Please try again.');
                                    }
                                  } catch (error) {
                                    console.error('Error marking property as sold:', error);
                                    alert('Failed to mark property as sold. Please try again.');
                                  }
                                }
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Mark as Sold</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to mark this property as unsold?')) {
                                  // Update property status to active
                                  console.log('Marking property as unsold:', property.id);
                                }
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center space-x-2"
                            >
                              <Clock className="h-4 w-4" />
                              <span>Mark as Unsold</span>
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-600" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                                  handleDeleteProperty(property.id, property.type);
                                }
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
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
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Inquiries
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
                                   villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=64&h=64&fit=crop&crop=center',
                                   apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=64&h=64&fit=crop&crop=center',
                                   commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=64&h=64&fit=crop&crop=center',
                                   land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=64&h=64&fit=crop&crop=center'
                                 };
                                 
                                 console.log('⚠️ Using fallback image for property (list view):', property.title, 'Type:', property.type);
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
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Eye className="h-4 w-4 mr-1" />
                            {property.views}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {property.inquiries}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/dashboard/view-property/${property.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="View Property"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/dashboard/edit-property/${property.id}`)}
                              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Edit Property"
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/dashboard/share-property/${property.id}`)}
                              className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title="Share Property"
                            >
                              <Share2 className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                                  handleDeleteProperty(property.id, property.type);
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete Property"
                            >
                              <Trash2 className="h-4 w-4" />
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
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Home className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first property listing'
            }
          </p>
          <Link
            to="/dashboard/add-property"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Property</span>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyProperties;
