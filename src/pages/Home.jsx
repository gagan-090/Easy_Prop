import React, { useState, useCallback, useEffect } from "react";

import { Link } from "react-router-dom";
import {
  MapPin,
  Bed,
  Heart,
  Filter,
  Building,
  Eye,
  Star,
  CreditCard,
  Shield,
  Home as HomeIcon,
  FileText,
  TrendingUp,
  BarChart3,
  MapIcon,
  Newspaper,
  Phone,
  Award,
  Users,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle as Verified,
  MessageCircle,
  Calculator,
  ExternalLink,
  X,
} from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import ModernSearchFilter from "../components/ModernSearchFilter";
import Loading from "../components/Loading";
import {
  getFeaturedProperty,
  getPopularProperties,
  getRecentProperties,
  getTopSellers,
  getHomepageStats,
  getNearbyProperties,
} from "../services/supabaseService";

const Home = () => {
  console.log("Home component rendering");

  const [featuredProperty, setFeaturedProperty] = useState(null);
  const [popularProperties, setPopularProperties] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [topSellers, setTopSellers] = useState([]);

  const [stats, setStats] = useState({
    propertiesListed: "10K+",
    happyCustomers: "5K+",
    expertAgents: "500+",
    citiesCovered: "50+",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchFilters, setSearchFilters] = useState({
    location: "Mumbai, MH",
    propertyType: "Apartments",
    priceRange: "₹20,00,000-₹1,30,00,000",
    bedrooms: "3-5",
  });

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleApplyFilters = useCallback((filters) => {
    console.log("Applied filters:", filters);
    // In a real app, this would update the search results
  }, []);

  const handleSearch = useCallback((query, filters) => {
    console.log("Search query:", query, "Filters:", filters);
    // Navigate to search results page
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (typeof value === "object" && !Array.isArray(value)) {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, Array.isArray(value) ? value.join(",") : value);
        }
      }
    });
    window.location.href = `/search?${params.toString()}`;
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [
          featuredPropRes,
          popularPropsRes,
          recentPropsRes,
          topSellersRes,
          statsRes,
        ] = await Promise.all([
          getFeaturedProperty(),
          getPopularProperties(6),
          getRecentProperties(4),
          getTopSellers(4),
          getHomepageStats(),
        ]);

        if (featuredPropRes.success) {
          setFeaturedProperty(featuredPropRes.data);
        } else {
          console.warn(
            "Could not fetch featured property:",
            featuredPropRes.error
          );
        }

        if (popularPropsRes.success) {
          setPopularProperties(popularPropsRes.data);
        } else {
          console.warn(
            "Could not fetch popular properties:",
            popularPropsRes.error
          );
        }

        if (recentPropsRes.success) {
          setRecentProperties(recentPropsRes.data);
        } else {
          console.warn(
            "Could not fetch recent properties:",
            recentPropsRes.error
          );
        }

        if (topSellersRes.success) {
          setTopSellers(topSellersRes.data);
        } else {
          console.warn("Could not fetch top sellers:", topSellersRes.error);
        }

        if (statsRes.success) {
          const {
            propertiesListed,
            happyCustomers,
            expertAgents,
            citiesCovered,
          } = statsRes.data;
          setStats({
            propertiesListed:
              propertiesListed > 1000
                ? `${Math.round(propertiesListed / 1000)}K+`
                : `${propertiesListed}`,
            happyCustomers:
              happyCustomers > 1000
                ? `${Math.round(happyCustomers / 1000)}K+`
                : `${happyCustomers}`,
            expertAgents: `${expertAgents}`,
            citiesCovered: `${citiesCovered}`,
          });
        } else {
          console.warn("Could not fetch homepage stats:", statsRes.error);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError("Could not load homepage data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const result = await getNearbyProperties(latitude, longitude);
          if (result.success) {
            setNearbyProperties(result.data);
          } else {
            console.error("Failed to get nearby properties:", result.error);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchFilters);
    window.location.href = `/search?${params.toString()}`;
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Oops! Something went wrong.
          </h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}

      <section className="relative pt-20 pb-32 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&h=1080&fit=crop&crop=center"
            alt="Luxury Apartment Building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/80"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Main Heading */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                🏠 India's #1 Property Platform
              </span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Find Your Dream
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Home
              </span>
              <br />
              <span className="text-4xl lg:text-5xl text-white/90">
                in Noida
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12">
              Discover premium properties, luxury villas, and modern apartments
              with our AI-powered search. Your perfect home is just a click
              away.
            </p>

            {/* Quick Stats with enhanced animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
              <div className="text-center glass-morphism p-6 rounded-2xl hover-lift interactive-button">
                <div className="text-3xl font-bold text-blue-600 mb-2 heartbeat">
                  {stats.propertiesListed}
                </div>
                <div className="text-sm text-slate-600">Properties Listed</div>
              </div>
              <div className="text-center glass-morphism p-6 rounded-2xl hover-lift interactive-button">
                <div className="text-3xl font-bold text-purple-600 mb-2 wave-animation">
                  {stats.happyCustomers}
                </div>
                <div className="text-sm text-slate-600">Happy Customers</div>
              </div>
              <div className="text-center glass-morphism p-6 rounded-2xl hover-lift interactive-button">
                <div className="text-3xl font-bold text-pink-600 mb-2 breathing">
                  {stats.expertAgents}
                </div>
                <div className="text-sm text-slate-600">Expert Agents</div>
              </div>
              <div className="text-center glass-morphism p-6 rounded-2xl hover-lift interactive-button">
                <div className="text-3xl font-bold text-green-600 mb-2 levitate">
                  {stats.citiesCovered}
                </div>
                <div className="text-sm text-slate-600">Cities Covered</div>
              </div>
            </div>
          </div>

          {/* Featured Property Card with enhanced effects */}
          {featuredProperty && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover-lift property-card-enhanced glass-morphism">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Property Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        featuredProperty.images?.[0] ||
                        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&crop=center"
                      }
                      alt={featuredProperty.title}
                      className="w-full h-80 lg:h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                    {/* Enhanced floating badges */}
                    <div className="absolute top-6 left-6">
                      <div className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg pulse-glow interactive-button crystal-shine">
                        🔥 Featured
                      </div>
                    </div>

                    <button className="absolute top-6 right-6 w-12 h-12 glass-morphism rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 interactive-button energy-pulse">
                      <Heart className="h-6 w-6 text-slate-600 hover:text-red-500 transition-colors heartbeat" />
                    </button>

                    {/* Bottom stats overlay */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="glass-effect rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{featuredProperty.views || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-current text-yellow-400" />
                              <span>{featuredProperty.rating || "N/A"}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{featuredProperty.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-8 lg:p-12 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {featuredProperty.title}
                      </h2>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredProperty.amenities
                          ?.slice(0, 4)
                          .map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                          <div className="text-3xl font-bold text-slate-900 mb-1">
                            {featuredProperty.bedrooms}
                          </div>
                          <div className="text-sm text-slate-600">Bedrooms</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                          <div className="text-3xl font-bold text-slate-900 mb-1">
                            {featuredProperty.bathrooms}
                          </div>
                          <div className="text-sm text-slate-600">
                            Bathrooms
                          </div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                          <div className="text-3xl font-bold text-slate-900 mb-1">
                            {featuredProperty.area.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600">Sq Ft</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-8">
                        <div className="price-tag bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(featuredProperty.price)}
                        </div>
                        <Link
                          to={`/emi-calculator?price=${featuredProperty.price}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                          EMI Calculator →
                        </Link>
                      </div>

                      {/* Agent Info */}
                      {featuredProperty.users && (
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                featuredProperty.users.profile?.avatar_url ||
                                `https://i.pravatar.cc/150?u=${featuredProperty.users.id}`
                              }
                              alt={featuredProperty.users.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {featuredProperty.users.name}
                              </div>
                              <div className="text-xs text-slate-600">
                                {featuredProperty.users.company ||
                                  "Premium Agent"}
                              </div>
                            </div>
                          </div>
                          <Link
                            to={`/agent-contact/${featuredProperty.users.id}/${featuredProperty.id}`}
                            className="btn-secondary text-sm hover-scale inline-block text-center"
                          >
                            Contact Agent
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <Link
                        to={`/schedule-tour/${featuredProperty.id}`}
                        className="btn-primary interactive-button hover-glow energy-pulse text-center"
                      >
                        Schedule Tour
                      </Link>
                      <Link
                        to={`/property/${featuredProperty.id}`}
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 interactive-button hover-lift text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Modern Search Filter */}
          <div className="mt-16 relative z-50 overflow-visible">
            <ModernSearchFilter
              onSearch={handleSearch}
              onFilterChange={handleApplyFilters}
              darkMode={darkMode}
              onDarkModeToggle={toggleDarkMode}
              initialFilters={{
                location: "Mumbai",
                propertyType: "apartment",
                priceRange: { min: "2000000", max: "13000000" },
                bedrooms: "3",
              }}
            />
          </div>
        </div>
      </section>

      {/* Popular Properties */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Popular Properties
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover our most sought-after properties across Mumbai
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {popularProperties.map((property) => (
              <div key={property.id}>
                <PropertyCard
                  property={property}
                  onFavorite={(id) => console.log("Favorite clicked:", id)}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="btn-primary interactive-button hover-glow energy-pulse px-8 py-4 text-lg"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* EasyProp Edge - Feature Services Cards */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              EasyProp Edge
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Exclusive services designed to make your property journey seamless
              and secure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-morphism rounded-2xl p-8 text-center hover-lift interactive-button">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Buy on Credit
              </h3>
              <p className="text-slate-600 mb-6">
                Get your dream home now, pay later.
              </p>
              <button className="btn-primary w-full interactive-button hover-glow">
                Learn More
              </button>
            </div>

            <div className="glass-morphism rounded-2xl p-8 text-center hover-lift interactive-button">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Verified className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Premium Verified Listings
              </h3>
              <p className="text-slate-600 mb-6">
                Hand-verified premium projects.
              </p>
              <button className="btn-primary w-full interactive-button hover-glow">
                Explore
              </button>
            </div>

            <div className="glass-morphism rounded-2xl p-8 text-center hover-lift interactive-button">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Loan Assistance
              </h3>
              <p className="text-slate-600 mb-6">
                Check instant home loan eligibility.
              </p>
              <Link
                to="/emi-calculator"
                className="btn-primary w-full interactive-button hover-glow block text-center"
              >
                Check Eligibility
              </Link>
            </div>

            <div className="glass-morphism rounded-2xl p-8 text-center hover-lift interactive-button">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Legal & Home Insurance
              </h3>
              <p className="text-slate-600 mb-6">
                Secure your property legally.
              </p>
              <button className="btn-primary w-full interactive-button hover-glow">
                Get Help
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Picks / Featured Properties Carousel */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Top Picks by EasyProp
              </h2>
              <p className="text-lg text-slate-600">
                Handpicked premium properties just for you
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <ChevronLeft className="h-6 w-6 text-slate-600" />
              </button>
              <button className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <ChevronRight className="h-6 w-6 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="flex space-x-6 pb-4">
              {popularProperties.slice(0, 4).map((property, index) => (
                <div key={property.id} className="flex-none w-80">
                  <div className="property-card-enhanced group">
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          property.images?.[0] ||
                          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center"
                        }
                        alt={property.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="bg-gradient-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {index === 0
                            ? "🏆 Luxury Pick"
                            : index === 1
                            ? "🔥 Hot Deal"
                            : "⭐ Editor's Choice"}
                        </div>
                      </div>
                      <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                        <Heart className="h-5 w-5 text-slate-600 hover:text-red-500 transition-colors" />
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.address}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="price-tag mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(property.price)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                        <span>{property.bedrooms} BHK</span>
                        <span>{property.area} sqft</span>
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          to={`/agent-contact/${property.user_id}/${property.id}`}
                          className="flex-1 btn-secondary text-center text-sm"
                        >
                          Contact
                        </Link>
                        <Link
                          to={`/schedule-tour/${property.id}`}
                          className="flex-1 btn-primary text-center text-sm"
                        >
                          Book Visit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Projects Banner */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=600&fit=crop&crop=center"
            alt="Premium Project"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-block bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🌟 Exclusive Launch
              </div>
              <h2 className="text-5xl font-bold mb-6">
                Luxury Residences at
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}
                  Marina Bay
                </span>
              </h2>
              <div className="flex items-center space-x-6 mb-6">
                <div>
                  <div className="text-2xl font-bold">3-4 BHK</div>
                  <div className="text-slate-300">Premium Apartments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">₹2.5-4.2 Cr</div>
                  <div className="text-slate-300">Starting Price</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">Bandra West</div>
                  <div className="text-slate-300">Prime Location</div>
                </div>
              </div>
              <p className="text-xl text-slate-300 mb-8">
                Experience luxury living with panoramic sea views, world-class
                amenities, and unmatched connectivity.
              </p>
              <div className="flex space-x-4">
                <button className="btn-primary px-8 py-4 text-lg interactive-button hover-glow energy-pulse">
                  Explore Project
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold py-4 px-8 rounded-xl transition-colors">
                  Download Brochure
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="glass-morphism rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Project Highlights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Sea-facing premium apartments</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>5-star hotel-like amenities</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    <span>Direct metro connectivity</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>RERA approved & ready to move</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research & Insights Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Insights & Research
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stay informed with our comprehensive market analysis and trends
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass-morphism rounded-2xl p-8 text-center hover-lift interactive-button">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Price Trends
              </h3>
              <p className="text-slate-600 mb-6">
                Real-time market analysis and price predictions for informed
                decisions
              </p>
              <button className="btn-primary interactive-button hover-glow">
                Explore
              </button>
            </div>

            <div className="glass-morphism rounded-2xl p-8 text-center hover-lift interactive-button">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                City Insights
              </h3>
              <p className="text-slate-600 mb-6">
                Comprehensive locality guides and infrastructure development
                updates
              </p>
              <button className="btn-primary interactive-button hover-glow">
                Explore
              </button>
            </div>

            <div className="glass-morphism rounded-2xl p-8 text-center hover-lift interactive-button">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Housing Research
              </h3>
              <p className="text-slate-600 mb-6">
                In-depth reports on market trends and investment opportunities
              </p>
              <button className="btn-primary interactive-button hover-glow">
                Explore
              </button>
            </div>
          </div>

          {/* Mini Loan Eligibility Calculator Widget */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-morphism rounded-3xl p-8 hover-lift">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Quick Loan Eligibility Check
                </h3>
                <p className="text-slate-600">
                  Get instant loan eligibility estimate in seconds
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monthly Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="50,000"
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Property Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="50,00,000"
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Loan Tenure
                  </label>
                  <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>20 years</option>
                    <option>25 years</option>
                    <option>30 years</option>
                  </select>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/emi-calculator"
                  className="btn-primary px-8 py-4 text-lg interactive-button hover-glow energy-pulse"
                >
                  Calculate Eligibility
                </Link>
                <p className="text-sm text-slate-500 mt-3">
                  Get detailed EMI breakdown and loan options
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map View Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Explore Properties on Map
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Visualize properties in your preferred locations with our
              interactive map view
            </p>
          </div>

          <div className="glass-morphism rounded-3xl overflow-hidden hover-lift">
            <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100">
              {/* Map placeholder with interactive elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="h-20 w-20 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Interactive Map View
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Discover properties with location-based search
                  </p>
                  <button className="btn-primary px-8 py-3 interactive-button hover-glow">
                    Open Map View
                  </button>
                </div>
              </div>

              {/* Sample property markers */}
              <div className="absolute top-20 left-20 w-4 h-4 bg-blue-600 rounded-full animate-pulse shadow-lg"></div>
              <div className="absolute top-32 right-32 w-4 h-4 bg-purple-600 rounded-full animate-pulse shadow-lg"></div>
              <div className="absolute bottom-24 left-32 w-4 h-4 bg-green-600 rounded-full animate-pulse shadow-lg"></div>
              <div className="absolute bottom-32 right-24 w-4 h-4 bg-orange-600 rounded-full animate-pulse shadow-lg"></div>

              {/* Map controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
                  <span className="text-lg font-bold text-slate-600">+</span>
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
                  <span className="text-lg font-bold text-slate-600">-</span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-slate-600">Apartments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-slate-600">Villas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-slate-600">Commercial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span className="text-sm text-slate-600">Land</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600">View:</span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    Map
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newly Added Properties */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Freshly Listed Properties
              </h2>
              <p className="text-lg text-slate-600">
                Latest additions to our premium property collection
              </p>
            </div>
            <Link
              to="/properties"
              className="btn-primary interactive-button hover-glow"
            >
              View All
            </Link>
          </div>

          <div className="overflow-hidden">
            <div className="flex space-x-6 pb-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex-none w-72">
                  <div className="property-card-enhanced group">
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          property.images?.[0] ||
                          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center"
                        }
                        alt={property.title}
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          🆕 New
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {`${Math.round(
                            (new Date() - new Date(property.created_at)) /
                              (1000 * 60 * 60 * 24)
                          )}d ago`}
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.address}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <div className="price-tag text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(property.price)}
                        </div>
                        <div className="text-sm text-slate-600">
                          {property.bedrooms} BHK • {property.area} sqft
                        </div>
                      </div>
                      <button className="w-full btn-primary text-sm interactive-button hover-glow">
                        Contact Seller
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Sellers */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Top Rated Sellers
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with our verified and highly-rated property experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topSellers.map((seller) => (
              <div
                key={seller.id}
                className="glass-morphism rounded-2xl p-6 text-center hover-lift interactive-button"
              >
                <div className="relative mb-6">
                  <img
                    src={
                      seller.profile?.avatar_url ||
                      `https://i.pravatar.cc/150?u=${seller.id}`
                    }
                    alt={seller.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {seller.name}
                </h3>
                <p className="text-slate-600 mb-1">
                  {seller.company || "Independent Agent"}
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  {seller.experience || "Experienced"}
                </p>

                <div className="flex items-center justify-center space-x-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-slate-900">
                      {seller.stats?.totalProperties || 0}
                    </div>
                    <div className="text-slate-500">Active Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-900 flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {seller.rating || "4.8"}
                    </div>
                    <div className="text-slate-500">Rating</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary text-sm">
                    View Listings
                  </button>
                  <button className="flex-1 btn-primary text-sm interactive-button hover-glow">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Articles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Real Estate Insights
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stay updated with the latest news and expert insights from the
              real estate world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Mumbai Real Estate Market Outlook 2024",
                image:
                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&crop=center",
                date: "Jan 28, 2024",
                excerpt:
                  "Comprehensive analysis of Mumbai's property market trends and future predictions.",
              },
              {
                title: "Top 10 Emerging Localities in Noida",
                image:
                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop&crop=center",
                date: "Jan 25, 2024",
                excerpt:
                  "Discover the most promising areas for property investment in Noida's expanding landscape.",
              },
              {
                title: "Home Loan Interest Rates: What to Expect",
                image:
                  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&crop=center",
                date: "Jan 22, 2024",
                excerpt:
                  "Expert insights on current home loan trends and tips for securing the best rates.",
              },
            ].map((article, index) => (
              <div
                key={index}
                className="property-card-enhanced group hover-lift"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      <Newspaper className="h-3 w-3 inline mr-1" />
                      Article
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-slate-500 mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.date}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center">
                    Read More
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Quick Links */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Popular Searches
            </h2>
            <p className="text-lg text-slate-600">
              Quick access to trending property searches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                People Also Searched
              </h3>
              <div className="space-y-2">
                {[
                  "3 BHK in Mumbai",
                  "Villa in Goa",
                  "Office Space in Pune",
                  "Plot in Noida",
                  "2 BHK in Delhi",
                ].map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block text-slate-600 hover:text-blue-600 transition-colors text-sm py-1"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Properties under ₹50L
              </h3>
              <div className="space-y-2">
                {[
                  "Affordable Homes Mumbai",
                  "Budget Flats Pune",
                  "Low Cost Housing Delhi",
                  "Starter Homes Noida",
                  "Economy Apartments",
                ].map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block text-slate-600 hover:text-blue-600 transition-colors text-sm py-1"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                2BHK near Metro
              </h3>
              <div className="space-y-2">
                {[
                  "Metro Connected Homes",
                  "Subway Adjacent Flats",
                  "Transit Oriented Properties",
                  "Metro Station Properties",
                  "Connected Living Spaces",
                ].map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block text-slate-600 hover:text-blue-600 transition-colors text-sm py-1"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Plots in Noida
              </h3>
              <div className="space-y-2">
                {[
                  "Residential Plots Noida",
                  "Commercial Land Noida",
                  "Investment Plots",
                  "Sector-wise Plots",
                  "RERA Approved Plots",
                ].map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block text-slate-600 hover:text-blue-600 transition-colors text-sm py-1"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sell Property CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-5xl font-bold mb-6">
                Want to Sell Your Property?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                List your property for free and connect with thousands of
                verified buyers. Get the best price with our expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl transition-colors text-center"
                >
                  List for Free
                </Link>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-xl transition-colors">
                  Sell Now
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="glass-morphism rounded-3xl p-8 backdrop-blur-sm">
                <div className="text-center text-white">
                  <Users className="h-16 w-16 mx-auto mb-6 text-blue-200" />
                  <h3 className="text-2xl font-bold mb-4">
                    Join 10,000+ Sellers
                  </h3>
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-200">
                        95%
                      </div>
                      <div className="text-sm">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-200">
                        30 Days
                      </div>
                      <div className="text-sm">Avg. Sale Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to find your dream home?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of satisfied customers who found their perfect
            property with EasyProp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="bg-white text-slate-900 hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors"
            >
              Browse Properties
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold py-4 px-8 rounded-xl transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          <button className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 energy-pulse">
            <MessageCircle className="h-8 w-8" />
          </button>
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Chat with us on WhatsApp
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-28 z-50">
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110">
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Enhanced Search Filter Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Advanced Property Search
                </h2>
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ModernSearchFilter
                onSearch={handleSearch}
                onFilterChange={handleApplyFilters}
                darkMode={darkMode}
                onDarkModeToggle={toggleDarkMode}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
