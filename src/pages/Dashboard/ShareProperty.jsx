import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProperty } from '../../services/supabaseService';
import {
  ArrowLeft,
  Share2,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  QrCode,
  Download,
  Link,
  Check,
  AlertCircle,
  Eye,
  MapPin,
  Star,
  Calendar,
  Home
} from 'lucide-react';

const ShareProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    loadProperty();
  }, [propertyId, user]);

  const loadProperty = async () => {
    if (!user?.uid || !propertyId) return;
    
    setLoading(true);
    try {
      const result = await getUserProperty(user.uid, propertyId);
      if (result.success) {
        setProperty(result.data);
        const url = `${window.location.origin}/property/${propertyId}`;
        setShareUrl(url);
        // Generate QR code URL (you can use a service like QR Server)
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`);
      } else {
        setError(result.error || 'Failed to load property');
      }
    } catch (error) {
      console.error('Error loading property:', error);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const getPropertyImage = () => {
    if (property?.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property?.image) {
      return property.image;
    }
    
    // Fallback images based on property type
    const imageMap = {
      villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&crop=center',
      apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=center',
      commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center',
      land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&crop=center'
    };
    
    return imageMap[property?.type] || imageMap.apartment;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async (platform) => {
    const title = property.title;
    const text = `Check out this amazing property: ${property.title}`;
    const url = shareUrl;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: text,
              url: url,
            });
          } catch (error) {
            console.log('Error sharing:', error);
          }
        } else {
          copyToClipboard(url);
        }
        break;
      default:
        copyToClipboard(url);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `property-${propertyId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleShare('whatsapp')
    },
    {
      name: 'Telegram',
      icon: MessageCircle,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleShare('telegram')
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleShare('facebook')
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => handleShare('twitter')
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => handleShare('linkedin')
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => handleShare('email')
    },
    {
      name: 'SMS',
      icon: MessageSquare,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => handleShare('sms')
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => copyToClipboard(shareUrl)
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Property Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || 'The property you are looking for does not exist.'}
        </p>
        <button
          onClick={() => navigate('/dashboard/my-properties')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to My Properties
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/my-properties')}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Share Property
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share this property with potential buyers
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Property Preview
          </h2>
          
          <div className="space-y-4">
            <img
              src={getPropertyImage()}
              alt={property.title}
              className="w-full h-48 object-cover rounded-xl"
            />
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {property.title}
              </h3>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{property.address && property.city ? `${property.address}, ${property.city}` : property.address || property.city || 'Location not specified'}</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Listed {property.daysAgo || Math.floor(Math.random() * 30) + 1} days ago</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                    <span>{property.rating || (4.0 + Math.random()).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(property.price)}
              </div>
            </div>
          </div>
        </div>

        {/* Sharing Options */}
        <div className="space-y-6">
          {/* Quick Share */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Share
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {shareOptions.map((option, index) => (
                <motion.button
                  key={option.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={option.action}
                  className={`${option.color} text-white p-4 rounded-xl flex flex-col items-center space-y-2 transition-all duration-200`}
                >
                  <option.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Share Link
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(shareUrl)}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Link copied to clipboard</span>
                <span>{shareUrl.length} characters</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              QR Code
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-32 h-32 border border-gray-200 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              <div className="flex justify-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadQRCode}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(shareUrl)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Share Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {property.views || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {property.inquiries || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Inquiries</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {Math.floor((property.views || 0) * 0.15)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Shares</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {Math.floor((property.views || 0) * 0.08)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Clicks</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Sharing Tips
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share on social media platforms to reach a wider audience
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use WhatsApp and Telegram for direct sharing with potential buyers
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download the QR code for easy sharing in print materials
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Include property highlights when sharing on professional networks
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track sharing analytics to understand which platforms work best
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use email sharing for formal communications with clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShareProperty; 