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
} from "lucide-react";

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
  const [filters, setFilters] = useState(() => ({
    propertyType: "",
    priceRange: { min: "", max: "" },
    bedrooms: "",
    bathrooms: "",
    location: "",
    amenities: [],
    possessionStatus: "",
    furnishing: "",
    areaRange: { min: 500, max: 5000 },
    builderName: "",
    propertyAge: "",
    facing: "",
    floorNumber: "",
    gatedSociety: false,
    smartTags: [],
    ...initialFilters,
  }));
  const dropdownRef = useRef(null);


  // Memoized static data for better performance
  const propertyTypes = useMemo(() => [
    { value: "apartment", label: "Apartment", icon: "🏢" },
    { value: "house", label: "House", icon: "🏠" },
    { value: "villa", label: "Villa", icon: "🏡" },
    { value: "condo", label: "Condo", icon: "�️" },
    { value: "townhouse", label: "Townhouse", icon: "🏘️" },
    { value: "studio", label: "Studio", icon: "�}" },
    { value: "penthouse", label: "Penthouse", icon: "🏢" },
    { value: "plot", label: "Plot/Land", icon: "🌍" },
  ], []);

  const bedroomOptions = useMemo(() => [
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
    { value: "4", label: "4 BHK" },
    { value: "5+", label: "5+ BHK" },
  ], []);



  const possessionOptions = useMemo(() => [
    { value: "ready", label: "Ready to Move" },
    { value: "construction", label: "Under Construction" },
  ], []);

  const furnishingOptions = useMemo(() => [
    { value: "unfurnished", label: "Unfurnished" },
    { value: "semi-furnished", label: "Semi-Furnished" },
    { value: "fully-furnished", label: "Fully Furnished" },
  ], []);

  const propertyAgeOptions = useMemo(() => [
    { value: "0-1", label: "0-1 Years" },
    { value: "1-5", label: "1-5 Years" },
    { value: "5-10", label: "5-10 Years" },
    { value: "10+", label: "10+ Years" },
  ], []);



  const amenitiesList = useMemo(() => [
    { category: "Basic", items: ["Lift", "Parking", "Security", "Power Backup"] },
    { category: "Recreation", items: ["Gym", "Swimming Pool", "Garden", "Club House"] },
    { category: "Convenience", items: ["Shopping Center", "School", "Hospital", "ATM"] },
  ], []);

  const popularLocations = useMemo(() => [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad",
    "Gurgaon", "Noida", "Thane", "Navi Mumbai", "Faridabad", "Ghaziabad"
  ], []);

  const quickSearchOptions = useMemo(() => [
    {
      label: "Mumbai, MH",
      type: "location",
      value: "Mumbai",
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
      label: "₹20L-₹1.3Cr",
      type: "priceRange",
      value: { min: "2000000", max: "13000000" },
      icon: IndianRupee,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
    },
    {
      label: "3-5 BHK",
      type: "bedrooms",
      value: "3-5",
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
    },
  ], []);

  const popularTypes = useMemo(() => ["Apartment", "Villa", "House", "Studio", "Penthouse"], []);

  const mockLocationSuggestions = useMemo(() => [
    "Mumbai, Maharashtra",
    "Mumbai Central, Mumbai",
    "Mumbai Suburban, Mumbai", 
    "Andheri West, Mumbai",
    "Bandra West, Mumbai",
    "Powai, Mumbai",
  ], []);

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

  // Optimized location input handler
  const handleLocationInput = useCallback((value) => {
    handleFilterChange("location", value);
    if (value.length > 2) {
      const filtered = mockLocationSuggestions.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  }, [handleFilterChange, mockLocationSuggestions]);

  // Optimized geolocation handler
  const getCurrentLocation = useCallback(() => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleFilterChange("location", `Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
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
  }, [handleFilterChange]);

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

  // Optimized search handler
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    onSearch?.(searchQuery, filters);
    setIsOpen(false);
  }, [searchQuery, filters, onSearch]);

  // Optimized quick search handler
  const handleQuickSearch = useCallback((option) => {
    setFilters(prev => {
      let newFilters = { ...prev };
      
      switch (option.type) {
        case "location":
          newFilters.location = option.value;
          break;
        case "propertyType":
          newFilters.propertyType = option.value;
          break;
        case "priceRange":
          newFilters.priceRange = option.value;
          break;
        case "bedrooms":
          newFilters.bedrooms = option.value;
          break;
      }

      onFilterChange?.(newFilters);
      onSearch?.(searchQuery, newFilters);
      return newFilters;
    });
  }, [searchQuery, onFilterChange, onSearch]);

  // Handle location click from popular locations
  const handleLocationClick = useCallback((location) => {
    handleFilterChange("location", location);
    onSearch?.(searchQuery, { ...filters, location });
  }, [handleFilterChange, onSearch, searchQuery, filters]);

  // Handle property type click from popular types
  const handlePropertyTypeClick = useCallback((type) => {
    const typeValue = type.toLowerCase();
    handleFilterChange("propertyType", typeValue);
    onSearch?.(searchQuery, { ...filters, propertyType: typeValue });
  }, [handleFilterChange, onSearch, searchQuery, filters]);

  // Handle smart tag toggle
  const handleSmartTagToggle = useCallback((tag) => {
    setFilters(prev => {
      const newSmartTags = prev.smartTags?.includes(tag)
        ? prev.smartTags.filter((t) => t !== tag)
        : [...(prev.smartTags || []), tag];
      const newFilters = { ...prev, smartTags: newSmartTags };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  // Optimized clear filters function
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      propertyType: "",
      priceRange: { min: "", max: "" },
      bedrooms: "",
      bathrooms: "",
      location: "",
      amenities: [],
      possessionStatus: "",
      furnishing: "",
      areaRange: { min: 500, max: 5000 },
      builderName: "",
      propertyAge: "",
      facing: "",
      floorNumber: "",
      gatedSociety: false,
      smartTags: [],
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    setShowLocationSuggestions(false);
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
      {/* Quick Search Options */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          {quickSearchOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuickSearch(option)}
                className={`group ${option.bgColor} backdrop-blur-sm border border-transparent hover:border-current rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 transform hover:scale-105`}
                aria-label={`Quick search for ${option.label}`}
              >
                <IconComponent className={`h-5 w-5 ${option.color}`} />
                <span className={`${option.color} font-semibold text-sm`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Popular Searches */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 text-sm">
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Popular:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {popularLocations.slice(0, 4).map((location) => (
                <button
                  key={location}
                  onClick={() => handleFilterChange("location", location)}
                  className="text-blue-500 hover:text-blue-700 hover:underline transition-colors font-medium"
                >
                  {location}
                </button>
              ))}
              <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>•</span>
              {popularTypes.slice(0, 3).map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange("propertyType", type.toLowerCase())}
                  className="text-blue-500 hover:text-blue-700 hover:underline transition-colors font-medium"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className={`flex items-stretch ${themeClasses.container} backdrop-blur-md rounded-3xl shadow-2xl border overflow-hidden transition-all duration-300`}>
          
          {/* Main Search Input */}
          <div className="flex-1 flex items-center px-6 py-5 relative">
            <Search className={`h-6 w-6 mr-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search properties, locations, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 border-none outline-none text-lg font-medium bg-transparent ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
              aria-label="Search properties"
            />
          </div>

          {/* Dark Mode Toggle */}
          {onDarkModeToggle && (
            <button
              type="button"
              onClick={onDarkModeToggle}
              className={`flex items-center px-4 py-5 border-l ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
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
            className={`flex items-center px-6 py-5 border-l ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-all duration-200`}
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
            className="px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Search className="h-5 w-5 mr-2" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Advanced Filters Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998]" onClick={handleClose} />
          <div className={`absolute top-full left-0 right-0 mt-4 ${themeClasses.dropdown} backdrop-blur-md rounded-3xl shadow-2xl border z-[999] max-h-[80vh] overflow-y-auto`}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 id="filter-dialog-title" className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Advanced Filters
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={handleClose} 
                    className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'} transition-colors`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Simplified Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                
                {/* Property Type */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Building className="inline h-4 w-4 mr-1" />
                    Property Type
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${themeClasses.input}`}
                  >
                    <option value="">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="relative">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city or area"
                    value={filters.location}
                    onChange={(e) => handleLocationInput(e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg ${themeClasses.input}`}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={useCurrentLocation}
                    className="absolute right-2 top-8 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                  >
                    {useCurrentLocation ? (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <Map className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Location Suggestions */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 ${themeClasses.dropdown} rounded-lg shadow-lg border z-10 max-h-32 overflow-y-auto`}>
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleFilterChange("location", suggestion);
                            setShowLocationSuggestions(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition-colors text-sm`}
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
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Home className="inline h-4 w-4 mr-1" />
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${themeClasses.input}`}
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
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <IndianRupee className="inline h-4 w-4 mr-1" />
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min Price (₹)"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${themeClasses.input}`}
                    />
                    <input
                      type="number"
                      placeholder="Max Price (₹)"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${themeClasses.input}`}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                
                {/* Possession Status */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Possession Status
                  </label>
                  <select
                    value={filters.possessionStatus}
                    onChange={(e) => handleFilterChange("possessionStatus", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${themeClasses.input}`}
                  >
                    <option value="">Any Status</option>
                    {possessionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Furnishing */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Furnishing
                  </label>
                  <select
                    value={filters.furnishing}
                    onChange={(e) => handleFilterChange("furnishing", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${themeClasses.input}`}
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
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
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
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenitiesList.flatMap(category => category.items).map((amenity) => (
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
