import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Grid, 
  List, 
  SlidersHorizontal,
  ArrowUpDown,
  Map,
  Heart,
  Eye,
  Bed,
  Bath,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '../components/PropertyCard';
import EnhancedSearchModal from '../components/EnhancedSearchModal';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Extract search parameters
  const location = searchParams.get('location') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const priceRange = searchParams.get('priceRange') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';

  // Mock search results - in real app, fetch from API based on search params
  const [searchResults, setSearchResults] = useState([
    {
      id: 1,
      title: 'Luxury Sea-View Villa in Bandra',
      price: 25000000,
      location: 'Bandra West, Mumbai',
      beds: 4,
      baths: 3,
      sqft: 2200,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center',
      type: 'villa',
      featured: true,
      isNew: true,
      verified: true,
      views: 1247,
      rating: 4.8,
      daysAgo: 3,
      agent: {
        id: '1',
        name: 'Priya Sharma',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      },
    },
    {
      id: 2,
      title: 'Modern High-Rise Apartment in Powai',
      price: 18000000,
      location: 'Powai, Mumbai',
      beds: 3,
      baths: 2,
      sqft: 1450,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=center',
      type: 'apartment',
      featured: false,
      verified: true,
      views: 892,
      rating: 4.6,
      daysAgo: 7,
      agent: {
        id: '2',
        name: 'Rajesh Kumar',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      },
    },
    {
      id: 3,
      title: 'Premium 2BHK with Garden View',
      price: 12000000,
      location: 'Andheri East, Mumbai',
      beds: 2,
      baths: 2,
      sqft: 1100,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center',
      type: 'apartment',
      featured: false,
      isNew: true,
      views: 634,
      rating: 4.4,
      daysAgo: 12,
      agent: {
        id: '3',
        name: 'Sneha Patel',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      },
    },
    {
      id: 4,
      title: 'Spacious Beach-Front Villa',
      price: 45000000,
      location: 'Juhu, Mumbai',
      beds: 5,
      baths: 4,
      sqft: 3200,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&crop=center',
      type: 'villa',
      featured: true,
      verified: true,
      views: 2156,
      rating: 4.9,
      daysAgo: 1,
      agent: {
        id: '4',
        name: 'Arjun Mehta',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      },
    },
    {
      id: 5,
      title: 'Commercial Office Space in BKC',
      price: 35000000,
      location: 'Bandra Kurla Complex, Mumbai',
      beds: 0,
      baths: 6,
      sqft: 2800,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center',
      type: 'commercial',
      featured: true,
      verified: true,
      views: 1543,
      rating: 4.7,
      daysAgo: 5,
      agent: {
        id: '5',
        name: 'Kavita Singh',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      },
    },
    {
      id: 6,
      title: 'Premium Land Plot in Lonavala',
      price: 8000000,
      location: 'Lonavala, Maharashtra',
      beds: 0,
      baths: 0,
      sqft: 5000,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&crop=center',
      type: 'land',
      featured: false,
      isNew: true,
      views: 423,
      rating: 4.2,
      daysAgo: 15,
      agent: {
        id: '6',
        name: 'Vikram Joshi',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      },
    },
  ]);

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleFavorite = (propertyId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const handleApplyFilters = (filters) => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      }
    });
    setSearchParams(newSearchParams);
    setIsSearchModalOpen(false);
  };

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const getSearchSummary = () => {
    const filters = [];
    if (location) filters.push(`in ${location}`);
    if (propertyType) filters.push(propertyType);
    if (category && type) filters.push(`${category} ${type}`);
    if (bedrooms) filters.push(`${bedrooms} bedrooms`);
    if (priceRange) filters.push(`₹${priceRange}`);
    
    return filters.length > 0 ? filters.join(', ') : 'All Properties';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                ← Back to Home
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <h1 className="text-xl font-bold text-slate-900">Search Results</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Map View Button */}
              <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Map className="h-4 w-4" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Advanced
                </button>
              </div>

              {/* Current Search Summary */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="text-sm font-medium text-slate-900 mb-2">Current Search:</div>
                <div className="text-sm text-slate-600">{getSearchSummary()}</div>
              </div>

              {/* Quick Filters */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Property Type
                  </label>
                  <div className="space-y-2">
                    {['Apartment', 'Villa', 'Commercial', 'Land'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    {['Under ₹50L', '₹50L - ₹1Cr', '₹1Cr - ₹2Cr', 'Above ₹2Cr'].map(range => (
                      <label key={range} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          className="border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-600">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Bedrooms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['1', '2', '3', '4', '5+'].map(bed => (
                      <button
                        key={bed}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {bed}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Features
                  </label>
                  <div className="space-y-2">
                    {['Parking', 'Swimming Pool', 'Gym', 'Garden', 'Security'].map(feature => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-600">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {searchResults.length} Properties Found
                </h2>
                <p className="text-slate-600 mt-1">{getSearchSummary()}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Showing {searchResults.length} of {searchResults.length} results
                </span>
              </div>
            </div>

            {/* Results Grid/List */}
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {searchResults.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PropertyCard
                        property={{
                          ...property,
                          isFavorite: favorites.has(property.id)
                        }}
                        onFavorite={handleFavorite}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {searchResults.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex">
                        <div className="w-80 h-64 flex-shrink-0">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {property.title}
                              </h3>
                              <div className="flex items-center text-slate-600 mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{property.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {formatPrice(property.price)}
                              </div>
                              <button
                                onClick={() => handleFavorite(property.id)}
                                className="mt-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
                              >
                                <Heart className={`h-5 w-5 ${
                                  favorites.has(property.id) 
                                    ? 'text-red-500 fill-current' 
                                    : 'text-slate-400'
                                }`} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-slate-600 mb-4">
                            {property.beds > 0 && (
                              <div className="flex items-center">
                                <Bed className="h-4 w-4 mr-1" />
                                <span className="text-sm">{property.beds} Beds</span>
                              </div>
                            )}
                            {property.baths > 0 && (
                              <div className="flex items-center">
                                <Bath className="h-4 w-4 mr-1" />
                                <span className="text-sm">{property.baths} Baths</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              <span className="text-sm">{property.sqft.toLocaleString()} Sq Ft</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="text-sm">{property.views} views</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src={property.agent.image}
                                alt={property.agent.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="text-sm text-slate-600">{property.agent.name}</span>
                            </div>
                            
                            <div className="flex space-x-3">
                              <Link
                                to={`/virtual-tour/${property.id}`}
                                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors text-sm"
                              >
                                Virtual Tour
                              </Link>
                              <Link
                                to={`/property/${property.id}`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-400 font-semibold py-3 px-8 rounded-xl transition-colors">
                Load More Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Modal */}
      <EnhancedSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default SearchResults;