import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserFavorites, 
  getUserScheduledTours,
  getUserScheduledToursByUserId, 
  updateUserProfile,
  getUserProfile,
  getUserProperties
} from '../services/supabaseService';
import PropertyCard from '../components/PropertyCard';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import { 
  User, 
  Heart, 
  Calendar, 
  Settings, 
  Edit3, 
  Save, 
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { user, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [tours, setTours] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    company: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user profile
      const profileResult = await getUserProfile(user.uid);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
        setEditForm({
          name: profileResult.data.name || user.name || '',
          phone: profileResult.data.phone || '',
          company: profileResult.data.company || '',
          bio: profileResult.data.bio || ''
        });
      }

      // Load favorites
      const favoritesResult = await getUserFavorites(user.uid);
      if (favoritesResult.success) {
        setFavorites(favoritesResult.data);
      }

      // Load tours that the user has scheduled as a visitor
      // Try by user ID first, then fallback to email
      let toursResult = await getUserScheduledToursByUserId(user.uid);
      if (toursResult.success && toursResult.data.length === 0) {
        // Fallback to email-based lookup for tours scheduled before user ID was tracked
        toursResult = await getUserScheduledTours(user.email);
      }
      if (toursResult.success) {
        setTours(toursResult.data);
      }

      // Load user properties if they're an agent/builder
      if (user.userType === 'agent' || user.userType === 'builder') {
        const propertiesResult = await getUserProperties(user.uid);
        if (propertiesResult.success) {
          setUserProperties(propertiesResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateUserProfile(user.uid, {
        name: editForm.name,
        phone: editForm.phone,
        company: editForm.company,
        bio: editForm.bio
      });

      if (result.success) {
        setUserProfile(result.data);
        setIsEditing(false);
        await refreshUserData();
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleFavoriteToggle = async (propertyId) => {
    // This will be handled by the PropertyCard component
    // Refresh favorites after toggle
    setTimeout(() => {
      loadUserData();
    }, 500);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'favorites', label: 'Wishlist', icon: Heart },
    { id: 'tours', label: 'Tours', icon: Calendar },
    ...(user?.userType === 'agent' || user?.userType === 'builder' 
      ? [{ id: 'properties', label: 'My Properties', icon: Building }] 
      : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProfilePhotoUpload 
                currentPhotoUrl={userProfile?.photo_url}
                onPhotoUpdate={(newUrl) => {
                  setUserProfile(prev => ({ ...prev, photo_url: newUrl }));
                }}
                size="xlarge"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userProfile?.name || user?.name || 'User Profile'}
                </h1>
                <p className="text-gray-600 capitalize">
                  {user?.userType || 'User'} • Member since {new Date(userProfile?.created_at || Date.now()).getFullYear()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab 
                    userProfile={userProfile} 
                    user={user}
                    favorites={favorites}
                    tours={tours}
                    userProperties={userProperties}
                  />
                )}
                
                {activeTab === 'favorites' && (
                  <FavoritesTab 
                    favorites={favorites} 
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                )}
                
                {activeTab === 'tours' && (
                  <ToursTab tours={tours} />
                )}
                
                {activeTab === 'properties' && (user?.userType === 'agent' || user?.userType === 'builder') && (
                  <PropertiesTab properties={userProperties} />
                )}
                
                {activeTab === 'settings' && (
                  <SettingsTab 
                    userProfile={userProfile}
                    user={user}
                    onProfileUpdate={loadUserData}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Edit Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ userProfile, user, favorites, tours, userProperties }) => {
  const stats = [
    {
      label: 'Wishlist Properties',
      value: favorites.length,
      icon: Heart,
      color: 'text-red-500 bg-red-50'
    },
    {
      label: 'Scheduled Tours',
      value: tours.length,
      icon: Calendar,
      color: 'text-blue-500 bg-blue-50'
    },
    ...(user?.userType === 'agent' || user?.userType === 'builder' ? [{
      label: 'My Properties',
      value: userProperties.length,
      icon: Building,
      color: 'text-green-500 bg-green-50'
    }] : []),
    {
      label: 'Profile Views',
      value: userProfile?.profile_views || 0,
      icon: Eye,
      color: 'text-purple-500 bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          
          {userProfile?.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{userProfile.phone}</p>
              </div>
            </div>
          )}
          
          {userProfile?.company && (
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium">{userProfile.company}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="font-medium capitalize">{user?.userType || 'User'}</p>
            </div>
          </div>
        </div>
        
        {userProfile?.bio && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Bio</p>
            <p className="text-gray-900">{userProfile.bio}</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {favorites.slice(0, 3).map((favorite, index) => (
            <div key={favorite.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Heart className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{favorite.properties?.title}</p>
                <p className="text-sm text-gray-600">Added to wishlist</p>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(favorite.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          
          {tours.slice(0, 2).map((tour, index) => (
            <div key={tour.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">{tour.properties?.title}</p>
                <p className="text-sm text-gray-600">
                  Tour {tour.status} • {new Date(tour.tour_date).toLocaleDateString()} at {tour.tour_time}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                tour.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                tour.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                tour.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {tour.status}
              </span>
            </div>
          ))}
          
          {favorites.length === 0 && tours.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

// Favorites Tab Component
const FavoritesTab = ({ favorites, onFavoriteToggle }) => {
  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorite Properties</h3>
        <p className="text-gray-600 mb-6">
          Start exploring properties and add them to your wishlist to see them here.
        </p>
        <a
          href="/properties"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Properties
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Your Wishlist ({favorites.length} properties)
        </h3>
        <p className="text-gray-600">
          Properties you've saved for later viewing and comparison.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {favorites.map((favorite, index) => (
          <motion.div
            key={favorite.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PropertyCard
              property={{
                ...favorite.properties,
                isFavorite: true
              }}
              onFavorite={onFavoriteToggle}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Tours Tab Component
const ToursTab = ({ tours }) => {
  const upcomingTours = tours.filter(tour => new Date(tour.tour_date) > new Date());
  const pastTours = tours.filter(tour => new Date(tour.tour_date) <= new Date());

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'cancelled':
        return XCircle;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Tour confirmed by property owner';
      case 'pending':
        return 'Waiting for property owner approval';
      case 'cancelled':
        return 'Tour cancelled';
      case 'completed':
        return 'Tour completed';
      default:
        return 'Status unknown';
    }
  };

  if (tours.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tours Scheduled</h3>
        <p className="text-gray-600 mb-6">
          Schedule property tours to visit and explore properties in person.
        </p>
        <a
          href="/properties"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Properties
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Tours */}
      {upcomingTours.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Upcoming Tours ({upcomingTours.length})
          </h3>
          <div className="space-y-4">
            {upcomingTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {tour.properties?.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {tour.properties?.address}, {tour.properties?.city}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(tour.tour_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {tour.tour_time}
                      </span>
                    </div>
                    {tour.properties?.users && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Property Owner: {tour.properties.users.name}</span>
                        {tour.properties.users.company && (
                          <span className="text-gray-400">• {tour.properties.users.company}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tour.status)}`}>
                      {tour.status?.charAt(0).toUpperCase() + tour.status?.slice(1)}
                    </span>
                    <a
                      href={`/property/${tour.property_id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Property
                    </a>
                  </div>
                </div>
                
                {/* Status Message */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 flex items-center">
                    {React.createElement(getStatusIcon(tour.status), { className: "h-4 w-4 mr-2" })}
                    {getStatusMessage(tour.status)}
                  </p>
                </div>

                {tour.visitor_message && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Your Message:</strong> {tour.visitor_message}
                    </p>
                  </div>
                )}
                
                {/* Contact Information for Confirmed Tours */}
                {tour.status === 'confirmed' && tour.properties?.users && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Contact Details:</p>
                    <div className="space-y-1 text-sm text-green-700">
                      {tour.properties.users.phone && (
                        <p className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" />
                          {tour.properties.users.phone}
                        </p>
                      )}
                      <p className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        {tour.properties.users.email}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past Tours */}
      {pastTours.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-600" />
            Past Tours ({pastTours.length})
          </h3>
          <div className="space-y-4">
            {pastTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {tour.properties?.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {tour.properties?.address}, {tour.properties?.city}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(tour.tour_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {tour.tour_time}
                      </span>
                    </div>
                    {tour.properties?.users && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Property Owner: {tour.properties.users.name}</span>
                        {tour.properties.users.company && (
                          <span className="text-gray-400">• {tour.properties.users.company}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tour.status)}`}>
                      {tour.status?.charAt(0).toUpperCase() + tour.status?.slice(1)}
                    </span>
                    <a
                      href={`/property/${tour.property_id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Property
                    </a>
                  </div>
                </div>
                
                {/* Status Message */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 flex items-center">
                    {React.createElement(getStatusIcon(tour.status), { className: "h-4 w-4 mr-2" })}
                    {getStatusMessage(tour.status)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Properties Tab Component (for agents/builders)
const PropertiesTab = ({ properties }) => {
  const activeProperties = properties.filter(p => p.status === 'active');
  const soldProperties = properties.filter(p => p.status === 'sold');
  const draftProperties = properties.filter(p => p.status === 'draft');

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Listed</h3>
        <p className="text-gray-600 mb-6">
          Start listing your properties to reach potential buyers and renters.
        </p>
        <a
          href="/dashboard/add-property"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Property
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Properties Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-green-600">{activeProperties.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sold Properties</p>
              <p className="text-2xl font-bold text-blue-600">{soldProperties.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft Properties</p>
              <p className="text-2xl font-bold text-gray-600">{draftProperties.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Edit3 className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Properties */}
      {activeProperties.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Active Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard
                  property={property}
                  isOwner={true}
                  showStats={true}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sold Properties */}
      {soldProperties.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sold Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {soldProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="opacity-75"
              >
                <PropertyCard
                  property={property}
                  isOwner={true}
                  showStats={true}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ userProfile, user, onProfileUpdate }) => {
  const [notifications, setNotifications] = useState({
    emailUpdates: userProfile?.preferences?.emailUpdates ?? true,
    tourReminders: userProfile?.preferences?.tourReminders ?? true,
    priceAlerts: userProfile?.preferences?.priceAlerts ?? true,
    newListings: userProfile?.preferences?.newListings ?? false
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: userProfile?.preferences?.profileVisible ?? true,
    showPhone: userProfile?.preferences?.showPhone ?? false,
    showEmail: userProfile?.preferences?.showEmail ?? false
  });

  const handleNotificationChange = async (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // Update in backend
    try {
      await updateUserProfile(user.uid, {
        preferences: {
          ...userProfile?.preferences,
          [key]: value
        }
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const handlePrivacyChange = async (key, value) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    // Update in backend
    try {
      await updateUserProfile(user.uid, {
        preferences: {
          ...userProfile?.preferences,
          [key]: value
        }
      });
      toast.success('Privacy settings updated successfully');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Updates</p>
              <p className="text-sm text-gray-600">Receive updates about your account and properties</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailUpdates}
                onChange={(e) => handleNotificationChange('emailUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tour Reminders</p>
              <p className="text-sm text-gray-600">Get reminded about upcoming property tours</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.tourReminders}
                onChange={(e) => handleNotificationChange('tourReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Price Alerts</p>
              <p className="text-sm text-gray-600">Notify when prices change on your wishlist properties</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.priceAlerts}
                onChange={(e) => handleNotificationChange('priceAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Listings</p>
              <p className="text-sm text-gray-600">Get notified about new properties matching your preferences</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.newListings}
                onChange={(e) => handleNotificationChange('newListings', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profile Visibility</p>
              <p className="text-sm text-gray-600">Make your profile visible to other users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.profileVisible}
                onChange={(e) => handlePrivacyChange('profileVisible', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Phone Number</p>
              <p className="text-sm text-gray-600">Display your phone number on your public profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.showPhone}
                onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Email Address</p>
              <p className="text-sm text-gray-600">Display your email address on your public profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.showEmail}
                onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
        <div className="space-y-4">
          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium">Change Password</p>
            <p className="text-sm text-gray-600">Update your account password</p>
          </button>
          
          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium">Download Data</p>
            <p className="text-sm text-gray-600">Download a copy of your account data</p>
          </button>
          
          <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-red-500">Permanently delete your account and all data</p>
          </button>
        </div>
      </div>
    </div>
  );
};