import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProperty } from '../../services/supabaseService';
import {
  ArrowLeft,
  Eye,
  Edit,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Star,
  Home,
  User,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Video,
  Map,
  Navigation,
  Car,
  Wifi,
  Shield,
  Zap,
  Droplets,
  Snowflake,
  Utensils,
  Dumbbell,
  TreePine,
  ParkingCircle,
  Building2,
  Store,
  School,
  Hospital,
  Bus,
  Train,
  Plane
} from 'lucide-react';

const ViewProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [propertyId, user]);

  const loadProperty = async () => {
    if (!user?.uid || !propertyId) return;
    
    setLoading(true);
    try {
      const result = await getUserProperty(user.uid, propertyId);
      if (result.success) {
        setProperty(result.data);
      } else {
        setError(result.error || 'Failed to load property');
      }
    } catch (error) {
      console.error('Error loading property:', error);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
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

  const getPropertyImage = (index = 0) => {
    if (property?.images && property.images.length > index) {
      return property.images[index];
    }
    if (property?.image) {
      return property.image;
    }
    
    // Fallback images based on property type
    const imageMap = {
      villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&crop=center',
      apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&crop=center',
      commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center',
      land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&crop=center'
    };
    
    return imageMap[property?.type] || imageMap.apartment;
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/property/${propertyId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Property link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const amenities = [
    { icon: Wifi, name: 'WiFi', available: true },
    { icon: Car, name: 'Parking', available: true },
    { icon: Shield, name: 'Security', available: true },
    { icon: Zap, name: 'Power Backup', available: false },
    { icon: Droplets, name: 'Water Supply', available: true },
    { icon: Snowflake, name: 'AC', available: true },
    { icon: Utensils, name: 'Kitchen', available: true },
    { icon: Dumbbell, name: 'Gym', available: false },
    { icon: TreePine, name: 'Garden', available: true },
    { icon: Building2, name: 'Lift', available: true }
  ];

  const nearbyPlaces = [
    { icon: Store, name: 'Shopping Mall', distance: '0.5 km' },
    { icon: School, name: 'School', distance: '1.2 km' },
    { icon: Hospital, name: 'Hospital', distance: '2.1 km' },
    { icon: Bus, name: 'Bus Stop', distance: '0.3 km' },
    { icon: Train, name: 'Metro Station', distance: '1.8 km' },
    { icon: Plane, name: 'Airport', distance: '15 km' }
  ];

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

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Property Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || 'The property you are looking for does not exist.'}
        </p>
        <button
          onClick={() => navigate('/dashboard/my-properties')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to My Properties
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/my-properties')}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {property.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Property Details
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/dashboard/edit-property/${propertyId}`)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </motion.button>
        </div>
      </div>

      {/* Property Images */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={getPropertyImage(activeImageIndex)}
            alt={property.title}
            className="w-full h-96 object-cover"
          />
          
          {/* Image Navigation */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeImageIndex
                      ? 'bg-white'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Status Badge */}
          <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </div>
          
          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Heart
              className={`h-5 w-5 transition-colors duration-300 ${
                isFavorite ? "text-red-500 fill-current" : "text-gray-600"
              }`}
            />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {property.title}
                </h2>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{property.address && property.city ? `${property.address}, ${property.city}` : property.address || property.city || 'Location not specified'}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Listed {property.daysAgo || Math.floor(Math.random() * 30) + 1} days ago</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                    <span>{property.rating || (4.0 + Math.random()).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatPrice(property.price)}
                </div>
                {property.pricePerSqft && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{Math.floor(property.price / property.sqft).toLocaleString()}/sqft
                  </div>
                )}
              </div>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Bed className="h-6 w-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{property.beds}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Bath className="h-6 w-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{property.baths}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Square className="h-6 w-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{property.sqft?.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sq Ft</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {property.description || 'This beautiful property offers modern amenities and a prime location. Perfect for families looking for comfort and convenience.'}
              </p>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <amenity.icon className={`h-5 w-5 ${amenity.available ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${amenity.available ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {amenity.name}
                  </span>
                  {amenity.available && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Places */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nearby Places</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {nearbyPlaces.map((place, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <place.icon className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{place.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{place.distance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{property.views || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Inquiries</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{property.inquiries || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                </div>
                <span className="font-semibold text-green-600">+12%</span>
              </div>
            </div>
          </div>

          {/* Contact Agent */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Agent</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src={property.agent?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"}
                  alt="Agent"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{property.agent?.name || 'John Doe'}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Licensed Agent</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>Call Agent</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Map className="h-4 w-4" />
                <span>View on Map</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <Video className="h-4 w-4" />
                <span>Virtual Tour</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Navigation className="h-4 w-4" />
                <span>Get Directions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewProperty; 