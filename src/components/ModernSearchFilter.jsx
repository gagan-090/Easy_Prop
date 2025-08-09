import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ChevronDown,
  Search,
  X,
  MapPin,
  Building,
  IndianRupee,
  Home,
  Filter,
  Sun,
  Moon,
  Map,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { 
  getSearchFiltersData,
  searchPropertiesWithSuggestions,
  getUniqueCities,
  getUniqueLocalities 
} from "../services/supabaseService";

const ModernSearchFilter = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  darkMode = false,
  onDarkModeToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // Dynamic filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    localities: [],
    propertyTypes: [],
    furnishingTypes: [],
    facingOptions: [],
    amenities: [],
    priceRanges: { sale: {}, rent: {} }
  });
  
  const [filters, setFilters] = useState(() => ({
    listingType: "sale",
    propertyType: "",
    priceRange: { min: "", max: "" },
    bedrooms: "",
    bathrooms: "",
    city: "",
    locality: "",
    amenities: [],
    possessionStatus: "",
    furnishing: "",
    areaRange: { min: 500, max: 5000 },
    propertyAge: "",
    facing: "",
    gatedSociety: false,
    ...initialFilters,
  }));
  
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);


  // Load filter options from backend
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true);
      try {
        const result = await getSearchFiltersData();
        if (result.success) {
          setFilterOptions(result.data);
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Dynamic property types from backend
  const propertyTypes = useMemo(() => {
    return filterOptions.propertyTypes.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      icon: type === 'apartment' ? '🏢' : 
            type === 'house' ? '🏠' : 
            type === 'villa' ? '🏡' : 
            type === 'office' ? '🏢' : 
            type === 'shop' ? '🏪' : 
            type === 'land' ? '🌍' : '🏠'
    }));
  }, [filterOptions.propertyTypes]);

  const bedroomOptions = useMemo(() => [
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
    { value: "4", label: "4 BHK" },
    { value: "4+", label: "4+ BHK" },
  ], []);

  const listingTypes = useMemo(() => [
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
  ], []);

  const possessionOptions = useMemo(() => [
    { value: "ready", label: "Ready to Move" },
    { value: "construction", label: "Under Construction" },
  ], []);

  const furnishingOptions = useMemo(() => [
    { value: "unfurnished", label: "Unfurnished" },
    { value: "semi-furnished", label: "Semi-Furnished" },
    { value: "furnished", label: "Fully Furnished" },
  ], []);

  const propertyAgeOptions = useMemo(() => [
    { value: "0-1", label: "0-1 Years" },
    { value: "1-5", label: "1-5 Years" },
    { value: "5-10", label: "5-10 Years" },
    { value: "10+", label: "10+ Years" },
  ], []);

  // Dynamic popular locations from backend
  const popularLocations = useMemo(() => {
    return filterOptions.cities.slice(0, 8);
  }, [filterOptions.cities]);

  const quickSearchOptions = useMemo(() => {
    const topCity = filterOptions.cities[0] || "Mumbai";
    const topPropertyType = filterOptions.propertyTypes[0] || "apartment";
    
    return [
      {
        label: `${topCity}`,
        type: "city",
        value: topCity,
        icon: MapPin,
        color: "text-red-600",
        bgColor: "bg-red-50 hover:bg-red-100",
      },
      {
        label: "Apartments",
        type: "propertyType",
        value: "apartment",
        icon: Building,
        color: "text-blue-600",
        bgColor: "bg-blue-50 hover:bg-blue-100",
      },
      {
        label: "For Sale",
        type: "listingType",
        value: "sale",
        icon: IndianRupee,
        color: "text-green-600",
        bgColor: "bg-green-50 hover:bg-green-100",
      },
      {
        label: "3 BHK",
        type: "bedrooms",
        value: "3",
        icon: Home,
        color: "text-purple-600",
        bgColor: "bg-purple-50 hover:bg-purple-100",
      },
    ];
  }, [filterOptions.cities, filterOptions.propertyTypes]);

  const popularTypes = useMemo(() => {
    return filterOptions.propertyTypes.slice(0, 5).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    );
  }, [filterOptions.propertyTypes]);

  // Optimized callback functions
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setShowLocationSuggestions(false);
  }, []);

  const handleToggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
        setShowLocationSuggestions(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
        setShowLocationSuggestions(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen, handleClose]);

  // Optimized filter change handler
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  // Search with debouncing for suggestions
  const debouncedSearch = useCallback((query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(async () => {
      if (query && query.length >= 2) {
        try {
          const result = await searchPropertiesWithSuggestions(query, 5);
          if (result.success) {
            setSearchSuggestions(result.data);
            setShowSearchSuggestions(true);
          }
        } catch (error) {
          console.error("Error getting search suggestions:", error);
        }
      } else {
        setSearchSuggestions([]);
        setShowSearchSuggestions(false);
      }
    }, 300);
  }, []);

  // Optimized location input handler
  const handleLocationInput = useCallback(async (value) => {
    handleFilterChange("city", value);
    if (value.length > 1) {
      const filtered = filterOptions.cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  }, [handleFilterChange, filterOptions.cities]);

  // Optimized geolocation handler
  const getCurrentLocation = useCallback(() => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // For now, just set to a nearby city - in production you'd reverse geocode
          const nearbyCity = filterOptions.cities[0] || "Mumbai";
          handleFilterChange("city", nearbyCity);
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUseCurrentLocation(false);
          alert("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      setUseCurrentLocation(false);
      alert("Geolocation is not supported by this browser.");
    }
  }, [handleFilterChange, filterOptions.cities]);

  // Optimized price change handler
  const handlePriceChange = useCallback((type, value) => {
    setFilters(prev => {
      const newPriceRange = { ...prev.priceRange, [type]: value };
      const newFilters = { ...prev, priceRange: newPriceRange };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);



  // Optimized amenity toggle handler
  const handleAmenityToggle = useCallback((amenity) => {
    setFilters(prev => {
      const newAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      const newFilters = { ...prev, amenities: newAmenities };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  // Optimized search handler - redirect to properties page
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    
    // Build URL parameters for properties page
    const params = new URLSearchParams();
    
    if (searchQuery) params.set("search", searchQuery);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && !(Array.isArray(value) && value.length === 0)) {
        if (typeof value === "object" && !Array.isArray(value)) {
          // Handle price range object
          if (value.min || value.max) {
            const rangeStr = `${value.min || 0}-${value.max || ''}`;
            params.set(key, rangeStr);
          }
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      }
    });
    
    // Redirect to properties page instead of search page
    window.location.href = `/properties?${params.toString()}`;
    setIsOpen(false);
  }, [searchQuery, filters]);

  // Optimized quick search handler
  const handleQuickSearch = useCallback((option) => {
    setFilters(prev => {
      let newFilters = { ...prev };
      
      switch (option.type) {
        case "city":
          newFilters.city = option.value;
          break;
        case "propertyType":
          newFilters.propertyType = option.value;
          break;
        case "listingType":
          newFilters.listingType = option.value;
          break;
        case "bedrooms":
          newFilters.bedrooms = option.value;
          break;
      }

      // Build URL and redirect
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "" && !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            params.set(key, value.join(","));
          } else {
            params.set(key, value);
          }
        }
      });
      
      window.location.href = `/properties?${params.toString()}`;
      return newFilters;
    });
  }, []);

  // Handle location click from popular locations
  const handleLocationClick = useCallback((location) => {
    const params = new URLSearchParams();
    params.set("city", location);
    window.location.href = `/properties?${params.toString()}`;
  }, []);

  // Handle property type click from popular types
  const handlePropertyTypeClick = useCallback((type) => {
    const typeValue = type.toLowerCase();
    const params = new URLSearchParams();
    params.set("propertyType", typeValue);
    window.location.href = `/properties?${params.toString()}`;
  }, []);

  // Optimized clear filters function
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      listingType: "sale",
      propertyType: "",
      priceRange: { min: "", max: "" },
      bedrooms: "",
      bathrooms: "",
      city: "",
      locality: "",
      amenities: [],
      possessionStatus: "",
      furnishing: "",
      areaRange: { min: 500, max: 5000 },
      propertyAge: "",
      facing: "",
      gatedSociety: false,
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    setShowLocationSuggestions(false);
    setShowSearchSuggestions(false);
    onFilterChange?.(clearedFilters);
  }, [onFilterChange]);

  // Memoized active filters count for performance
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "areaRange") {
        return value.min !== 500 || value.max !== 5000;
      }
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null) {
        return Object.values(value).some((v) => v !== "");
      }
      if (typeof value === "boolean") return value === true;
      return value !== "";
    }).length;
  }, [filters]);

  // Memoized theme classes for performance
  const themeClasses = useMemo(() => ({
    container: darkMode 
      ? "bg-gray-900/95 border-gray-700 text-white" 
      : "bg-white/95 border-gray-200 text-gray-900",
    input: darkMode
      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500",
    button: darkMode
      ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
      : "bg-white hover:bg-gray-50 text-gray-900 border-gray-200",
    dropdown: darkMode
      ? "bg-gray-900/98 border-gray-700"
      : "bg-white/98 border-gray-200",
  }), [darkMode]);

  return (
    <div className="search-filter-container relative w-full max-w-7xl mx-auto" ref={dropdownRef}>
      {/* Quick Search Options - Mobile Optimized */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
          {quickSearchOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuickSearch(option)}
                className={`group ${option.bgColor} backdrop-blur-sm border border-transparent hover:border-current rounded-xl md:rounded-2xl px-3 md:px-6 py-2 md:py-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 md:space-x-3 transform hover:scale-105`}
                aria-label={`Quick search for ${option.label}`}
              >
                <IconComponent className={`h-4 md:h-5 w-4 md:w-5 ${option.color}`} />
                <span className={`${option.color} font-semibold text-xs md:text-sm`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Popular Searches - Mobile Optimized */}
        <div className="text-center">
          <div className="flex flex-col md:inline-flex md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Popular:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularLocations.slice(0, 4).map((location) => (
                <button
                  key={location}
                  onClick={() => handleFilterChange("location", location)}
                  className="text-blue-500 hover:text-blue-700 hover:underline transition-colors font-medium text-xs md:text-sm"
                >
                  {location}
                </button>
              ))}
              <span className={`hidden md:inline ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
              {popularTypes.slice(0, 3).map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange("propertyType", type.toLowerCase())}
                  className="text-blue-500 hover:text-blue-700 hover:underline transition-colors font-medium text-xs md:text-sm"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar - Mobile Optimized */}
      <form onSubmit={handleSearch} className="relative">
        <div className={`flex flex-col md:flex-row items-stretch ${themeClasses.container} backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl border overflow-hidden transition-all duration-300`}>
          
          {/* Main Search Input with integrated controls */}
          <div className="flex-1 flex items-center px-4 md:px-6 py-3 md:py-5 relative">
            <Search className={`h-5 md:h-6 w-5 md:w-6 mr-3 md:mr-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search properties, locations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className={`flex-1 border-none outline-none text-base md:text-lg font-medium bg-transparent ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
              aria-label="Search properties"
            />
            {loading && (
              <Loader2 className="h-4 md:h-5 w-4 md:w-5 text-gray-400 animate-spin mr-2" />
            )}
            
            {/* Mobile: Filter and Search icons inside search bar */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Filter Button */}
              <button
                type="button"
                onClick={handleToggleDropdown}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors relative`}
                aria-label="Toggle filters"
              >
                <Filter className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              {/* Search Button */}
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Desktop Controls Row */}
          <div className="hidden md:flex items-stretch border-l border-gray-200 dark:border-gray-700">
            {/* Dark Mode Toggle */}
            {onDarkModeToggle && (
              <button
                type="button"
                onClick={onDarkModeToggle}
                className={`flex items-center px-4 py-5 border-r ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={handleToggleDropdown}
              className={`flex items-center px-6 py-5 border-r border-gray-200 dark:border-gray-700 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-all duration-200`}
              aria-label="Toggle filters"
              aria-expanded={isOpen}
            >
              <Filter className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Filters
              </span>
              {activeFiltersCount > 0 && (
                <span className="ml-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 ml-3 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                } ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              />
            </button>

            {/* Enhanced Search Button */}
            <button
              type="submit"
              className="px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
            >
              <Search className="h-5 w-5 mr-2" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Simple Login/Signup Options - Mobile Only */}
      <div className="md:hidden mt-4 flex items-center justify-center space-x-4">
        <a
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          Login
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          Sign Up
        </a>
      </div>

      {/* Advanced Filters Dropdown - Mobile Optimized */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998]" onClick={handleClose} />
          <div className={`absolute top-full left-0 right-0 mt-2 md:mt-4 ${themeClasses.dropdown} backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl border z-[999] max-h-[70vh] md:max-h-[80vh] overflow-y-auto`}>
            <div className="p-4 md:p-8">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 id="filter-dialog-title" className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Filters
                </h3>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <button
                    onClick={clearFilters}
                    className="text-xs md:text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={handleClose} 
                    className={`p-1 md:p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'} transition-colors`}
                  >
                    <X className="h-4 md:h-5 w-4 md:w-5" />
                  </button>
                </div>
              </div>
              
              {/* Mobile-First Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-4 md:mb-6">
                
                {/* Listing Type */}
                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 md:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <IndianRupee className="inline h-3 md:h-4 w-3 md:w-4 mr-1" />
                    Listing Type
                  </label>
                  <select
                    value={filters.listingType}
                    onChange={(e) => handleFilterChange("listingType", e.target.value)}
                    className={`w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base ${themeClasses.input}`}
                  >
                    {listingTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 md:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Building className="inline h-3 md:h-4 w-3 md:w-4 mr-1" />
                    Property Type
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                    className={`w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base ${themeClasses.input}`}
                  >
                    <option value="">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="relative">
                  <label className={`block text-xs md:text-sm font-medium mb-1 md:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <MapPin className="inline h-3 md:h-4 w-3 md:w-4 mr-1" />
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) => handleLocationInput(e.target.value)}
                    className={`w-full px-2 md:px-3 py-2 pr-8 md:pr-10 border rounded-lg text-sm md:text-base ${themeClasses.input}`}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={useCurrentLocation}
                    className="absolute right-2 top-6 md:top-8 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                  >
                    {useCurrentLocation ? (
                      <div className="animate-spin h-3 md:h-4 w-3 md:w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <Map className="h-3 md:h-4 w-3 md:w-4" />
                    )}
                  </button>
                  
                  {/* Location Suggestions */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 ${themeClasses.dropdown} rounded-lg shadow-lg border z-10 max-h-32 overflow-y-auto`}>
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleFilterChange("city", suggestion);
                            setShowLocationSuggestions(false);
                          }}
                          className={`w-full text-left px-2 md:px-3 py-2 hover:bg-blue-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition-colors text-xs md:text-sm`}
                        >
                          <MapPin className="inline h-3 w-3 mr-2 text-gray-400" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bedrooms */}
                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 md:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Home className="inline h-3 md:h-4 w-3 md:w-4 mr-1" />
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                    className={`w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base ${themeClasses.input}`}
                  >
                    <option value="">Any</option>
                    {bedroomOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 md:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <IndianRupee className="inline h-3 md:h-4 w-3 md:w-4 mr-1" />
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min Price (₹)"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className={`w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base ${themeClasses.input}`}
                    />
                    <input
                      type="number"
                      placeholder="Max Price (₹)"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className={`w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base ${themeClasses.input}`}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Filters - Mobile Optimized */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
                
                {/* Locality */}
                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 md:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Locality
                  </label>
                  <select
                    value={filters.locality}
                    onChange={(e) => handleFilterChange("locality", e.target.value)}
                    className={`w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base ${themeClasses.input}`}
                  >
                    <option value="">Any Locality</option>
                    {filterOptions.localities.map((locality) => (
                      <option key={locality} value={locality}>
                        {locality}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Furnishing */}
                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 md:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Furnishing
                  </label>
                  <select
                    value={filters.furnishing}
                    onChange={(e) => handleFilterChange("furnishing", e.target.value)}
                    className={`w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base ${themeClasses.input}`}
                  >
                    <option value="">Any Furnishing</option>
                    {furnishingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Age */}
                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 md:mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Property Age
                  </label>
                  <select
                    value={filters.propertyAge}
                    onChange={(e) => handleFilterChange("propertyAge", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${themeClasses.input}`}
                  >
                    <option value="">Any Age</option>
                    {propertyAgeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Facing */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Facing
                  </label>
                  <select
                    value={filters.facing}
                    onChange={(e) => handleFilterChange("facing", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${themeClasses.input}`}
                  >
                    <option value="">Any Facing</option>
                    {filterOptions.facingOptions.map((facing) => (
                      <option key={facing} value={facing}>
                        {facing.charAt(0).toUpperCase() + facing.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amenities */}
              {filterOptions.amenities.length > 0 && (
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filterOptions.amenities.slice(0, 12).map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {amenity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`px-6 py-2 border rounded-lg font-medium transition-colors ${themeClasses.button}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleSearch(e);
                    handleClose();
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModernSearchFilter;
