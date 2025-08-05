import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";
import { getAllProperties, deleteProperty } from "../services/supabaseService";

const Properties = () => {

  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    listingType: searchParams.get("listingType") || "",
    propertyType: searchParams.get("propertyType") || "",
    priceRange: searchParams.get("priceRange") || "",
    city: searchParams.get("city") || "",
    bhk: searchParams.get("bhk") || "",
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [allProperties, setAllProperties] = useState([]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const result = await getAllProperties();
      if (result.success) {
        setAllProperties(result.data);
        setProperties(result.data); // Initially show all properties
      } else {
        console.error("Failed to load properties:", result.error);
        setProperties([]);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const result = await getAllProperties(activeFilters);
      if (result.success) {
        setProperties(result.data);
      } else {
        console.error("Failed to filter properties:", result.error);
        setProperties([]);
      }
    } catch (error) {
      console.error("Error filtering properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId, propertyType) => {

    if (!user?.uid) return;
    
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

  const listingTypes = [
    { value: "", label: "All Listings" },
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
  ];

  const propertyTypes = [
    { value: "", label: "All Types" },
    { value: "apartment", label: "Apartments" },
    { value: "villa", label: "Villas" },
    { value: "house", label: "Houses" },
    { value: "office", label: "Office Space" },
    { value: "shop", label: "Shops" },
    { value: "land", label: "Land/Plot" },
  ];

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
        { value: "20000000+", label: "Above ₹2Cr" },
      ];
    }
  };

  const bhkOptions = [
    { value: "", label: "Any BHK" },
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
    { value: "4+", label: "4+ BHK" },
  ];

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Pune",
    "Kolkata",
    "Ahmedabad",
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredProperties = properties;

  if (loading) {

    return <Loading message="Loading properties..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {filters.listingType === 'rent' ? 'Properties for Rent' : 
             filters.listingType === 'sale' ? 'Properties for Sale' : 
             'All Properties'}
          </h1>
          <p className="text-lg text-slate-600">
            Find your perfect property from our extensive listings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="search-filter">
              <div className="text-xl text-slate-400">🏷️</div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Listing type</div>
                <select
                  value={filters.listingType}
                  onChange={(e) =>
                    handleFilterChange("listingType", e.target.value)
                  }
                  className="w-full bg-transparent border-none outline-none font-medium text-slate-900"
                >
                  {listingTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
            <div className="search-filter">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Location</div>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-medium text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="search-filter">
              <Building className="h-5 w-5 text-slate-400" />
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Property type</div>
                <select
                  value={filters.propertyType}
                  onChange={(e) =>
                    handleFilterChange("propertyType", e.target.value)
                  }
                  className="w-full bg-transparent border-none outline-none font-medium text-slate-900"
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>

            <div className="search-filter">
              <div className="text-xl text-slate-400">₹</div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Price</div>
                <select
                  value={filters.priceRange}
                  onChange={(e) =>
                    handleFilterChange("priceRange", e.target.value)
                  }
                  className="w-full bg-transparent border-none outline-none font-medium text-slate-900"
                >
                  {getPriceRanges().map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>

            <div className="search-filter">
              <Bed className="h-5 w-5 text-slate-400" />
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Bedrooms</div>
                <select
                  value={filters.bhk}
                  onChange={(e) => handleFilterChange("bhk", e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-medium text-slate-900"
                >
                  {bhkOptions.map((bhk) => (
                    <option key={bhk.value} value={bhk.value}>
                      {bhk.label}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">More filters</span>
            </button>

            <button className="btn-primary px-8" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>

          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-600 text-lg">
              <span className="font-semibold text-slate-900">
                {filteredProperties.length}
              </span>{" "}
              properties found
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-xl border border-gray-200 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
              <option>Sort by: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <div
            className={`grid gap-8 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}
          >
            {filteredProperties.map((property, index) => {
              const isOwner = user?.uid === property.user_id;
              console.log('Rendering property:', {
                id: property.id,
                title: property.title,
                user_id: property.user_id,
                current_user: user?.uid,
                isOwner: isOwner
              });
              
              return (
                <div 
                  key={property.id} 
                  className="fade-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <PropertyCard
                    property={property}
                    isOwner={isOwner}
                    onFavorite={(id) => console.log("Favorite clicked:", id)}
                    onDelete={handleDeleteProperty}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-slate-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No properties found
            </h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search filters to find more properties.
            </p>
            <button
              onClick={() =>
                setFilters({
                  listingType: "",
                  propertyType: "",
                  priceRange: "",
                  city: "",
                  bhk: "",
                })
              }
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredProperties.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">Load More Properties</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
