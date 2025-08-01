import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, Eye, Share2, Calendar, Star } from 'lucide-react';

const PropertyCard = ({ property, showStats = false, onFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getPropertyTypeDisplayName = (type) => {
    const types = {
      apartment: 'Apartment',
      villa: 'Villa',
      land: 'Land',
      commercial: 'Commercial'
    };
    return types[type] || 'Property';
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(property.id);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Share functionality
    console.log('Share property:', property.id);
  };

  // Realistic property images based on type
  const getPropertyImage = () => {
    if (property.image && property.image !== '/api/placeholder/400/300') {
      return property.image;
    }
    
    const imageMap = {
      villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center',
      apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=center',
      commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center',
      land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&crop=center'
    };
    
    return imageMap[property.type] || imageMap.apartment;
  };

  return (
    <div 
      className="property-card-enhanced group fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        {/* Image with loading state */}
        <div className="relative">
          {!imageLoaded && (
            <div className="property-image-enhanced shimmer-loading" />
          )}
          <img
            src={getPropertyImage()}
            alt={property.title}
            className={`property-image-enhanced group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top badges and actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col space-y-2">
            {property.featured && (
              <div className="bg-gradient-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                ⭐ Featured
              </div>
            )}
            {property.isNew && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                🆕 New
              </div>
            )}
            {property.verified && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                ✓ Verified
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            {/* Favorite Button */}
            <button 
              onClick={handleFavoriteClick}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 interactive-button"
            >
              <Heart className={`h-5 w-5 transition-colors duration-300 ${property.isFavorite ? 'text-red-500 fill-current' : 'text-slate-600'}`} />
            </button>
            
            {/* Share Button */}
            <button 
              onClick={handleShareClick}
              className={`w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 interactive-button ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
              <Share2 className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
        
        {/* Bottom overlay info */}
        <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="glass-effect rounded-xl p-3 text-white">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{property.views || Math.floor(Math.random() * 500) + 50}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>{property.rating || (4.0 + Math.random()).toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>Listed {property.daysAgo || Math.floor(Math.random() * 30) + 1} days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Location with icon */}
        <div className="flex items-center text-sm text-slate-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 text-slate-400" />
          {property.location}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {property.title}
        </h3>
        
        {/* Price with animation */}
        <div className="price-tag mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {formatPrice(property.price)}
          {property.pricePerSqft && (
            <span className="text-sm text-slate-500 ml-2">
              (₹{Math.floor(property.price / property.sqft).toLocaleString()}/sqft)
            </span>
          )}
        </div>
        
        {/* Property Details */}
        {property.type !== 'land' && (
          <div className="property-stats mb-6 bg-slate-50 rounded-xl p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              {property.beds > 0 && (
                <div className="flex flex-col items-center">
                  <Bed className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-sm font-medium text-slate-900">{property.beds}</span>
                  <span className="text-xs text-slate-500">Beds</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <Bath className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-sm font-medium text-slate-900">{property.baths}</span>
                <span className="text-xs text-slate-500">Baths</span>
              </div>
              <div className="flex flex-col items-center">
                <Square className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-sm font-medium text-slate-900">{property.sqft?.toLocaleString()}</span>
                <span className="text-xs text-slate-500">Sqft</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Property Type Badge */}
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
            {getPropertyTypeDisplayName(property.type)}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/property/${property.id}`}
            className="flex-1 text-center btn-primary text-sm interactive-button hover-glow"
          >
            View Details
          </Link>
          <button className="px-4 py-2 border-2 border-slate-200 text-slate-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300 text-sm font-medium">
            Quick Tour
          </button>
        </div>
        
        {/* Agent info (if available) */}
        {property.agent && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-3">
              <img
                src={property.agent.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                alt={property.agent.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{property.agent.name}</div>
                <div className="text-xs text-slate-500">Licensed Agent</div>
              </div>
              <button className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors">
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;