import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updateProperty, addRevenue } from "../services/supabaseService";
import { createPortal } from "react-dom";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Eye,
  Share2,
  Calendar,
  Star,
  Home,
  User,
  Edit,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

const PropertyCard = ({ property, showStats = false, onFavorite, onDelete, isOwner = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const [dropdownCoords, setDropdownCoords] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Debug logging
  console.log('PropertyCard rendered:', {
    propertyId: property.id,
    propertyTitle: property.title,
    isOwner: isOwner,
    userId: property.user_id
  });

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const getPropertyTypeDisplayName = (type) => {
    const types = {
      apartment: "Apartment",
      villa: "Villa",
      house: "House",
      office: "Office Space",
      shop: "Shop",
      land: "Land/Plot",
    };
    return types[type] || "Property";
  };

  const getListingTypeDisplayName = (type) => {
    return type === "rent"
      ? "For Rent"
      : type === "sale"
      ? "For Sale"
      : "Property";
  };

  const getListingTypeBadgeColor = (type) => {
    return type === "rent"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
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
    navigate(`/property-share/${property.id}`);
  };

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/property/${property.id}`);
  };

  const handleVirtualTour = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/virtual-tour/${property.id}`);
  };

  const handleAgentContact = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/agent-contact/${property.agent?.id || "1"}/${property.id}`);
  };

  const handleEditProperty = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit property clicked for:', property.id);
    navigate(`/dashboard/edit-property/${property.id}`);
    setShowDropdown(false);
  };

  const handleViewProperty = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('View property clicked for:', property.id);
    navigate(`/property/${property.id}`);
    setShowDropdown(false);
  };

  const handleShareProperty = async (e) => {
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
        console.log('Error sharing:', error);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
    setShowDropdown(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a toast notification here
      alert('Property link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDeleteProperty = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        if (onDelete) {
          await onDelete(property.id, property.type);
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
      } finally {
        setIsDeleting(false);
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const handleMarkAsSold = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 PropertyCard: Marking property as sold:', property);
    console.log('🔍 PropertyCard: Property user_id:', property.user_id);
    console.log('🔍 PropertyCard: Current user uid:', user?.uid);
    
    if (window.confirm('Are you sure you want to mark this property as sold? This will update the revenue tracking.')) {
      try {
        // Update property status to sold
        const result = await updateProperty(property.id, { status: 'sold' });
        
        if (result.success) {
          // Add revenue entry for the sold property
          await addRevenue(user.uid, {
            property_id: property.id,
            amount: property.price,
            type: 'commission',
            description: `Property sold: ${property.title}`
          });
          
          alert('Property marked as sold successfully! Revenue has been updated.');
          // Trigger a global refresh to update dashboard stats
          console.log('🎯 PropertyCard: Dispatching propertySold event for property:', property.id, 'amount:', property.price);
          window.dispatchEvent(new CustomEvent('propertySold', { 
            detail: { propertyId: property.id, amount: property.price } 
          }));
          // Give a small delay for the event to be processed, then reload
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          alert('Failed to mark property as sold. Please try again.');
        }
      } catch (error) {
        console.error('Error marking property as sold:', error);
        alert('Failed to mark property as sold. Please try again.');
      } finally {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Dropdown toggle clicked, current state:', showDropdown);
    
    if (!showDropdown) {
      // Calculate dropdown position when opening
      const button = e.currentTarget;
      const card = button.closest('.property-card-enhanced');
      const cardRect = card.getBoundingClientRect();
      const dropdownHeight = 200; // Approximate dropdown height
      
      // Position relative to the button but ensure it's above the card
      const buttonRect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let x = buttonRect.right - 160; // Position relative to button
      let y = buttonRect.top - dropdownHeight - 10; // Always above the button
      
      // Ensure dropdown stays within viewport bounds
      if (x < 10) {
        x = 10; // Minimum distance from left edge
      }
      if (x + 160 > viewportWidth) {
        x = viewportWidth - 170; // Keep dropdown within right edge
      }
      if (y < 10) {
        y = 10; // Minimum distance from top of viewport
      }
      
      console.log('Dropdown positioning:', {
        buttonTop: buttonRect.top,
        buttonRight: buttonRect.right,
        cardTop: cardRect.top,
        cardRight: cardRect.right,
        dropdownHeight,
        calculatedY: y,
        calculatedX: x,
        viewportHeight: window.innerHeight
      });
      
      setDropdownCoords({ x, y });
      setDropdownPosition('top'); // Always use top positioning
    }
    
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if dropdown is open and click is not on dropdown content or button
      if (showDropdown && 
          !event.target.closest('.dropdown-container') && 
          !event.target.closest('.dropdown-button') &&
          !event.target.closest('[data-dropdown]')) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
      }
    };

    // Prevent hover events from affecting dropdown when it's open
    const handleMouseEnter = (event) => {
      if (showDropdown && !event.target.closest('[data-dropdown]')) {
        // Don't close dropdown on hover events
        event.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [showDropdown]);

  // Cleanup dropdown on unmount
  useEffect(() => {
    return () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };
  }, []);

  // Realistic property images based on type
  const getPropertyImage = () => {
    // Check if the image is a blob URL (temporary) and skip it
    const isValidImage = (url) => {
      if (!url) return false;
      if (url.startsWith("blob:")) return false; // Skip blob URLs
      if (url === "/api/placeholder/400/300") return false;
      // Allow Supabase Storage URLs
      if (url.includes("supabase.co") || url.includes("storage.googleapis.com"))
        return true;
      // Allow other valid URLs
      return url.startsWith("http://") || url.startsWith("https://");
    };

    // Handle both single image and images array
    if (property.images && property.images.length > 0) {
      const firstImage = property.images[0];
      if (isValidImage(firstImage)) {
        return firstImage;
      }
    }

    if (property.image && isValidImage(property.image)) {
      return property.image;
    }

    // Return a fallback image based on property category
    const imageMap = {
      villa:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center",
      apartment:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=center",
      house:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center",
      office:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center",
      shop: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center",
      land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&crop=center",
    };

    return imageMap[property.property_type] || imageMap.apartment;
  };

  const handleImageError = (e) => {
    setImageError(true);
    setImageLoaded(true);
    e.target.style.display = "none";
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  return (
    <div
      className={`property-card-enhanced group fade-in cursor-pointer transition-all duration-300 ${
        showDropdown ? 'z-[999997]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        {/* Image with loading state */}
        <div className="relative">
          {!imageLoaded && (
            <div className="property-image-enhanced shimmer-loading" />
          )}
          {!imageError && (
            <img
              src={getPropertyImage()}
              alt={property.title}
              className={`property-image-enhanced group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
          {/* Fallback when image fails to load */}
          {imageError && (
            <div className="property-image-enhanced bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-center">
                <Home className="h-16 w-16 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-600 font-medium text-sm">
                  {getPropertyTypeDisplayName(property.property_type)}
                </p>
              </div>
            </div>
          )}
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
            {!isOwner && (
              <button
                onClick={handleFavoriteClick}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 interactive-button"
              >
                <Heart
                  className={`h-5 w-5 transition-colors duration-300 ${
                    property.isFavorite
                      ? "text-red-500 fill-current"
                      : "text-slate-600"
                  }`}
                />
              </button>
            )}

            {/* Owner Actions or Regular Share */}
            {isOwner ? (
              <div className="relative dropdown-container">
                <button
                  ref={buttonRef}
                  onClick={handleDropdownToggle}
                  className={`w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 interactive-button dropdown-button ${
                    showDropdown ? 'ring-2 ring-blue-500 scale-110' : ''
                  }`}
                >
                  <MoreVertical className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
                    showDropdown ? 'rotate-90' : ''
                  }`} />
                </button>
                
                {/* Full-screen blur overlay */}
                {showDropdown && createPortal(
                  <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999998] transition-all duration-300 animate-in fade-in"
                    onClick={() => setShowDropdown(false)}
                  />
                , document.body)}
                
                {/* Portal-based dropdown */}
                {showDropdown && createPortal(
                  <div 
                    data-dropdown
                    className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-[160px] z-[999999] transform transition-all duration-200"
                    style={{
                      left: `${dropdownCoords.x}px`,
                      top: `${dropdownCoords.y}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Dropdown arrow - pointing down since dropdown is above the card */}
                    <div className="absolute right-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white shadow-sm"></div>
                    <button
                      onClick={handleViewProperty}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={handleEditProperty}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleShareProperty}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                    <hr className="my-1" />
                                                <button
                              onClick={handleMarkAsSold}
                              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Mark as Sold</span>
                            </button>
                            <button
                              onClick={handleDeleteProperty}
                              disabled={isDeleting}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                            </button>
                  </div>,
                  document.body
                )}
              </div>
            ) : (
              <button
                onClick={handleShareClick}
                className={`w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 interactive-button ${
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <Share2 className="h-4 w-4 text-slate-600" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom overlay info */}
        <div
          className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="glass-effect rounded-xl p-3 text-white">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>
                    {property.views || Math.floor(Math.random() * 500) + 50}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>
                    {property.rating || (4.0 + Math.random()).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>
                  Listed{" "}
                  {property.daysAgo || Math.floor(Math.random() * 30) + 1} days
                  ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Location with icon */}
        <div className="flex items-center text-sm text-slate-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 text-slate-400" />
          {property.location ||
            (property.address && property.city
              ? `${property.address}, ${property.city}`
              : property.address || property.city || "Location not specified")}
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
              (₹{Math.floor(property.price / property.sqft).toLocaleString()}
              /sqft)
            </span>
          )}
        </div>

        {/* Property Details */}
        {property.property_type !== "land" && (
          <div className="property-stats mb-6 bg-slate-50 rounded-xl p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              {property.beds > 0 && (
                <div className="flex flex-col items-center">
                  <Bed className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-sm font-medium text-slate-900">
                    {property.beds}
                  </span>
                  <span className="text-xs text-slate-500">Beds</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <Bath className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-sm font-medium text-slate-900">
                  {property.baths}
                </span>
                <span className="text-xs text-slate-500">Baths</span>
              </div>
              <div className="flex flex-col items-center">
                <Square className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-sm font-medium text-slate-900">
                  {property.sqft?.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">Sqft</span>
              </div>
            </div>
          </div>
        )}

        {/* Property Type and Listing Type Badges */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${getListingTypeBadgeColor(
              property.type
            )}`}
          >
            {getListingTypeDisplayName(property.type)}
          </span>
          <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
            {getPropertyTypeDisplayName(property.property_type)}
          </span>
        </div>

        {/* Main Action Icons */}
        {isOwner ? (
          <div className="flex justify-center space-x-6 mb-4">
            <button
              onClick={handleViewProperty}
              className="flex flex-col items-center space-y-1 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group"
              title="View Property"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Eye className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">View</span>
            </button>
            
            <button
              onClick={handleEditProperty}
              className="flex flex-col items-center space-y-1 p-3 rounded-xl bg-slate-50 hover:bg-green-50 hover:text-green-600 transition-all duration-300 group"
              title="Edit Property"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Edit className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Edit</span>
            </button>
            
            <button
              onClick={handleShareProperty}
              className="flex flex-col items-center space-y-1 p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 group"
              title="Share Property"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Share2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Share</span>
            </button>
          </div>
        ) : (
          <div className="flex space-x-3 mb-4">
            <button
              className="flex-1 text-center btn-primary text-sm interactive-button hover-glow"
              onClick={handleViewDetails}
            >
              View Details
            </button>
            <button
              onClick={handleVirtualTour}
              className="px-4 py-2 border-2 border-slate-200 text-slate-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300 text-sm font-medium text-center"
            >
              Quick Tour
            </button>
          </div>
        )}

        {/* Agent info (if available) */}
        {property.agent && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-3">
              <img
                src={
                  property.agent.image ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                }
                alt={property.agent.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <User
                className="h-5 w-5 text-slate-400"
                style={{ display: "none" }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">
                  {property.agent.name}
                </div>
                <div className="text-xs text-slate-500">Licensed Agent</div>
              </div>
              <button
                onClick={handleAgentContact}
                className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors"
              >
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
