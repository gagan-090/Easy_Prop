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
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-3 hover:scale-[1.02] max-w-sm mx-auto ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Image Container with Cursor Following Effect */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
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
        <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 text-white">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>
                    {property.views || Math.floor(Math.random() * 500) + 50}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>
                    {property.rating || (4.0 + Math.random()).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 relative z-10">
        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
          <span className="truncate">
            {property.address || property.city || "Location not specified"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {property.title}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {formatPrice(property.price)}
          </span>
          {property.type === "rent" && (
            <span className="text-gray-500 text-sm ml-1">/month</span>
          )}
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-1 text-gray-600">
            <Bed className="h-4 w-4" />
            <span className="text-sm font-medium">
              {property.bedrooms || property.beds || 0}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Bath className="h-4 w-4" />
            <span className="text-sm font-medium">
              {property.bathrooms || property.baths || 0}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Square className="h-4 w-4" />
            <span className="text-sm font-medium">
              {property.area || property.sqft || 0} sq ft
            </span>
          </div>
        </div>

        {/* Property Type Badge */}
        <div className="flex gap-2 mb-4">
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
              property.type === "rent"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {property.type === "rent" ? "For Rent" : "For Sale"}
          </span>
          <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {property.property_type || "Property"}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/property/${property.id}`);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          View Details
        </button>
      </div>

      {/* Animated Border */}
      <div
        className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{ padding: "2px" }}
      >
        <div className="w-full h-full bg-white rounded-2xl"></div>
      </div>
    </div>
  );
};

export default PropertyCard;
