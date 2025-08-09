import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import { 
  getSearchFiltersData,
  getUniqueCities,
  getAvailableAmenities,
  getPropertyTypesWithCounts,
  getPriceRanges
} from '../services/supabaseService';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown, 
  Home,
  Building,
  Building2,
  Briefcase,
  Info,
  Phone,
  Sparkles,
  Globe,
  MapPin,
  IndianRupee,
  Bed,
  Bath,
  Square,
  Calendar,
  Filter,
  Star,
  TrendingUp,
  Shield,
  Car,
  Wifi,
  Dumbbell,
  Waves,
  TreePine,
  Sun,
  Zap,
  Camera,
  Lock
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [filterData, setFilterData] = useState({
    cities: [],
    localities: [],
    propertyTypes: [],
    furnishingTypes: [],
    facingOptions: [],
    amenities: [],
    priceRanges: { sale: {}, rent: {} },
    totalProperties: 0,
    saleCount: 0,
    rentCount: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef(null);

  // Load dynamic filter data from backend
  useEffect(() => {
    const loadFilterData = async () => {
      setLoading(true);
      try {
        const result = await getSearchFiltersData();
        if (result.success) {
          setFilterData(result.data);
        } else {
          console.error('Failed to load filter data:', result.error);
        }
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setScrolled(currentScrollY > 20);
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setActiveDropdown(null);
        setIsOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Generate dynamic navigation structure with backend data
  const generateNavItems = () => {
    if (loading || !filterData.cities.length) {
      return []; // Return empty array while loading
    }

    // Helper function to get property type icon
    const getPropertyTypeIcon = (type) => {
      const iconMap = {
        'apartment': Building,
        'house': Home,
        'villa': Home,
        'plot': Square,
        'land': Square,
        'commercial': Briefcase,
        'office': Building,
        'shop': Building2,
        'warehouse': Building,
        'pg': Bed
      };
      return iconMap[type] || Building;
    };

    // Helper function to format property types with dynamic data
    const formatPropertyTypes = (listingType) => {
      return filterData.propertyTypes.map(type => ({
        name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
        value: type,
        icon: getPropertyTypeIcon(type),
        description: `${listingType === 'sale' ? 'Buy' : 'Rent'} ${type}s in your area`
      }));
    };

    // Helper function to generate dynamic price ranges
    const generatePriceRanges = (listingType) => {
      const priceData = filterData.priceRanges[listingType];
      if (!priceData || !priceData.max) return [];

      const max = priceData.max;
      const min = priceData.min;

      if (listingType === 'sale') {
        const ranges = [];
        if (max > 5000000) ranges.push({ name: 'Under ₹50L', value: '0-5000000' });
        if (max > 10000000) ranges.push({ name: '₹50L - ₹1Cr', value: '5000000-10000000' });
        if (max > 20000000) ranges.push({ name: '₹1Cr - ₹2Cr', value: '10000000-20000000' });
        if (max > 50000000) ranges.push({ name: '₹2Cr - ₹5Cr', value: '20000000-50000000' });
        if (max > 50000000) ranges.push({ name: 'Above ₹5Cr', value: '50000000+' });
        return ranges;
      } else {
        const ranges = [];
        if (max > 25000) ranges.push({ name: 'Under ₹25K', value: '0-25000' });
        if (max > 50000) ranges.push({ name: '₹25K - ₹50K', value: '25000-50000' });
        if (max > 100000) ranges.push({ name: '₹50K - ₹1L', value: '50000-100000' });
        if (max > 200000) ranges.push({ name: '₹1L - ₹2L', value: '100000-200000' });
        if (max > 200000) ranges.push({ name: 'Above ₹2L', value: '200000+' });
        return ranges;
      }
    };

    // Helper function to generate BHK options based on available data
    const generateBHKOptions = () => {
      const bhkOptions = [
        { name: '1 BHK', value: '1' },
        { name: '2 BHK', value: '2' },
        { name: '3 BHK', value: '3' },
        { name: '4+ BHK', value: '4+' }
      ];
      return bhkOptions;
    };

    // Helper function to format amenities with icons
    const formatAmenities = () => {
      const amenityIcons = {
        'swimming_pool': Waves,
        'gym': Dumbbell,
        'parking': Car,
        'security': Shield,
        '24x7_security': Shield,
        'garden': TreePine,
        'club_house': Star,
        'power_backup': Zap,
        'lift': Building,
        'air_conditioning': Sun,
        'wifi': Wifi,
        'cctv': Camera,
        'gated_community': Lock
      };

      return filterData.amenities.slice(0, 12).map(amenity => ({
        name: amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: amenity,
        icon: amenityIcons[amenity.toLowerCase()] || Star
      }));
    };

    return [
      {
        name: 'Buy',
        icon: Building,
        hasDropdown: true,
        dropdownId: 'buy',
        count: filterData.saleCount,
        filters: {
          propertyTypes: formatPropertyTypes('sale'),
          priceRanges: generatePriceRanges('sale'),
          bhkOptions: generateBHKOptions(),
          popularCities: filterData.cities.slice(0, 6),
          amenities: formatAmenities(),
          quickFilters: [
            { name: 'Ready to Move', param: 'availability', value: 'immediate' },
            { name: 'Under Construction', param: 'availability', value: 'construction' },
            { name: 'New Properties', param: 'ageOfProperty', value: '0-1' },
            { name: 'Luxury Properties', param: 'priceRange', value: '20000000+' }
          ]
        }
      },
      {
        name: 'Rent',
        icon: Building2,
        hasDropdown: true,
        dropdownId: 'rent',
        count: filterData.rentCount,
        filters: {
          propertyTypes: formatPropertyTypes('rent'),
          priceRanges: generatePriceRanges('rent'),
          bhkOptions: generateBHKOptions(),
          popularCities: filterData.cities.slice(0, 6),
          furnishingTypes: filterData.furnishingTypes.map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: type
          })),
          amenities: formatAmenities(),
          quickFilters: [
            { name: 'Immediate Move-in', param: 'availability', value: 'immediate' },
            { name: 'Furnished', param: 'furnishing', value: 'furnished' },
            { name: 'Pet Friendly', param: 'petFriendly', value: 'true' },
            { name: 'Family Preferred', param: 'tenantType', value: 'family' }
          ]
        }
      },
      {
        name: 'New Projects',
        icon: TrendingUp,
        hasDropdown: true,
        dropdownId: 'projects',
        filters: {
          propertyTypes: formatPropertyTypes('sale').filter(type => 
            ['apartment', 'villa', 'commercial'].includes(type.value)
          ),
          priceRanges: generatePriceRanges('sale'),
          popularCities: filterData.cities.slice(0, 6),
          amenities: formatAmenities(),
          quickFilters: [
            { name: 'Under Construction', param: 'availability', value: 'construction' },
            { name: 'New Launch', param: 'ageOfProperty', value: '0-1' },
            { name: 'Premium Projects', param: 'premium', value: 'true' },
            { name: 'Ready to Move', param: 'availability', value: 'immediate' }
          ]
        }
      },
      {
        name: 'Commercial',
        icon: Briefcase,
        hasDropdown: true,
        dropdownId: 'commercial',
        filters: {
          propertyTypes: formatPropertyTypes('sale').filter(type => 
            ['commercial', 'office', 'shop', 'warehouse'].includes(type.value)
          ),
          areaRanges: [
            { name: 'Under 500 sq ft', value: '0-500' },
            { name: '500-1000 sq ft', value: '500-1000' },
            { name: '1000-2000 sq ft', value: '1000-2000' },
            { name: '2000+ sq ft', value: '2000+' }
          ],
          popularCities: filterData.cities.slice(0, 6),
          amenities: formatAmenities().filter(amenity => 
            ['parking', 'security', 'power_backup', 'lift', 'air_conditioning'].includes(amenity.value)
          ),
          quickFilters: [
            { name: 'Furnished Office', param: 'furnishing', value: 'furnished' },
            { name: 'Ground Floor', param: 'floor', value: '0' },
            { name: 'Main Road Facing', param: 'facing', value: 'main_road' },
            { name: 'Corner Property', param: 'corner', value: 'true' }
          ]
        }
      }
    ];
  };

  const navItems = generateNavItems();

  // Handle dropdown interactions
  const handleDropdownEnter = (dropdownId) => {
    setActiveDropdown(dropdownId);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  // Generate property URL with filters
  const generatePropertyUrl = (baseFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(baseFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/properties?${params.toString()}`;
  };

  return (
    <motion.nav
      ref={navbarRef}
      initial={{ y: -100 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut"
      }}
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-xl shadow-black/10 dark:shadow-black/20 border border-gray-200/50 dark:border-gray-700/50'
          : 'backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 shadow-lg shadow-black/5 dark:shadow-black/10 border border-gray-200/30 dark:border-gray-700/30'
      } rounded-2xl`}
    >
      <div className="w-full px-6 relative">
        <div className="flex justify-between items-center h-16">

          {/* Clean Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                EasyProp
              </span>
            </Link>
          </motion.div>

          {/* Enhanced Desktop Navigation with Comprehensive Dropdowns */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="relative group"
                onMouseEnter={() => item.hasDropdown && handleDropdownEnter(item.dropdownId)}
                onMouseLeave={handleDropdownLeave}
              >
                {item.hasDropdown ? (
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <item.icon className="h-4 w-4" />
                    </motion.div>
                    <span>{item.name}</span>
                    <motion.div
                      animate={{ rotate: activeDropdown === item.dropdownId ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </motion.button>
                ) : (
                  <Link
                    to={item.path}
                    className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium ${
                      location.pathname === item.path
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <item.icon className="h-4 w-4" />
                    </motion.div>
                    <span>{item.name}</span>
                  </Link>
                )}

                {/* Comprehensive Filter Dropdown */}
                <AnimatePresence>
                  {activeDropdown === item.dropdownId && item.hasDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-[800px] backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-4 gap-6">
                          
                          {/* Property Types Column */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Building className="h-4 w-4 mr-2" />
                              Property Types
                            </h4>
                            <div className="space-y-2">
                              {item.filters.propertyTypes?.map((type, idx) => (
                                <motion.div
                                  key={type.value}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <Link
                                    to={generatePropertyUrl({ 
                                      listingType: item.name.toLowerCase() === 'buy' ? 'sale' : item.name.toLowerCase(),
                                      propertyType: type.value 
                                    })}
                                    className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                                  >
                                    <type.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        {type.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {type.description}
                                      </div>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Price Ranges Column */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <IndianRupee className="h-4 w-4 mr-2" />
                              Price Range
                            </h4>
                            <div className="space-y-2">
                              {item.filters.priceRanges?.map((range, idx) => (
                                <motion.div
                                  key={range.value}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <Link
                                    to={generatePropertyUrl({ 
                                      listingType: item.name.toLowerCase() === 'buy' ? 'sale' : item.name.toLowerCase(),
                                      priceRange: range.value 
                                    })}
                                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 font-medium"
                                  >
                                    {range.name}
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* BHK/Area Options Column */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Bed className="h-4 w-4 mr-2" />
                              {item.filters.bhkOptions ? 'Bedrooms' : item.filters.areaRanges ? 'Area' : 'Options'}
                            </h4>
                            <div className="space-y-2">
                              {(item.filters.bhkOptions || item.filters.areaRanges || []).map((option, idx) => (
                                <motion.div
                                  key={option.value}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <Link
                                    to={generatePropertyUrl({ 
                                      listingType: item.name.toLowerCase() === 'buy' ? 'sale' : item.name.toLowerCase(),
                                      [item.filters.bhkOptions ? 'bhk' : 'areaRange']: option.value 
                                    })}
                                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 font-medium"
                                  >
                                    {option.name}
                                  </Link>
                                </motion.div>
                              ))}
                            </div>

                            {/* Additional Options for Rent */}
                            {item.filters.furnishingTypes && (
                              <div className="mt-4">
                                <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Furnishing</h5>
                                <div className="space-y-1">
                                  {item.filters.furnishingTypes.map((furnishing, idx) => (
                                    <Link
                                      key={furnishing.value}
                                      to={generatePropertyUrl({ 
                                        listingType: 'rent',
                                        furnishing: furnishing.value 
                                      })}
                                      className="block px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                                    >
                                      {furnishing.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Popular Cities & Quick Filters Column */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              Popular Cities
                            </h4>
                            <div className="space-y-2 mb-4">
                              {item.filters.popularCities?.slice(0, 4).map((city, idx) => (
                                <motion.div
                                  key={city}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <Link
                                    to={generatePropertyUrl({ 
                                      listingType: item.name.toLowerCase() === 'buy' ? 'sale' : item.name.toLowerCase(),
                                      city: city 
                                    })}
                                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 font-medium"
                                  >
                                    {city}
                                  </Link>
                                </motion.div>
                              ))}
                            </div>

                            {/* Quick Filters */}
                            <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Quick Filters</h5>
                            <div className="space-y-1">
                              {item.filters.quickFilters?.map((filter, idx) => (
                                <Link
                                  key={filter.name}
                                  to={generatePropertyUrl({ 
                                    listingType: item.name.toLowerCase() === 'buy' ? 'sale' : item.name.toLowerCase(),
                                    [filter.param]: filter.value 
                                  })}
                                  className="block px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                                >
                                  {filter.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Amenities Section (for applicable dropdowns) */}
                        {item.filters.amenities && (
                          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Star className="h-4 w-4 mr-2" />
                              Popular Amenities
                            </h4>
                            <div className="grid grid-cols-6 gap-3">
                              {item.filters.amenities.map((amenity, idx) => (
                                <motion.div
                                  key={amenity.value}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.05 }}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <Link
                                    to={generatePropertyUrl({ 
                                      listingType: item.name.toLowerCase() === 'buy' ? 'sale' : item.name.toLowerCase(),
                                      amenities: amenity.value 
                                    })}
                                    className="flex flex-col items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 group"
                                  >
                                    <amenity.icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-center">
                                      {amenity.name}
                                    </span>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* View All Properties Link */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            to={generatePropertyUrl({ 
                              listingType: item.name.toLowerCase() === 'buy' ? 'sale' : item.name.toLowerCase()
                            })}
                            className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            View All {item.name} Properties
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Additional Navigation Items */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Link
                to="/about"
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium ${
                  location.pathname === '/about'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Info className="h-4 w-4" />
                </motion.div>
                <span>About</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Link
                to="/contact"
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium ${
                  location.pathname === '/contact'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Phone className="h-4 w-4" />
                </motion.div>
                <span>Contact</span>
              </Link>
            </motion.div>
          </div>

          {/* Clean Right Side */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Currency Selector */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Globe className="h-4 w-4" />
                <span>INR</span>
                <ChevronDown className="h-3 w-3" />
              </motion.button>
            </motion.div>

            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center space-x-3"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Dashboard
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <Link to="/profile" className="flex items-center space-x-2">
                    <ProfilePhotoUpload 
                      currentPhotoUrl={user?.photoURL}
                      size="small"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {user?.name}
                    </span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded transition-colors duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center space-x-3"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                  >
                    Log in
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Attached to navbar, expands downward */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 rounded-b-2xl shadow-lg max-h-[50vh] overflow-y-auto">
          {/* Menu Content */}
          <div className="px-6 py-4">
            {/* Navigation Items */}
            <div className="space-y-1">
              <Link
                to="/properties?listingType=sale"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              >
                <Building className="h-5 w-5" />
                <span>Buy Properties</span>
              </Link>
              
              <Link
                to="/properties?listingType=rent"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              >
                <Building2 className="h-5 w-5" />
                <span>Rent Properties</span>
              </Link>
              
              <Link
                to="/properties?propertyType=commercial"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              >
                <Briefcase className="h-5 w-5" />
                <span>Commercial</span>
              </Link>
              
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              >
                <Info className="h-5 w-5" />
                <span>About</span>
              </Link>
              
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              >
                <Phone className="h-5 w-5" />
                <span>Contact</span>
              </Link>
              
              {/* More menu items */}
              <Link
                to="/properties"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              >
                <Home className="h-5 w-5" />
                <span>All Properties</span>
              </Link>
              
              <Link
                to="/emi-calculator"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
              >
                <Building className="h-5 w-5" />
                <span>EMI Calculator</span>
              </Link>
            </div>
            
            {/* Auth Section */}
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    <Building className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </motion.nav>
  );
};

export default Navbar;