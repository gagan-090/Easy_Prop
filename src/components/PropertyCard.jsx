import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Eye,
  Share2,
  Star,
  Home,
  Calendar,
  Car,
  Wifi,
  Shield,
  Zap,
  TreePine,
} from "lucide-react";

const PropertyCard = ({ property, onFavorite, className = "" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();

  // Format price helper
  const formatPrice = (price) => {
    if (!price) return "Price on request";
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // Get property age
  const getPropertyAge = () => {
    if (property.construction_year) {
      const age = new Date().getFullYear() - property.construction_year;
      if (age === 0) return "New";
      if (age === 1) return "1 year";
      return `${age} years`;
    }
    return property.age || "N/A";
  };

  // Get top amenities to display
  const getTopAmenities = () => {
    const amenities = property.amenities || [];
    const amenityIcons = {
      parking: Car,
      wifi: Wifi,
      security: Shield,
      power_backup: Zap,
      garden: TreePine,
    };
    
    return amenities.slice(0, 3).map(amenity => ({
      name: amenity,
      icon: amenityIcons[amenity.toLowerCase().replace(/\s+/g, '_')] || Wifi
    }));
  };

  // Get property image with fallback
  const getPropertyImage = () => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property.image) {
      return property.image;
    }
    // Fallback based on property type
    const fallbacks = {
      villa:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
      apartment:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      house:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
      office:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    };
    return fallbacks[property.property_type] || fallbacks.apartment;
  };

  // Mouse tracking for cursor-following image effect
  const handleMouseMove = (e) => {
    if (!cardRef.current || !imageRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate movement based on mouse position (subtle effect)
    const moveX = (x - rect.width / 2) * 0.03;
    const moveY = (y - rect.height / 2) * 0.03;

    setMousePosition({ x: moveX, y: moveY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavorite) {
      onFavorite(property.id);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/property/${property.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleImageError = (e) => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 hover:scale-[1.01] w-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Image Container with Cursor Following Effect */}
      <div className="relative h-40 overflow-hidden rounded-t-xl">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        )}

        {!imageError && (
          <img
            ref={imageRef}
            src={getPropertyImage()}
            alt={property.title}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate(${mousePosition.x}px, ${
                mousePosition.y
              }px) scale(${isHovered ? 1.1 : 1})`,
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <Home className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-600 font-medium text-sm">
                Property Image
              </p>
            </div>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleFavoriteClick}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group/btn"
          >
            <Heart
              className={`h-5 w-5 transition-all duration-300 ${
                isFavorite
                  ? "text-red-500 fill-current scale-110"
                  : "text-gray-600 group-hover/btn:text-red-500"
              }`}
            />
          </button>

          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
          >
            <Share2 className="h-4 w-4 text-gray-600 hover:text-blue-500 transition-colors duration-300" />
          </button>
        </div>

        {/* Property Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {property.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
              ⭐ Featured
            </div>
          )}
          {property.verified && (
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              ✓ Verified
            </div>
          )}
        </div>

        {/* Bottom Stats Overlay */}
        <div className="absolute bottom-2 left-2 right-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-2 text-gray-800 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>
                    {property.views || Math.floor(Math.random() * 500) + 50}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span>
                    {property.rating || (4.0 + Math.random()).toFixed(1)}
                  </span>
                </div>
              </div>
              {property.last_updated && (
                <span className="text-xs text-gray-600">
                  Updated {new Date(property.last_updated).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 relative z-10">
        {/* Header Row: Location and Price */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center text-xs text-gray-500 flex-1 min-w-0">
            <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {property.address || property.city || "Location not specified"}
            </span>
          </div>
          <div className="ml-2 text-right">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(property.price)}
            </span>
            {property.type === "rent" && (
              <span className="text-gray-500 text-xs">/mo</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
          {property.title}
        </h3>

        {/* Property Details - Compact Row */}
        <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 text-gray-600">
            <Bed className="h-3 w-3" />
            <span className="text-xs font-medium">
              {property.bedrooms || property.beds || 0}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Bath className="h-3 w-3" />
            <span className="text-xs font-medium">
              {property.bathrooms || property.baths || 0}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Square className="h-3 w-3" />
            <span className="text-xs font-medium">
              {property.area || property.sqft || 0}
            </span>
          </div>
        </div>

        {/* Additional Property Info Row */}
        <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{getPropertyAge()}</span>
          </div>
          {property.furnishing_status && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {property.furnishing_status}
            </span>
          )}
          {property.floor && (
            <span className="text-xs">
              Floor {property.floor}
            </span>
          )}
        </div>

        {/* Amenities Row */}
        {getTopAmenities().length > 0 && (
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            {getTopAmenities().map((amenity, index) => {
              const IconComponent = amenity.icon;
              return (
                <div key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                  <IconComponent className="h-3 w-3" />
                  <span className="text-xs font-medium capitalize">
                    {amenity.name.replace(/_/g, ' ').substring(0, 8)}
                  </span>
                </div>
              );
            })}
            {property.amenities && property.amenities.length > 3 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Property Type and Status Badges */}
        <div className="flex gap-1 mb-2">
          <span
            className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
              property.type === "rent"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {property.type === "rent" ? "Rent" : "Sale"}
          </span>
          <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full capitalize">
            {property.property_type || "Property"}
          </span>
          {property.possession_status && (
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
              {property.possession_status}
            </span>
          )}
        </div>

        {/* Action Button - Compact */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/property/${property.id}`);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
        >
          View Details
        </button>
      </div>

      {/* Animated Border */}
      <div
        className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{ padding: "2px" }}
      >
        <div className="w-full h-full bg-white rounded-xl"></div>
      </div>
    </div>
  );
};

export default PropertyCard;
