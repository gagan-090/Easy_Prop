import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Facebook, Twitter, Linkedin, Mail, MessageCircle, QrCode, Download, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const PropertyShare = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // Mock property data - in real app, fetch from API
  const property = {
    id: id || '1',
    title: 'Luxury Sea-View Villa in Bandra',
    price: 25000000,
    location: 'Bandra West, Mumbai',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&crop=center',
    beds: 4,
    baths: 3,
    sqft: 2200,
    description: 'Stunning luxury villa with panoramic sea views, modern amenities, and prime location in Bandra West.'
  };

  const propertyUrl = `${window.location.origin}/property/${id}`;
  
  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareData = {
    title: property.title,
    text: `Check out this amazing property: ${property.title} - ${formatPrice(property.price)} in ${property.location}`,
    url: propertyUrl
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}&quote=${encodeURIComponent(shareData.text)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(propertyUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${propertyUrl}`)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(`${shareData.text}\n\n${propertyUrl}`)}`
    }
  ];

  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform.name);
    window.open(platform.url, '_blank', 'width=600,height=400');
    setTimeout(() => setSelectedPlatform(null), 1000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const generateQRCode = () => {
    // In a real app, you'd use a QR code library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(propertyUrl)}`;
    return qrUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link 
            to={`/property/${id}`}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Property</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Property Preview */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Share Property</h1>
                <p className="text-slate-600">Share this amazing property with others</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{property.title}</h2>
                <p className="text-slate-600 mb-4">{property.location}</p>
                <div className="text-2xl font-bold text-blue-600 mb-4">{formatPrice(property.price)}</div>
                
                <div className="flex space-x-6 text-sm text-slate-600 mb-4">
                  <span>{property.beds} Beds</span>
                  <span>{property.baths} Baths</span>
                  <span>{property.sqft.toLocaleString()} Sq Ft</span>
                </div>
                
                <p className="text-slate-600 text-sm">{property.description}</p>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="p-8">
            {/* Copy Link */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Copy Link</h3>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="text-sm text-slate-600 break-all">{propertyUrl}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Social Media Platforms */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Share on Social Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {socialPlatforms.map((platform) => (
                  <motion.button
                    key={platform.name}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlatformClick(platform)}
                    className={`${platform.color} text-white p-4 rounded-xl transition-all duration-300 flex flex-col items-center space-y-2 shadow-lg hover:shadow-xl ${
                      selectedPlatform === platform.name ? 'ring-4 ring-blue-300' : ''
                    }`}
                  >
                    <platform.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">QR Code</h3>
              <div className="flex items-center justify-center md:justify-start">
                <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-lg">
                  <img
                    src={generateQRCode()}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                  <div className="text-center mt-4">
                    <p className="text-sm text-slate-600 mb-3">Scan to view property</p>
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm mx-auto">
                      <Download className="h-4 w-4" />
                      <span>Download QR Code</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Native Share (Mobile) */}
            {navigator.share && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Share</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNativeShare}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share via Device</span>
                </motion.button>
              </div>
            )}

            {/* Share Statistics */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Impact</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-slate-600">Total Shares</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-slate-600">Views Generated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-slate-600">Inquiries</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to={`/property/${id}`}
            className="bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-400 font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-center"
          >
            View Property Details
          </Link>
          <Link
            to={`/schedule-tour/${id}`}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
          >
            Schedule a Tour
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyShare;