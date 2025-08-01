import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Square, Heart, ChevronDown, Filter, User, Building, Eye, Star, Calendar } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import FloatingActionButton from '../components/FloatingActionButton';

const Home = () => {
  console.log('Home component rendering');
  
  const [searchFilters, setSearchFilters] = useState({
    location: 'Mumbai, MH',
    propertyType: 'Apartments',
    priceRange: '₹20,00,000-₹1,30,00,000',
    bedrooms: '3-5'
  });

  const featuredProperty = {
    id: 1,
    title: 'Luxury Penthouse with Panoramic City Views',
    price: 16500000,
    beds: 4,
    baths: 3,
    sqft: 1868,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&crop=center',
    agent: {
      name: 'Amelia Stephenson',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=face'
    },
    location: 'Marine Drive, Mumbai',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security'],
    rating: 4.9,
    views: 3247
  };

  const popularProperties = [
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
        name: 'Priya Sharma',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
      }
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
        name: 'Rajesh Kumar',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      }
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
        name: 'Sneha Patel',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      }
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
        name: 'Arjun Mehta',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      }
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
        name: 'Kavita Singh',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face'
      }
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
        name: 'Vikram Joshi',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
      }
    }
  ];

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchFilters);
    window.location.href = `/properties?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-pink-200 rounded-full opacity-20 float" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Heading */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                🏠 India's #1 Property Platform
              </span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight slide-up">
              Find Your Dream
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Home</span>
              <br />
              <span className="text-4xl lg:text-5xl text-slate-600">in Noida</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 fade-in" style={{animationDelay: '0.3s'}}>
              Discover premium properties, luxury villas, and modern apartments with our AI-powered search. 
              Your perfect home is just a click away.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16 fade-in" style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-sm text-slate-600">Properties Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">5K+</div>
                <div className="text-sm text-slate-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">500+</div>
                <div className="text-sm text-slate-600">Expert Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                <div className="text-sm text-slate-600">Cities Covered</div>
              </div>
            </div>
          </div>

          {/* Featured Property Card */}
          <div className="max-w-6xl mx-auto scale-in" style={{animationDelay: '0.9s'}}>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover-lift">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Property Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={featuredProperty.image}
                    alt={featuredProperty.title}
                    className="w-full h-80 lg:h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  
                  {/* Floating badges */}
                  <div className="absolute top-6 left-6">
                    <div className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg pulse-glow">
                      🔥 Hot Deal
                    </div>
                  </div>
                  
                  <button className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <Heart className="h-6 w-6 text-slate-600 hover:text-red-500 transition-colors" />
                  </button>
                  
                  {/* Bottom stats overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass-effect rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{featuredProperty.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                            <span>{featuredProperty.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{featuredProperty.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-8 lg:p-12 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{featuredProperty.title}</h2>
                    
                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredProperty.amenities.map((amenity, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <div className="text-3xl font-bold text-slate-900 mb-1">{featuredProperty.beds}</div>
                        <div className="text-sm text-slate-600">Bedrooms</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <div className="text-3xl font-bold text-slate-900 mb-1">{featuredProperty.baths}</div>
                        <div className="text-sm text-slate-600">Bathrooms</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <div className="text-3xl font-bold text-slate-900 mb-1">{featuredProperty.sqft.toLocaleString()}</div>
                        <div className="text-sm text-slate-600">Sq Ft</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                      <div className="price-tag bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(featuredProperty.price)}
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                        EMI Calculator →
                      </button>
                    </div>

                    {/* Agent Info */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <img
                          src={featuredProperty.agent.image}
                          alt={featuredProperty.agent.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{featuredProperty.agent.name}</div>
                          <div className="text-xs text-slate-600">Premium Agent • 4.9★</div>
                        </div>
                      </div>
                      <button className="btn-secondary text-sm hover-scale">Contact Agent</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <button className="btn-primary interactive-button hover-glow">
                      Schedule Tour
                    </button>
                    <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                      Virtual Tour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Filters */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="search-filter">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">Location</div>
                    <div className="font-medium text-slate-900">{searchFilters.location}</div>
                  </div>
                </div>

                <div className="search-filter">
                  <Building className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">Property type</div>
                    <div className="font-medium text-slate-900">{searchFilters.propertyType}</div>
                  </div>
                </div>

                <div className="search-filter">
                  <div className="text-2xl">₹</div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">Price</div>
                    <div className="font-medium text-slate-900">{searchFilters.priceRange}</div>
                  </div>
                </div>

                <div className="search-filter">
                  <Bed className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">Bedrooms</div>
                    <div className="font-medium text-slate-900">{searchFilters.bedrooms}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button className="flex items-center space-x-2 text-slate-600 hover:text-slate-900">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">More</span>
                </button>
                
                <button 
                  onClick={handleSearch}
                  className="btn-primary px-8"
                >
                  Search
                </button>
              </div>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularProperties.slice(0, 6).map((property, index) => (
              <div 
                key={property.id} 
                className="fade-in"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <PropertyCard 
                  property={property}
                  onFavorite={(id) => console.log('Favorite clicked:', id)}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/properties" className="btn-primary">
              View All Properties
            </Link>
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
            Join thousands of satisfied customers who found their perfect property with Estately
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties" className="bg-white text-slate-900 hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors">
              Browse Properties
            </Link>
            <Link to="/register" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold py-4 px-8 rounded-xl transition-colors">
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Home;