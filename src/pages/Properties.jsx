import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Building,
  Bed,
  ChevronDown,
  X,
  Home,
  Car,
  Wifi,
  Dumbbell,
  Waves,
  Shield,
  TreePine,
  Calendar,
  Square,
  DollarSign,
  SortAsc,
  FilterX,
  Loader2,
  ChevronUp,
  Star,
  Eye,
  Heart,
  TrendingUp
} from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";
import { 
  getAllProperties, 
  deleteProperty,
  getSearchFiltersData,
  searchPropertiesWithSuggestions,
  getUniqueCities,
  getUniqueLocalities,
  getAvailableAmenities
} from "../services/supabaseService";

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Core state
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    listingType: searchParams.get("listingType") || "",
    propertyType: searchParams.get("propertyType") || "",
    priceRange: searchParams.get("priceRange") || "",
    city: searchParams.get("city") || "",
    locality: searchParams.get("locality") || "",
    bhk: searchParams.get("bhk") || "",
    furnishing: searchParams.get("furnishing") || "",
    facing: searchParams.get("facing") || "",
    ageOfProperty: searchParams.get("ageOfProperty") || "",
    areaRange: searchParams.get("areaRange") || "",
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
    sortBy: searchParams.get("sortBy") || "newest"
  });
  
  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    localities: [],
    propertyTypes: [],
    furnishingTypes: [],
    facingOptions: [],
    amenities: [],
    priceRanges: { sale: {}, rent: {} }
  });
  
  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  
  // Refs
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadFilterOptions();
    loadProperties();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set("search", searchQuery);
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && !(Array.isArray(value) && value.length === 0)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      }
    });
    
    setSearchParams(params);
  }, [filters, searchQuery, setSearchParams]);

  // Count applied filters
  useEffect(() => {
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== "" && !(Array.isArray(value) && value.length === 0)) {
        return acc + 1;
      }
      return acc;
    }, 0) + (searchQuery ? 1 : 0);
    
    setAppliedFiltersCount(count);
  }, [filters, searchQuery]);

  // Load filter options from backend
  const loadFilterOptions = async () => {
    setFiltersLoading(true);
    try {
      const result = await getSearchFiltersData();
      if (result.success) {
        setFilterOptions(result.data);
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
    } finally {
      setFiltersLoading(false);
    }
  };

  // Load properties with current filters
  const loadProperties = async (page = 1, append = false) => {
    if (!append) setLoading(true);
    
    try {
      const searchFilters = {
        ...filters,
        searchQuery: searchQuery || undefined,
        limit: 20,
        offset: (page - 1) * 20
      };

      const result = await getAllProperties(searchFilters);
      
      if (result.success) {
        if (append) {
          setProperties(prev => [...prev, ...result.data]);
        } else {
          setProperties(result.data);
        }
        
        setHasMore(result.data.length === 20);
        setCurrentPage(page);
        setTotalCount(result.data.length + (page - 1) * 20);
      } else {
        console.error("Failed to load properties:", result.error);
        if (!append) setProperties([]);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
      if (!append) setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Search with debouncing
  const debouncedSearch = useCallback((query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(async () => {
      if (query && query.length >= 2) {
        setSearchLoading(true);
        try {
          const result = await searchPropertiesWithSuggestions(query, 8);
          if (result.success) {
            setSearchSuggestions(result.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Error getting search suggestions:", error);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    loadProperties(1, false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    loadProperties(1, false);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle amenity filter toggle
  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    loadProperties(1, false);
    setShowAdvancedFilters(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      listingType: "",
      propertyType: "",
      priceRange: "",
      city: "",
      locality: "",
      bhk: "",
      furnishing: "",
      facing: "",
      ageOfProperty: "",
      areaRange: "",
      amenities: [],
      sortBy: "newest"
    });
    setSearchQuery("");
    setCurrentPage(1);
    loadProperties(1, false);
  };

  // Load more properties
  const loadMore = () => {
    if (hasMore && !loading) {
      loadProperties(currentPage + 1, true);
    }
  };

  // Handle property deletion
  const handleDeleteProperty = async (propertyId, propertyType) => {
    if (!user?.uid) return;
    
    try {
      const result = await deleteProperty(user.uid, propertyId, propertyType);
      if (result.success) {
        setProperties(prevProperties => 
          prevProperties.filter(property => property.id !== propertyId)
        );
        setTotalCount(prev => prev - 1);
      } else {
        alert('Failed to delete property: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  // Static filter options
  const listingTypes = [
    { value: "", label: "All Listings" },
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
  ];

  const bhkOptions = [
    { value: "", label: "Any BHK" },
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
    { value: "4+", label: "4+ BHK" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_low_high", label: "Price: Low to High" },
    { value: "price_high_low", label: "Price: High to Low" },
    { value: "most_viewed", label: "Most Viewed" },
    { value: "area_low_high", label: "Area: Low to High" },
    { value: "area_high_low", label: "Area: High to Low" },
  ];

  const furnishingOptions = [
    { value: "", label: "Any Furnishing" },
    { value: "furnished", label: "Furnished" },
    { value: "semi-furnished", label: "Semi-Furnished" },
    { value: "unfurnished", label: "Unfurnished" },
  ];

  const facingOptions = [
    { value: "", label: "Any Facing" },
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
    { value: "north-east", label: "North-East" },
    { value: "north-west", label: "North-West" },
    { value: "south-east", label: "South-East" },
    { value: "south-west", label: "South-West" },
  ];

  const ageOptions = [
    { value: "", label: "Any Age" },
    { value: "0-1", label: "Under 1 Year" },
    { value: "1-5", label: "1-5 Years" },
    { value: "5-10", label: "5-10 Years" },
    { value: "10+", label: "10+ Years" },
  ];

  const areaRanges = [
    { value: "", label: "Any Area" },
    { value: "0-500", label: "Under 500 sq ft" },
    { value: "500-1000", label: "500-1000 sq ft" },
    { value: "1000-1500", label: "1000-1500 sq ft" },
    { value: "1500-2000", label: "1500-2000 sq ft" },
    { value: "2000+", label: "Above 2000 sq ft" },
  ];

  // Dynamic price ranges based on listing type
  const getPriceRanges = () => {
    if (filters.listingType === 'rent') {
      return [
        { value: "", label: "Any Price" },
        { value: "0-25000", label: "Under ₹25K" },
        { value: "25000-50000", label: "₹25K - ₹50K" },
        { value: "50000-100000", label: "₹50K - ₹1L" },
        { value: "100000-200000", label: "₹1L - ₹2L" },
        { value: "200000+", label: "Above ₹2L" },
      ];
    } else {
      return [
        { value: "", label: "Any Price" },
        { value: "0-5000000", label: "Under ₹50L" },
        { value: "5000000-10000000", label: "₹50L - ₹1Cr" },
        { value: "10000000-20000000", label: "₹1Cr - ₹2Cr" },
        { value: "20000000-50000000", label: "₹2Cr - ₹5Cr" },
        { value: "50000000+", label: "Above ₹5Cr" },
      ];
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "N/A";
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading && properties.length === 0) {
    return <Loading message="Loading properties..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {filters.listingType === 'rent' ? 'Properties for Rent' : 
                 filters.listingType === 'sale' ? 'Properties for Sale' : 
                 'All Properties'}
              </h1>
              <p className="text-lg text-gray-600">
                Find your perfect property from our extensive listings
              </p>
            </div>
            
            {appliedFiltersCount > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {appliedFiltersCount} filter{appliedFiltersCount > 1 ? 's' : ''} applied
                </span>
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <FilterX className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by property name, location, or description..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                )}
                {searchQuery && !searchLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                      loadProperties(1, false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {suggestion.images?.[0] && (
                        <img
                          src={suggestion.images[0]}
                          alt={suggestion.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{suggestion.title}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {suggestion.address}
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          {formatPrice(suggestion.price)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Quick Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            {/* Listing Type */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-2">Listing Type</label>
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange("listingType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {listingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-2">City</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Cities</option>
                {filterOptions.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-2">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                {filterOptions.propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {getPriceRanges().map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* BHK */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-2">Bedrooms</label>
              <select
                value={filters.bhk}
                onChange={(e) => handleFilterChange("bhk", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {bhkOptions.map((bhk) => (
                  <option key={bhk.value} value={bhk.value}>
                    {bhk.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Advanced Filters</span>
              {showAdvancedFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={applyFilters}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search Properties
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Locality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
                  <select
                    value={filters.locality}
                    onChange={(e) => handleFilterChange("locality", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Localities</option>
                    {filterOptions.localities.map((locality) => (
                      <option key={locality} value={locality}>
                        {locality}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
                  <select
                    value={filters.furnishing}
                    onChange={(e) => handleFilterChange("furnishing", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {furnishingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Facing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facing</label>
                  <select
                    value={filters.facing}
                    onChange={(e) => handleFilterChange("facing", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {facingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Age of Property */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age of Property</label>
                  <select
                    value={filters.ageOfProperty}
                    onChange={(e) => handleFilterChange("ageOfProperty", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Range</label>
                  <select
                    value={filters.areaRange}
                    onChange={(e) => handleFilterChange("areaRange", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {areaRanges.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amenities */}
              {filterOptions.amenities.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filterOptions.amenities.slice(0, 12).map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-gray-600 text-lg">
                <span className="font-semibold text-gray-900">
                  {totalCount}
                </span>{" "}
                properties found
              </p>
              {appliedFiltersCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {appliedFiltersCount} filter{appliedFiltersCount > 1 ? 's' : ''} applied
                </p>
              )}
            </div>
            
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        {properties.length > 0 ? (
          <>
            <div
              className={`${
                viewMode === "grid"
                  ? "property-card-grid"
                  : "grid grid-cols-1 gap-4 max-w-4xl mx-auto"
              }`}
            >
              {properties.map((property, index) => {
                const isOwner = user?.uid === property.user_id;
                
                return (
                  <div 
                    key={property.id} 
                    className="opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${(index % 20) * 0.05}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <PropertyCard
                      property={property}
                      isOwner={isOwner}
                      onFavorite={(id) => console.log("Favorite clicked:", id)}
                      onDelete={handleDeleteProperty}
                      viewMode={viewMode}
                    />
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5" />
                      Load More Properties
                    </>
                  )}
                </button>
              </div>
            )}

            {!hasMore && properties.length >= 20 && (
              <div className="text-center mt-12 py-8 border-t border-gray-200">
                <p className="text-gray-600">
                  You've reached the end of the results. Try adjusting your filters to see more properties.
                </p>
              </div>
            )}
          </>
        ) : !loading ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No properties found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any properties matching your criteria. Try adjusting your search filters or search terms.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <FilterX className="h-5 w-5" />
                Clear All Filters
              </button>
              <button
                onClick={() => loadProperties(1, false)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                <Search className="h-5 w-5" />
                Search Again
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Enhanced CSS Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .search-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        
        .search-filter:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }
        
        .search-filter:focus-within {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .shadow-soft {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        /* Custom scrollbar for suggestions */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Loading skeleton animation */
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
        
        /* Hover effects for interactive elements */
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        /* Focus styles for accessibility */
        .focus-ring:focus {
          outline: none;
          ring: 2px;
          ring-color: #3b82f6;
          ring-offset: 2px;
        }
        
        /* Responsive grid adjustments */
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .grid-responsive {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1025px) {
          .grid-responsive {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (min-width: 1280px) {
          .grid-responsive {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Properties;
