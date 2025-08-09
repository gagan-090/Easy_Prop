import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Square, Heart, Share2, Calendar, 
  Eye, Star, Phone, Mail, User, ChevronLeft, ChevronRight,
  Car, Wifi, Dumbbell, Waves, Shield, TreePine, Building,
  Camera, Video, ArrowLeft, Send, MessageSquare, CheckCircle,
  Play, Download, Bookmark, TrendingUp, Award, Clock,
  Home, Zap, Coffee, Utensils, Tv, Wind, Sun, Moon,
  Calculator, Navigation, Maximize2, X, Info,
  ThumbsUp, MessageCircle, Share, ExternalLink, Globe,
  Smartphone, Tablet, Monitor, Headphones, Volume2,
  Sparkles, Target, Compass, Layers, Palette, Lightbulb,
  Image, Settings, Search, Filter, SortAsc, AlertCircle,
  FileText, CreditCard, Users, BarChart3, PieChart,
  Briefcase, GraduationCap, ShoppingBag, Hospital, Train,
  Bus, ShoppingCart, Gamepad2, Music, Film, Book,
  DollarSign, Percent, Activity, LineChart,
  Archive, Lock, Unlock, Key, Pause, RotateCcw, XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getPropertyById, 
  addPropertyView, 
  addLead, 
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getSimilarProperties,
  getNearbyProperties,
  getPropertyViews,
  getPropertyAnalytics,
  getUserProfile,
  scheduleTour
} from '../services/supabaseService';
import Loading from '../components/Loading';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Core property state
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyOwner, setPropertyOwner] = useState(null);
  
  // UI state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Interactive features
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [propertyViews, setPropertyViews] = useState([]);
  const [viewGrowth, setViewGrowth] = useState(0);
  
  // Modals and overlays
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [showNearbyMap, setShowNearbyMap] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Contact form
  const [messageForm, setMessageForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more details.'
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  // Schedule visit form
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    visitType: 'physical', // physical, virtual
    message: ''
  });
  const [schedulingVisit, setSchedulingVisit] = useState(false);
  const [visitScheduled, setVisitScheduled] = useState(false);
  
  // Dynamic content
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [propertyAnalytics, setPropertyAnalytics] = useState(null);
  const [marketTrends, setMarketTrends] = useState({
    priceGrowth: 12.5,
    demandLevel: "high",
    averagePrice: 0,
    totalListings: 0,
    pricePerSqft: 0,
    appreciation: 8.2
  });
  
  // Mortgage calculator
  const [mortgageData, setMortgageData] = useState({
    loanAmount: 0,
    interestRate: 8.5,
    loanTerm: 20,
    downPayment: 0,
    monthlyIncome: 0
  });
  const [mortgageResult, setMortgageResult] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  
  // Enhanced UI state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [propertyScore, setPropertyScore] = useState(8.5);
  const [priceHistory, setPriceHistory] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState({
    schools: [],
    hospitals: [],
    markets: [],
    transport: [],
    entertainment: []
  });
  
  // Reviews and testimonials
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(4.5);
  
  // Documents and legal
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [documentAccess, setDocumentAccess] = useState(false);
  
  // Social sharing
  const [shareUrl, setShareUrl] = useState('');
  const [shareData, setShareData] = useState({});
  
  // Virtual tour state
  const [currentRoom, setCurrentRoom] = useState(0);
  const virtualTourRooms = [
    { id: 0, name: 'Living Room' },
    { id: 1, name: 'Kitchen' },
    { id: 2, name: 'Master Bedroom' },
    { id: 3, name: 'Bathroom' }
  ];
  
  // Refs for animations
  const galleryRef = useRef(null);
  const parallaxRef = useRef(null);
  const mapRef = useRef(null);
  const metricsRef = useRef(null);

  // Enhanced animations and interactions
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Trigger entrance animations
    setTimeout(() => setAnimationTrigger(true), 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Auto-advance image gallery
  useEffect(() => {
    if (property?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => 
          prev === property.images.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [property?.images]);

  // Fetch main property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch property details
        const propertyResult = await getPropertyById(id);
        if (!propertyResult.success) {
          setError(propertyResult.error);
          return;
        }
        
        setProperty(propertyResult.data);
        
        // Set share data
        setShareUrl(window.location.href);
        setShareData({
          title: propertyResult.data.title,
          description: propertyResult.data.description,
          image: propertyResult.data.images?.[0],
          url: window.location.href
        });
        
        // Set initial mortgage calculation values
        if (propertyResult.data.price) {
          setMortgageData(prev => ({
            ...prev,
            loanAmount: propertyResult.data.price * 0.8,
            downPayment: propertyResult.data.price * 0.2
          }));
        }
        
        // Fetch property owner details
        if (propertyResult.data.user_id) {
          const ownerResult = await getUserProfile(propertyResult.data.user_id);
          if (ownerResult.success) {
            setPropertyOwner(ownerResult.data);
          }
        }
        
        // Track property view and get analytics
        const viewResult = await addPropertyView(id, user?.uid);
        if (viewResult.success) {
          console.log('✅ Property view tracked successfully');
        }
        
        // Fetch property views and analytics
        const viewsResult = await getPropertyViews(id);
        if (viewsResult.success) {
          setViewCount(viewsResult.data.total_views || 0);
          setPropertyViews(viewsResult.data.recent_views || []);
          
          // Calculate view growth
          const thisWeekViews = viewsResult.data.this_week_views || 0;
          const lastWeekViews = viewsResult.data.last_week_views || 1;
          const growth = ((thisWeekViews - lastWeekViews) / lastWeekViews) * 100;
          setViewGrowth(Math.round(growth * 10) / 10);
        }
        
        // Fetch similar properties
        const similarResult = await getSimilarProperties(id, 4);
        if (similarResult.success) {
          setSimilarProperties(similarResult.data);
        }
        
        // Fetch nearby properties
        setLoadingNearby(true);
        const nearbyResult = await getNearbyProperties(propertyResult.data, 6);
        if (nearbyResult.success) {
          setNearbyProperties(nearbyResult.data);
          
          // Calculate market trends from nearby properties
          if (nearbyResult.data.length > 0) {
            const avgPrice = nearbyResult.data.reduce((sum, prop) => sum + prop.price, 0) / nearbyResult.data.length;
            const avgPricePerSqft = nearbyResult.data.reduce((sum, prop) => 
              sum + (prop.area ? prop.price / prop.area : 0), 0) / nearbyResult.data.length;
            
            setMarketTrends(prev => ({
              ...prev,
              averagePrice: avgPrice,
              totalListings: nearbyResult.data.length,
              pricePerSqft: Math.round(avgPricePerSqft)
            }));
          }
        }
        setLoadingNearby(false);
        
        // Fetch property analytics
        const analyticsResult = await getPropertyAnalytics(id);
        if (analyticsResult.success) {
          setPropertyAnalytics(analyticsResult.data);
          setPriceHistory(analyticsResult.data.price_history || []);
          
          // Only update market trends if data exists
          if (analyticsResult.data.market_trends) {
            setMarketTrends(prev => ({
              ...prev,
              ...analyticsResult.data.market_trends
            }));
          }
        }
        
        // Check if property is in user's favorites
        if (user) {
          const favoritesResult = await getUserFavorites(user.uid);
          if (favoritesResult.success) {
            const isFav = favoritesResult.data.some(fav => fav.property_id === id);
            setIsFavorite(isFav);
          }
        }
        
        // Mock nearby places data (in real app, fetch from Google Places API)
        setNearbyPlaces({
          schools: [
            { name: 'Delhi Public School', distance: '0.8 km', rating: 4.5, type: 'school' },
            { name: 'Ryan International', distance: '1.2 km', rating: 4.3, type: 'school' },
            { name: 'Kendriya Vidyalaya', distance: '2.1 km', rating: 4.4, type: 'school' }
          ],
          hospitals: [
            { name: 'Apollo Hospital', distance: '1.5 km', rating: 4.6, type: 'hospital' },
            { name: 'Max Healthcare', distance: '2.3 km', rating: 4.4, type: 'hospital' }
          ],
          markets: [
            { name: 'City Mall', distance: '0.5 km', rating: 4.2, type: 'mall' },
            { name: 'Local Market', distance: '0.3 km', rating: 4.0, type: 'market' }
          ],
          transport: [
            { name: 'Metro Station', distance: '0.7 km', rating: 4.1, type: 'metro' },
            { name: 'Bus Stop', distance: '0.2 km', rating: 3.9, type: 'bus' }
          ],
          entertainment: [
            { name: 'PVR Cinemas', distance: '1.1 km', rating: 4.3, type: 'cinema' },
            { name: 'Sports Complex', distance: '1.8 km', rating: 4.2, type: 'sports' }
          ]
        });
        
        // Mock reviews data
        setReviews([
          {
            id: 1,
            user: 'Rajesh Kumar',
            rating: 5,
            comment: 'Excellent property with great amenities. The location is perfect for families.',
            date: '2024-01-15',
            verified: true
          },
          {
            id: 2,
            user: 'Priya Sharma',
            rating: 4,
            comment: 'Good value for money. The builder has maintained quality standards.',
            date: '2024-01-10',
            verified: true
          }
        ]);
        
        // Mock available documents
        setAvailableDocuments([
          { name: 'Floor Plan', type: 'pdf', size: '2.3 MB', protected: false },
          { name: 'Property Brochure', type: 'pdf', size: '5.1 MB', protected: false },
          { name: 'Sale Deed', type: 'pdf', size: '1.8 MB', protected: true },
          { name: 'Property Tax Receipt', type: 'pdf', size: '0.9 MB', protected: true },
          { name: 'NOC Certificate', type: 'pdf', size: '1.2 MB', protected: true }
        ]);
        
      } catch (error) {
        console.error('Error fetching property data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [id, user]);

  // Helper functions
  const formatPrice = (price) => {
    if (!price) return "N/A";
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toLocaleString('en-IN');
  };

  const nextImage = () => {
    if (!property?.images?.length) return;
    setCurrentImageIndex(prev => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!property?.images?.length) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  // Share functionality
  const handleShare = async (platform = 'native') => {
    const shareData = {
      title: property.title,
      text: `Check out this amazing property: ${property.title}`,
      url: window.location.href,
    };

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
      alert('Link copied to clipboard!');
    }
  };

  const handleSocialShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(property.title);
    const description = encodeURIComponent(property.description?.substring(0, 100) + '...');
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      email: `mailto:?subject=${title}&body=${description}%20${url}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Contact form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessageForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to send a message');
      return;
    }

    if (!messageForm.name || !messageForm.email || !messageForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    setSendingMessage(true);
    try {
      const leadData = {
        name: messageForm.name,
        email: messageForm.email,
        phone: messageForm.phone || '',
        message: messageForm.message,
        property_id: property.id,
        source: 'property_details_page',
        priority: 'medium',
        status: 'new',
        location: property.address,
        requirements: `Interested in: ${property.title} - ${property.address}`,
        user_id: user.uid
      };

      const result = await addLead(property.user_id, leadData);
      
      if (result.success) {
        setMessageSent(true);
        setMessageForm({
          name: user?.displayName || '',
          email: user?.email || '',
          phone: '',
          message: 'I am interested in this property. Please contact me with more details.'
        });
        
        // Show success message with dashboard link for property owners
        if (isPropertyOwner) {
          alert('Message sent successfully! Check your dashboard for new leads.');
        } else {
          alert('Message sent successfully! The agent will contact you soon.');
        }
        
        setTimeout(() => {
          setMessageSent(false);
          setShowContactModal(false);
        }, 3000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Schedule visit handlers
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to schedule a visit');
      return;
    }

    if (!scheduleForm.date || !scheduleForm.time) {
      alert('Please select date and time');
      return;
    }

    setSchedulingVisit(true);
    try {
      const tourData = {
        property_id: property.id,
        property_owner_id: property.user_id || property.owner_id,
        visitor_name: user.displayName || messageForm.name,
        visitor_email: user.email || messageForm.email,
        visitor_phone: messageForm.phone,
        tour_date: scheduleForm.date,
        tour_time: scheduleForm.time,
        tour_type: scheduleForm.visitType,
        visitor_message: scheduleForm.message,
        status: 'pending',
        property_title: property.title,
        property_address: property.address
      };

      const result = await scheduleTour(tourData);
      
      if (result.success) {
        setVisitScheduled(true);
        
        // Show success message with dashboard link for property owners
        if (isPropertyOwner) {
          alert('Visit scheduled successfully! Check your dashboard for new tour requests.');
        } else {
          alert('Visit scheduled successfully! The agent will confirm your appointment.');
        }
        
        setTimeout(() => {
          setVisitScheduled(false);
          setShowScheduleModal(false);
        }, 3000);
      } else {
        alert('Failed to schedule visit. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling visit:', error);
      alert('Failed to schedule visit. Please try again.');
    } finally {
      setSchedulingVisit(false);
    }
  };

  // Mortgage calculator
  const calculateMortgage = () => {
    const { loanAmount, interestRate, loanTerm } = mortgageData;
    
    if (!loanAmount || !interestRate || !loanTerm) {
      alert('Please fill in all mortgage details');
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;
    
    setMortgageResult({
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest)
    });

    // Calculate eligibility
    if (mortgageData.monthlyIncome > 0) {
      const emi = monthlyPayment;
      const maxEMI = mortgageData.monthlyIncome * 0.5; // 50% of income
      const eligible = emi <= maxEMI;
      
      setEligibilityResult({
        eligible,
        maxEMI: Math.round(maxEMI),
        currentEMI: Math.round(emi),
        utilizationRatio: Math.round((emi / mortgageData.monthlyIncome) * 100)
      });
    }
  };

  // Favorite handlers
  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please login to save properties');
      return;
    }

    try {
      if (isFavorite) {
        const result = await removeFromFavorites(user.uid, property.id);
        if (result.success) {
          setIsFavorite(false);
        }
      } else {
        const result = await addToFavorites(user.uid, property.id);
        if (result.success) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Set document title for SEO
  useEffect(() => {
    if (property) {
      document.title = `${property.title} | Premium Real Estate`;
      
      // Set meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', property.description?.substring(0, 160) || '');
      }
    }
  }, [property]);

  // Check if current user is the property owner
  const isPropertyOwner = user && property && user.uid === property.user_id;

  // Loading and error states
  if (loading) {
    return <Loading message="Loading property details..." fullScreen />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Property Not Found
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
            The property you are looking for might have been removed or the link is incorrect.
          </p>
          <Link 
            to="/properties" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>

      {/* Enhanced CSS Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -30px, 0); }
          70% { transform: translate3d(0, -15px, 0); }
          90% { transform: translate3d(0, -4px, 0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); }
          100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .slide-in-up {
          animation: slideInUp 0.8s ease-out forwards;
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        
        .bounce-in {
          animation: bounce 1s ease-out forwards;
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        .glow-effect {
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .gradient-border {
          background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
          background-size: 400% 400%;
          animation: gradientShift 4s ease infinite;
        }
        
        .stagger-children > * {
          opacity: 0;
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
        .stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
        .stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
        .stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
        .stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
        .stagger-children > *:nth-child(6) { animation-delay: 0.6s; }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .neumorphism {
          background: #f0f0f0;
          box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
        }
        
        .neumorphism-inset {
          background: #f0f0f0;
          box-shadow: inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff;
        }
        
        .interactive-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .interactive-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .interactive-button:active {
          transform: translateY(0);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
        }
        
        .property-details-gallery {
          position: relative;
          overflow: hidden;
        }
        
        .property-details-gallery::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
          z-index: 1;
        }
        
        .property-details-gallery:hover::before {
          left: 100%;
        }
        
        .price-tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: pulse 2s infinite;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .parallax-element {
          transform: translateZ(0);
          will-change: transform;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .neon-glow {
          text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
        }
        
        .morphing-card {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        
        .morphing-card:hover {
          transform: rotateY(5deg) rotateX(5deg);
        }
        
        .elastic-bounce {
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .elastic-bounce:hover {
          transform: scale(1.1);
        }
        
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .ripple-effect:active::after {
          width: 300px;
          height: 300px;
        }
        
        .premium-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
        }
        
        .luxury-shadow {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
        }
        
        .premium-border {
          border: 2px solid;
          border-image: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c) 1;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>     
   {/* Premium Sticky Navigation */}
        <div className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'glass-morphism shadow-2xl border-b border-white/20' 
            : 'bg-white/80 backdrop-blur-sm shadow-lg'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/properties" 
                className="group flex items-center space-x-3 text-slate-600 hover:text-slate-900 transition-all duration-300 interactive-button px-4 py-2 rounded-xl hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-semibold">Back to Properties</span>
              </Link>
              
              {/* Property Quick Info - Shows on scroll */}
              <div className={`hidden lg:flex items-center space-x-8 transition-all duration-500 ${
                isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient font-poppins">{formatPrice(property?.price)}</div>
                  <div className="text-xs text-slate-500 font-medium">Price</div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{property?.bedrooms}BR</div>
                  <div className="text-xs text-slate-500">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{formatNumber(property?.area)}</div>
                  <div className="text-xs text-slate-500">Sq Ft</div>
                </div>
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">{formatNumber(viewCount)}</span>
                  <span className="text-xs text-green-600">views</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Premium Action Buttons */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:shadow-lg hover:scale-105 interactive-button font-semibold"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Book Tour</span>
                  </button>
                  
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:shadow-lg hover:scale-105 interactive-button font-semibold"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Contact</span>
                  </button>
                </div>
                
                {/* Owner Dashboard Button */}
                {isPropertyOwner && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:shadow-lg hover:scale-105 interactive-button font-semibold"
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to={`/dashboard/view-property/${property.id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:shadow-lg hover:scale-105 interactive-button font-semibold"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Analytics</span>
                    </Link>
                    <Link
                      to="/dashboard/leads"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:shadow-lg hover:scale-105 interactive-button font-semibold"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>View Leads</span>
                    </Link>
                  </div>
                )}
                
                {/* Action Icons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleFavoriteToggle}
                    className={`p-3 rounded-full transition-all duration-300 interactive-button ${
                      isFavorite 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100 scale-110' 
                        : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => handleShare()}
                    className="p-3 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-300 interactive-button"
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-3 rounded-full transition-all duration-300 interactive-button ${
                      isBookmarked 
                        ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' 
                        : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <Bookmark className={`h-6 w-6 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Ultra-Premium Image Gallery */}
              <div className="relative group morphing-card">
                <div 
                  ref={galleryRef}
                  className="relative h-96 lg:h-[600px] rounded-3xl overflow-hidden property-details-gallery luxury-shadow"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {/* Main Image with Parallax Effect */}
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&crop=center'}
                      alt={property.title}
                      className="w-full h-full object-cover transition-all duration-1000 hover:scale-110 parallax-element"
                      style={{
                        transform: isHovering ? 'scale(1.05)' : 'scale(1)',
                        filter: isHovering ? 'brightness(1.1) contrast(1.1)' : 'brightness(1) contrast(1)'
                      }}
                    />
                    
                    {/* Dynamic Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-all duration-500 ${
                      isHovering ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                  </div>
                  
                  {/* Enhanced Gallery Navigation */}
                  <button
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 w-14 h-14 glass-morphism rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 interactive-button group/nav opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-7 w-7 text-slate-700 group-hover/nav:text-blue-600 transition-colors" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 glass-morphism rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 interactive-button group/nav opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-7 w-7 text-slate-700 group-hover/nav:text-blue-600 transition-colors" />
                  </button>

                  {/* Premium Action Buttons */}
                  <div className="absolute top-6 right-6 flex flex-col space-y-3">
                    <button
                      onClick={() => setShowVirtualTour(true)}
                      className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:shadow-xl transition-all duration-300 flex items-center space-x-2 hover-glow elastic-bounce group/btn"
                    >
                      <Play className="h-5 w-5 group-hover/btn:animate-pulse" />
                      <span>360° Virtual Tour</span>
                      <Sparkles className="h-4 w-4 opacity-70" />
                    </button>
                    
                    <button
                      onClick={() => setShowFloorPlan(true)}
                      className="glass-morphism text-slate-700 px-5 py-3 rounded-2xl text-sm font-bold hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center space-x-2 elastic-bounce group/btn"
                    >
                      <Layers className="h-5 w-5 group-hover/btn:text-blue-600 transition-colors" />
                      <span>Floor Plans</span>
                    </button>
                    
                    <button
                      onClick={() => setShowMortgageCalculator(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:shadow-xl transition-all duration-300 flex items-center space-x-2 hover-glow elastic-bounce group/btn"
                    >
                      <Calculator className="h-5 w-5 group-hover/btn:animate-pulse" />
                      <span>EMI Calculator</span>
                    </button>
                  </div>

                  {/* Enhanced Image Counter with Progress */}
                  <div className="absolute bottom-6 right-6 glass-morphism text-slate-700 px-5 py-3 rounded-2xl text-sm font-bold flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>{currentImageIndex + 1} / {property.images?.length || 0}</span>
                    </div>
                    <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${((currentImageIndex + 1) / (property.images?.length || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Enhanced View All Photos Button */}
                  <button
                    onClick={() => setIsImageGalleryOpen(true)}
                    className="absolute bottom-6 left-6 glass-morphism text-slate-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center space-x-3 hover:scale-105 interactive-button group/gallery"
                  >
                    <div className="relative">
                      <Image className="h-5 w-5 group-hover/gallery:scale-110 transition-transform" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <span>View All {property.images?.length || 8} Photos</span>
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </button>

                  {/* Premium Status Badges */}
                  <div className="absolute top-6 left-6 flex flex-col space-y-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 animate-pulse shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      <span>{property.status === 'sold' ? 'Sold' : 'Available Now'}</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 shadow-lg">
                      <Award className="h-3 w-3" />
                      <span>Premium Listing</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 shadow-lg">
                      <TrendingUp className="h-3 w-3" />
                      <span>High Demand</span>
                    </div>
                    
                    {isPropertyOwner && (
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 shadow-lg">
                        <User className="h-3 w-3" />
                        <span>Your Property</span>
                      </div>
                    )}
                  </div>

                  {/* View Counter with Growth */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 glass-morphism px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-slate-700">{formatNumber(viewCount)} views</span>
                    </div>
                    {viewGrowth > 0 && (
                      <>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-xs font-bold">+{viewGrowth}%</span>
                        </div>
                      </>
                    )}
                    {isPropertyOwner && (
                      <>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center space-x-1 text-blue-600">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-bold">Your Property</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Ultra-Enhanced Thumbnail Gallery */}
                <div className="mt-8 space-y-4">
                  {/* Gallery Categories */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 font-poppins">
                      <Image className="h-5 w-5 text-blue-500" />
                      <span>Property Gallery</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      {['All', 'Exterior', 'Interior', 'Amenities'].map((category, index) => (
                        <button
                          key={category}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                            index === 0 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Thumbnail Grid */}
                  <div className="grid grid-cols-6 lg:grid-cols-8 gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {property.images?.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative group aspect-square rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover-lift ${
                          index === currentImageIndex 
                            ? 'ring-3 ring-blue-500 shadow-xl scale-105' 
                            : 'hover:ring-2 hover:ring-slate-300 hover:shadow-lg'
                        }`}
                      >
                        <img
                          src={image || `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=120&h=120&fit=crop&crop=center&sig=${index}`}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                        />
                        
                        {/* Overlay with Play Icon for Videos */}
                        {index % 4 === 0 && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        )}
                        
                        {/* Active Indicator */}
                        {index === currentImageIndex && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        
                        {/* Image Number */}
                        <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                      </button>
                    ))}
                    
                    {/* Virtual Tour Thumbnail */}
                    <button 
                      onClick={() => setShowVirtualTour(true)}
                      className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex flex-col items-center justify-center text-white hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                    >
                      <Play className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold">360° Tour</span>
                    </button>
                    
                    {/* Floor Plan Thumbnail */}
                    <button 
                      onClick={() => setShowFloorPlan(true)}
                      className="aspect-square rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex flex-col items-center justify-center text-white hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                    >
                      <Layers className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold">Floor Plan</span>
                    </button>
                    
                    {/* Documents Thumbnail */}
                    <button 
                      onClick={() => setShowDocuments(true)}
                      className="aspect-square rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex flex-col items-center justify-center text-white hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                    >
                      <FileText className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold">Documents</span>
                    </button>
                  </div>

                  {/* Image Gallery Stats */}
                  <div className="flex items-center justify-between text-sm text-slate-500 glass-morphism rounded-xl p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4" />
                        <span className="font-semibold">{property.images?.length || 8} Photos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4" />
                        <span className="font-semibold">2 Videos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span className="font-semibold">360° Tour</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Last updated 2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Property Hero Section */}
              <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl luxury-shadow overflow-hidden">
                {/* Property Header */}
                <div className="p-8 pb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight font-poppins slide-in-left">
                          {property.title}
                        </h1>
                        <div className="flex items-center space-x-2">
                          <Award className="h-6 w-6 text-yellow-500" />
                          <span className="text-sm font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                            Premium
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-slate-600 mb-6 slide-in-left" style={{animationDelay: '0.1s'}}>
                        <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="font-semibold text-lg">{property.address}</span>
                        <button className="ml-3 text-blue-500 hover:text-blue-700 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-baseline space-x-6 slide-in-left" style={{animationDelay: '0.2s'}}>
                        <div className="text-5xl lg:text-6xl font-bold premium-gradient bg-clip-text text-transparent font-poppins">
                          {formatPrice(property.price)}
                        </div>
                        <div className="text-slate-500">
                          <div className="text-lg font-bold">
                            ₹{property.area ? Math.floor(property.price / property.area).toLocaleString() : 'N/A'}/sq ft
                          </div>
                          <div className="text-sm">Market competitive</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right slide-in-right">
                      <div className="flex items-center justify-end space-x-6 text-sm text-slate-500 mb-4">
                        <div className="flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full shadow-sm">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="font-bold text-slate-700">{formatNumber(viewCount)}</span>
                        </div>
                        <div className="flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full shadow-sm">
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                          <span className="font-bold text-slate-700">{propertyScore}</span>
                        </div>
                        <div className="flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full shadow-sm">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span className="font-bold text-slate-700">
                            {property.updated_at 
                              ? `${Math.round((new Date() - new Date(property.updated_at)) / (1000 * 60 * 60 * 24))}d ago`
                              : property.created_at 
                                ? `${Math.round((new Date() - new Date(property.created_at)) / (1000 * 60 * 60 * 24))}d ago`
                                : 'New'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-bold">Recently updated</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Animated Metric Cards */}
                  <div ref={metricsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white rounded-2xl luxury-shadow stagger-children">
                    <div className="text-center group hover:scale-105 transition-transform duration-300 cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                        <Bed className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 mb-1 font-poppins">{property.bedrooms}</div>
                      <div className="text-sm text-slate-600 font-semibold">Bedrooms</div>
                    </div>
                    <div className="text-center group hover:scale-105 transition-transform duration-300 cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                        <Bath className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 mb-1 font-poppins">{property.bathrooms}</div>
                      <div className="text-sm text-slate-600 font-semibold">Bathrooms</div>
                    </div>
                    <div className="text-center group hover:scale-105 transition-transform duration-300 cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                        <Square className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 mb-1 font-poppins">{formatNumber(property.area)}</div>
                      <div className="text-sm text-slate-600 font-semibold">Sq Ft</div>
                    </div>
                    <div className="text-center group hover:scale-105 transition-transform duration-300 cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                        <Car className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900 mb-1 font-poppins">{property.parking || 2}</div>
                      <div className="text-sm text-slate-600 font-semibold">Parking</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Bar */}
                <div className="glass-morphism rounded-2xl p-6 mt-6 mx-8 mb-8">
                  <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleFavoriteToggle}
                        className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                          isFavorite 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 scale-105' 
                            : 'bg-white text-slate-600 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
                        <span>{isFavorite ? 'Saved' : 'Save Property'}</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare()}
                        className="flex items-center space-x-3 px-6 py-3 bg-white text-slate-600 rounded-xl hover:bg-slate-100 transition-all duration-300 hover:scale-105 font-semibold"
                      >
                        <Share2 className="h-5 w-5" />
                        <span>Share</span>
                      </button>
                      
                      <button
                        onClick={() => setShowMortgageCalculator(true)}
                        className="flex items-center space-x-3 px-6 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all duration-300 hover:scale-105 font-semibold"
                      >
                        <Calculator className="h-5 w-5" />
                        <span>EMI Calculator</span>
                      </button>
                      
                      <button
                        onClick={() => setShowPriceComparison(true)}
                        className="flex items-center space-x-3 px-6 py-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all duration-300 hover:scale-105 font-semibold"
                      >
                        <BarChart3 className="h-5 w-5" />
                        <span>Compare Price</span>
                      </button>
                    </div>
                    
                                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span className="font-semibold">{formatNumber(viewCount)} views</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-semibold">+{marketTrends?.priceGrowth || 12.5}% this month</span>
                        </div>
                        {isPropertyOwner && (
                          <>
                            <div className="w-px h-4 bg-slate-300"></div>
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4 text-blue-500" />
                              <Link to={`/dashboard/view-property/${property.id}`} className="text-blue-600 font-semibold hover:underline">
                                View Analytics
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                  </div>
                </div>
              </div>    
          {/* Enhanced Tabbed Content */}
              <div className="bg-white rounded-3xl luxury-shadow overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-slate-200">
                  <nav className="flex space-x-8 px-8">
                    {[
                      { id: 'overview', label: 'Overview', icon: Home },
                      { id: 'amenities', label: 'Amenities', icon: Star },
                      { id: 'location', label: 'Location & Nearby', icon: MapPin },
                      { id: 'pricing', label: 'Pricing & Market', icon: Calculator },
                      { id: 'reviews', label: 'Reviews', icon: MessageSquare }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  {activeTab === 'overview' && (
                    <div className="space-y-8 fade-in">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center space-x-2 font-poppins">
                          <Info className="h-6 w-6 text-blue-500" />
                          <span>Property Description</span>
                        </h2>
                        <div className="text-slate-700 leading-relaxed text-lg glass-morphism p-6 rounded-2xl">
                          <p className={`${!showFullDescription ? 'line-clamp-4' : ''}`}>
                            {property.description}
                          </p>
                          {property.description?.length > 200 && (
                            <button
                              onClick={() => setShowFullDescription(!showFullDescription)}
                              className="text-blue-600 hover:text-blue-700 font-semibold mt-2 transition-colors"
                            >
                              {showFullDescription ? 'Show Less' : 'Read More'}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Property Highlights */}
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 font-poppins">Property Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <span className="text-slate-700 font-semibold">Ready to move in</span>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                            <Shield className="h-6 w-6 text-blue-500" />
                            <span className="text-slate-700 font-semibold">Gated community</span>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                            <Zap className="h-6 w-6 text-purple-500" />
                            <span className="text-slate-700 font-semibold">Power backup</span>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                            <TreePine className="h-6 w-6 text-orange-500" />
                            <span className="text-slate-700 font-semibold">Garden view</span>
                          </div>
                        </div>
                      </div>

                      {/* Property Performance Analytics */}
                      {isPropertyOwner && (
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-4 font-poppins">Property Performance</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="glass-morphism p-4 rounded-xl text-center">
                              <div className="text-2xl font-bold text-blue-600 mb-1">{propertyAnalytics?.weekly_views || viewCount}</div>
                              <div className="text-sm text-slate-600">Total Views</div>
                            </div>
                            <div className="glass-morphism p-4 rounded-xl text-center">
                              <div className="text-2xl font-bold text-green-600 mb-1">{propertyAnalytics?.inquiries || 0}</div>
                              <div className="text-sm text-slate-600">Inquiries</div>
                            </div>
                            <div className="glass-morphism p-4 rounded-xl text-center">
                              <div className="text-2xl font-bold text-purple-600 mb-1">{propertyAnalytics?.interest_score || 'N/A'}</div>
                              <div className="text-sm text-slate-600">Interest Score</div>
                            </div>
                          </div>
                          
                          {/* Quick Actions for Property Owners */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Link
                              to={`/dashboard/view-property/${property.id}`}
                              className="flex items-center justify-center space-x-2 p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span className="font-semibold">View Analytics</span>
                            </Link>
                            <Link
                              to="/dashboard/leads"
                              className="flex items-center justify-center space-x-2 p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span className="font-semibold">Manage Leads</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'amenities' && (
                    <div className="fade-in">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2 font-poppins">
                        <Star className="h-6 w-6 text-yellow-500" />
                        <span>Amenities & Features</span>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { name: 'Swimming Pool', icon: Waves, color: 'blue' },
                          { name: 'Gymnasium', icon: Dumbbell, color: 'red' },
                          { name: 'Wi-Fi', icon: Wifi, color: 'green' },
                          { name: 'Security', icon: Shield, color: 'purple' },
                          { name: 'Garden', icon: TreePine, color: 'green' },
                          { name: 'Clubhouse', icon: Building, color: 'orange' },
                          { name: 'Kitchen', icon: Utensils, color: 'yellow' },
                          { name: 'Entertainment', icon: Tv, color: 'indigo' },
                          { name: 'Air Conditioning', icon: Wind, color: 'cyan' },
                          ...(property.amenities?.map(amenity => ({ name: amenity, icon: CheckCircle, color: 'slate' })) || [])
                        ].map((amenity, index) => (
                          <div 
                            key={index} 
                            className={`flex items-center space-x-3 p-4 bg-${amenity.color}-50 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-md group cursor-pointer`}
                          >
                            <div className={`w-10 h-10 bg-${amenity.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${amenity.color}-200 transition-colors`}>
                              <amenity.icon className={`h-5 w-5 text-${amenity.color}-600`} />
                            </div>
                            <span className="text-slate-700 font-semibold">{amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'location' && (
                    <div className="fade-in">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2 font-poppins">
                        <MapPin className="h-6 w-6 text-red-500" />
                        <span>Location & Neighborhood</span>
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Map Placeholder */}
                        <div className="h-64 glass-morphism rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                             onClick={() => setShowNearbyMap(true)}>
                          <div className="text-center">
                            <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-500 font-semibold">Click to view interactive map</p>
                            <p className="text-slate-400 text-sm">Explore nearby places and amenities</p>
                          </div>
                        </div>
                        
                        {/* Nearby Places */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(nearbyPlaces).map(([category, places]) => (
                            <div key={category}>
                              <h3 className="text-lg font-bold text-slate-900 mb-4 capitalize font-poppins">
                                Nearby {category}
                              </h3>
                              <div className="space-y-3">
                                {places.map((place, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 glass-morphism rounded-lg hover:bg-white transition-colors">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        {category === 'schools' && <GraduationCap className="h-4 w-4 text-blue-500" />}
                                        {category === 'hospitals' && <Hospital className="h-4 w-4 text-red-500" />}
                                        {category === 'markets' && <ShoppingBag className="h-4 w-4 text-green-500" />}
                                        {category === 'transport' && <Train className="h-4 w-4 text-purple-500" />}
                                        {category === 'entertainment' && <Film className="h-4 w-4 text-orange-500" />}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-slate-900">{place.name}</div>
                                        <div className="text-sm text-slate-500">{place.distance}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                                      <span className="text-sm font-semibold">{place.rating}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pricing' && (
                    <div className="fade-in">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2 font-poppins">
                        <Calculator className="h-6 w-6 text-green-500" />
                        <span>Pricing & Market Analysis</span>
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Price Breakdown */}
                        <div className="glass-morphism p-6 rounded-2xl">
                          <h3 className="text-lg font-bold text-slate-900 mb-4">Price Breakdown</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Base Price</span>
                              <span className="font-bold text-slate-900">{formatPrice(property.price)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Price per sq ft</span>
                              <span className="font-bold text-slate-900">
                                ₹{property.area ? Math.floor(property.price / property.area).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Registration & Stamp Duty (est.)</span>
                              <span className="font-bold text-slate-900">{formatPrice(property.price * 0.07)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between items-center">
                              <span className="text-slate-900 font-bold">Total Cost (est.)</span>
                              <span className="font-bold text-blue-600 text-lg">{formatPrice(property.price * 1.07)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Market Comparison */}
                        <div className="glass-morphism p-6 rounded-2xl">
                          <h3 className="text-lg font-bold text-slate-900 mb-4">Market Comparison</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                {formatPrice(marketTrends?.averagePrice || 0)}
                              </div>
                              <div className="text-sm text-slate-600">Area Average</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                +{marketTrends?.priceGrowth || 12.5}%
                              </div>
                              <div className="text-sm text-slate-600">YoY Growth</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-xl">
                              <div className="text-2xl font-bold text-purple-600 mb-1">
                                ₹{marketTrends?.pricePerSqft || 0}
                              </div>
                              <div className="text-sm text-slate-600">Avg Price/sq ft</div>
                            </div>
                          </div>
                          
                          {/* Market Position Indicator */}
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                            <h4 className="font-bold text-slate-900 mb-2">Market Position</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Your Price</span>
                              <span className="font-bold text-slate-900">{formatPrice(property.price)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Market Average</span>
                              <span className="font-bold text-slate-900">{formatPrice(marketTrends?.averagePrice || 0)}</span>
                            </div>
                            <div className="mt-2 p-2 rounded-lg bg-blue-50">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-700">Price Position</span>
                                <span className={`font-bold ${
                                  property.price > (marketTrends?.averagePrice || 0) 
                                    ? 'text-red-600' 
                                    : 'text-green-600'
                                }`}>
                                  {property.price > (marketTrends?.averagePrice || 0) 
                                    ? 'Above Market' 
                                    : 'Below Market'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price History Chart Placeholder */}
                        {priceHistory.length > 0 && (
                          <div className="glass-morphism p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Price History</h3>
                            <div className="h-48 bg-slate-100 rounded-xl flex items-center justify-center">
                              <div className="text-center">
                                <LineChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-500">Price trend chart coming soon</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2 font-poppins">
                          <MessageSquare className="h-6 w-6 text-blue-500" />
                          <span>Reviews & Testimonials</span>
                        </h2>
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Write Review
                        </button>
                      </div>
                      
                      {/* Rating Summary */}
                      <div className="glass-morphism p-6 rounded-2xl mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl font-bold text-slate-900">{averageRating}</div>
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'fill-current text-yellow-400' : 'text-slate-300'}`} />
                              ))}
                            </div>
                            <div className="text-sm text-slate-600">{reviews.length} reviews</div>
                          </div>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="glass-morphism p-6 rounded-2xl">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{review.user}</div>
                                  <div className="text-sm text-slate-500">{review.date}</div>
                                </div>
                                {review.verified && (
                                  <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                                    Verified
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current text-yellow-400' : 'text-slate-300'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Premium Contact Card */}
              <div className="glass-morphism rounded-3xl p-6 luxury-shadow">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {propertyOwner?.profile_picture ? (
                      <img 
                        src={propertyOwner.profile_picture} 
                        alt={propertyOwner.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 font-poppins">
                    {propertyOwner?.name || 'Property Owner'}
                  </h3>
                  <p className="text-slate-600">{propertyOwner?.company || 'Real Estate Professional'}</p>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-sm font-semibold">4.8 (127 reviews)</span>
                  </div>
                  
                  {/* Property Owner Badge */}
                  {isPropertyOwner && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        <User className="h-3 w-3 mr-1" />
                        Your Property
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Send Message</span>
                  </button>
                  
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Schedule Visit</span>
                  </button>
                  
                  <button
                    onClick={() => window.open(`tel:${propertyOwner?.phone || '+91-9876543210'}`)}
                    className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Call Now</span>
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Response Time</span>
                      <span className="font-semibold text-green-600">Within 2 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Languages</span>
                      <span className="font-semibold">English, Hindi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Premium CTAs */}
              <div className="glass-morphism rounded-3xl p-6 luxury-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-4 font-poppins">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowVirtualTour(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg"
                  >
                    <Play className="h-5 w-5" />
                    <span>Book Virtual Tour</span>
                  </button>
                  
                  <button
                    onClick={() => alert('Callback feature coming soon!')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Request Callback</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDocuments(true)}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-bold hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Brochure</span>
                  </button>
                  
                  <button
                    onClick={() => setShowPriceComparison(true)}
                    className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Compare Properties</span>
                  </button>
                  
                  <button
                    onClick={() => alert('Make an offer feature coming soon!')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Make an Offer</span>
                  </button>
                </div>
              </div>

              {/* Real-time Availability Status */}
              <div className="glass-morphism rounded-3xl p-6 luxury-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-4 font-poppins">Availability Status</h3>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    property.status === 'sold' 
                      ? 'bg-red-50' 
                      : 'bg-green-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        property.status === 'sold' 
                          ? 'bg-red-500' 
                          : 'bg-green-500'
                      }`}></div>
                      <span className={`font-semibold ${
                        property.status === 'sold' 
                          ? 'text-red-700' 
                          : 'text-green-700'
                      }`}>
                        {property.status === 'sold' ? 'Sold' : 'Available'}
                      </span>
                    </div>
                    {property.status === 'sold' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Possession</span>
                      <span className="font-semibold">
                        {property.status === 'sold' ? 'Sold' : 'Immediate'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Updated</span>
                      <span className="font-semibold">
                        {property.updated_at 
                          ? `${Math.round((new Date() - new Date(property.updated_at)) / (1000 * 60 * 60))}h ago`
                          : 'Recently'
                        }
                      </span>
                    </div>
                    {isPropertyOwner && (
                      <div className="flex items-center justify-between">
                        <span>Property Status</span>
                        <Link 
                          to={`/dashboard/edit-property/${property.id}`}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          Edit Status
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Map */}
              <div className="glass-morphism rounded-3xl p-6 luxury-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-4 font-poppins">Location</h3>
                <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 cursor-pointer hover:bg-slate-200 transition-colors"
                     onClick={() => setShowNearbyMap(true)}>
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500 font-semibold">Interactive map</p>
                    <p className="text-xs text-slate-400">Click to explore</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-semibold">{property.address}</p>
                      <p>{[property.city, property.state].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Owner Dashboard Section */}
              {isPropertyOwner && (
                <div className="glass-morphism rounded-3xl p-6 luxury-shadow">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 font-poppins">Property Management</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{propertyViews?.length || 0}</div>
                        <div className="text-xs text-blue-600">Views</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-xs text-green-600">Leads</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link
                        to={`/dashboard/edit-property/${property.id}`}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Edit Property</span>
                      </Link>
                      
                      <Link
                        to={`/dashboard/view-property/${property.id}`}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>View Analytics</span>
                      </Link>
                      
                      <Link
                        to="/dashboard/leads"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Manage Leads</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {propertyViews && propertyViews.length > 0 && (
                <div className="glass-morphism rounded-3xl p-6 luxury-shadow">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 font-poppins">Recent Activity</h3>
                  <div className="space-y-3">
                    {propertyViews.slice(0, 5).map((view, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Eye className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-slate-600">
                          Viewed {Math.floor((Date.now() - new Date(view.created_at)) / (1000 * 60 * 60 * 24))} days ago
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div className="glass-morphism rounded-3xl p-6 luxury-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-4 font-poppins">Share Property</h3>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => handleSocialShare('facebook')}
                    className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <Globe className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSocialShare('twitter')}
                    className="p-3 bg-sky-100 text-sky-600 rounded-xl hover:bg-sky-200 transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSocialShare('whatsapp')}
                    className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSocialShare('email')}
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center"
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>       
   {/* Enhanced Nearby Properties Section */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 font-poppins">
                Properties in Your Price Range
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Discover similar properties in {property?.city} within your budget
              </p>
              <div className="flex items-center justify-center mt-8 space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 font-poppins">
                    {formatPrice(marketTrends?.averagePrice || 0)}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold">Average Price</div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 font-poppins">
                    +{marketTrends?.priceGrowth || 12.5}%
                  </div>
                  <div className="text-sm text-slate-500 font-semibold">Price Growth</div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 font-poppins">
                    {nearbyProperties.length}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold">Similar Properties</div>
                </div>
              </div>
            </div>

            {loadingNearby ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="glass-morphism rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-64 bg-slate-200"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : nearbyProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {nearbyProperties.map((nearbyProperty, index) => (
                  <div 
                    key={nearbyProperty.id} 
                    className="group glass-morphism rounded-2xl luxury-shadow hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 morphing-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={nearbyProperty.images?.[0] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop'}
                        alt={nearbyProperty.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Property Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Available
                        </span>
                      </div>
                      
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 glass-morphism px-3 py-2 rounded-full">
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(nearbyProperty.price)}
                        </span>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center hover:bg-white transition-colors">
                          <Heart className="h-5 w-5 text-slate-600" />
                        </button>
                        <button className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center hover:bg-white transition-colors">
                          <Share2 className="h-5 w-5 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors font-poppins">
                          {nearbyProperty.title}
                        </h3>
                        <div className="flex items-center text-slate-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="text-sm">{nearbyProperty.address}</span>
                        </div>
                      </div>
                      
                      {/* Property Features */}
                      <div className="flex items-center justify-between mb-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span>{nearbyProperty.bedrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{nearbyProperty.bathrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            <span>{formatNumber(nearbyProperty.area)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price per sqft */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-slate-500">
                          ₹{nearbyProperty.area ? Math.floor(nearbyProperty.price / nearbyProperty.area).toLocaleString() : 'N/A'}/sq ft
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>Good Value</span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <Link
                        to={`/property/${nearbyProperty.id}`}
                        className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 font-poppins">
                  No Similar Properties Found
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  We couldn't find properties in your price range in this area. Try expanding your search criteria.
                </p>
                <Link
                  to="/properties"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Browse All Properties
                </Link>
              </div>
            )}
            
            {/* Market Insights */}
            {nearbyProperties.length > 0 && (
              <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 luxury-shadow">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-slate-900 mb-4 font-poppins">
                    Market Insights for {property?.city}
                  </h3>
                  <p className="text-lg text-slate-600">
                    Based on recent property data in your area
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-6 glass-morphism rounded-2xl shadow-sm hover-lift">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2 font-poppins">
                      +{marketTrends?.priceGrowth || 12.5}%
                    </div>
                    <div className="text-slate-600 font-semibold mb-2">Price Growth</div>
                    <div className="text-sm text-slate-500">
                      Properties in this area have shown consistent growth
                    </div>
                  </div>
                  
                  <div className="text-center p-6 glass-morphism rounded-2xl shadow-sm hover-lift">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2 font-poppins">
                      {(marketTrends?.demandLevel || "high") === "high" ? "High" : "Medium"}
                    </div>
                    <div className="text-slate-600 font-semibold mb-2">Demand Level</div>
                    <div className="text-sm text-slate-500">
                      Strong buyer interest in this locality
                    </div>
                  </div>
                  
                  <div className="text-center p-6 glass-morphism rounded-2xl shadow-sm hover-lift">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-2 font-poppins">
                      {Math.round(propertyScore * 10) / 10}
                    </div>
                    <div className="text-slate-600 font-semibold mb-2">Property Score</div>
                    <div className="text-sm text-slate-500">
                      Based on location, amenities, and value
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modals */}
        
        {/* Image Gallery Modal */}
        {isImageGalleryOpen && property.images && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={() => setIsImageGalleryOpen(false)}
                className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <img
                src={property.images[currentImageIndex]}
                alt={property.title}
                className="max-w-full max-h-full object-contain"
              />
              
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-md w-full p-8 luxury-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">Contact Agent</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {messageSent && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-2xl">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-700 font-semibold">Message sent successfully!</span>
                  </div>
                  {isPropertyOwner && (
                    <div className="text-sm text-green-600">
                      <Link to="/dashboard/leads" className="underline hover:text-green-800">
                        View new leads in your dashboard →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={messageForm.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    value={messageForm.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={messageForm.phone}
                    onChange={handleInputChange}
                    placeholder="Your Phone (Optional)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                
                <div>
                  <textarea
                    name="message"
                    value={messageForm.message}
                    onChange={handleInputChange}
                    placeholder="Your Message"
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={sendingMessage || !user}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {sendingMessage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{!user ? 'Login to Send' : 'Send Message'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Visit Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-md w-full p-8 luxury-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">Schedule a Visit</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {visitScheduled && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-2xl">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-700 font-semibold">Visit scheduled successfully!</span>
                  </div>
                  {isPropertyOwner && (
                    <div className="text-sm text-green-600">
                      <Link to="/dashboard/tours" className="underline hover:text-green-800">
                        View tour requests in your dashboard →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Visit Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setScheduleForm(prev => ({ ...prev, visitType: 'physical' }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        scheduleForm.visitType === 'physical'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Home className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-semibold">Physical Visit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleForm(prev => ({ ...prev, visitType: 'virtual' }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        scheduleForm.visitType === 'virtual'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Video className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-semibold">Virtual Tour</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                
                <div>
                  <textarea
                    value={scheduleForm.message}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Any specific requirements or questions?"
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={schedulingVisit || !user}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {schedulingVisit ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>{!user ? 'Login to Schedule' : 'Schedule Visit'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}      
  {/* Mortgage Calculator Modal */}
        {showMortgageCalculator && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-lg w-full p-8 luxury-shadow max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">EMI Calculator</h3>
                <button
                  onClick={() => setShowMortgageCalculator(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Property Price: {formatPrice(property.price)}
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Down Payment (₹)
                  </label>
                  <input
                    type="number"
                    value={mortgageData.downPayment}
                    onChange={(e) => setMortgageData(prev => ({ 
                      ...prev, 
                      downPayment: Number(e.target.value),
                      loanAmount: property.price - Number(e.target.value)
                    }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Loan Amount: {formatPrice(mortgageData.loanAmount)}
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Interest Rate (% per annum)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={mortgageData.interestRate}
                    onChange={(e) => setMortgageData(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Loan Term (Years)
                  </label>
                  <input
                    type="number"
                    value={mortgageData.loanTerm}
                    onChange={(e) => setMortgageData(prev => ({ ...prev, loanTerm: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Monthly Income (₹) - Optional
                  </label>
                  <input
                    type="number"
                    value={mortgageData.monthlyIncome}
                    onChange={(e) => setMortgageData(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                    placeholder="For eligibility check"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                
                <button
                  onClick={calculateMortgage}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Calculate EMI
                </button>
                
                {mortgageResult && (
                  <div className="mt-6 p-6 glass-morphism rounded-2xl">
                    <h4 className="font-bold text-lg mb-4 text-slate-900">Calculation Results:</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Monthly EMI:</span>
                        <span className="font-bold text-blue-600 text-lg">{formatPrice(mortgageResult.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Total Payment:</span>
                        <span className="font-bold text-slate-900">{formatPrice(mortgageResult.totalPayment)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Total Interest:</span>
                        <span className="font-bold text-slate-900">{formatPrice(mortgageResult.totalInterest)}</span>
                      </div>
                    </div>
                    
                    {eligibilityResult && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h5 className="font-bold text-slate-900 mb-2">Eligibility Check:</h5>
                        <div className={`p-3 rounded-xl ${eligibilityResult.eligible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          <div className="flex items-center space-x-2">
                            {eligibilityResult.eligible ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <AlertCircle className="h-5 w-5" />
                            )}
                            <span className="font-semibold">
                              {eligibilityResult.eligible ? 'Eligible for loan' : 'May need higher income'}
                            </span>
                          </div>
                          <div className="text-sm mt-2">
                            EMI to Income Ratio: {eligibilityResult.utilizationRatio}% 
                            (Recommended: &lt;50%)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Modal */}
        {showDocuments && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-lg w-full p-8 luxury-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">Property Documents</h3>
                <button
                  onClick={() => setShowDocuments(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {availableDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 glass-morphism rounded-xl hover:bg-white transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{doc.name}</div>
                        <div className="text-sm text-slate-500">{doc.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.protected && (
                        <Lock className="h-4 w-4 text-orange-500" />
                      )}
                      <button
                        onClick={() => {
                          if (doc.protected && !documentAccess) {
                            alert('Please contact the agent to access this document');
                          } else {
                            alert('Download feature coming soon!');
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        {doc.protected && !documentAccess ? 'Request Access' : 'Download'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!documentAccess && (
                <div className="mt-6 p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center space-x-2 text-orange-700">
                    <Lock className="h-5 w-5" />
                    <span className="font-semibold">Some documents require verification</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">
                    Contact the agent to get access to legal documents
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floor Plan Modal */}
        {showFloorPlan && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-4xl w-full p-8 luxury-shadow max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">Floor Plans</h3>
                <button
                  onClick={() => setShowFloorPlan(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Floor Plan Navigation */}
                <div className="flex items-center justify-center space-x-4">
                  {['Ground Floor', 'First Floor', 'Second Floor', 'Terrace'].map((floor, index) => (
                    <button
                      key={floor}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        index === 0 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>

                {/* Floor Plan Display */}
                <div className="h-96 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Layers className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-slate-600">Floor Plan</p>
                    <p className="text-slate-500">Interactive floor plan coming soon</p>
                  </div>
                </div>

                {/* Floor Plan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-morphism p-6 rounded-2xl">
                    <h4 className="font-bold text-lg mb-4 text-slate-900">Ground Floor</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Living Room</span>
                        <span className="font-semibold">250 sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Kitchen</span>
                        <span className="font-semibold">180 sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Dining Area</span>
                        <span className="font-semibold">120 sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Balcony</span>
                        <span className="font-semibold">80 sq ft</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-morphism p-6 rounded-2xl">
                    <h4 className="font-bold text-lg mb-4 text-slate-900">First Floor</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Master Bedroom</span>
                        <span className="font-semibold">300 sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bedroom 2</span>
                        <span className="font-semibold">250 sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bathroom</span>
                        <span className="font-semibold">120 sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Corridor</span>
                        <span className="font-semibold">60 sq ft</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Options */}
                <div className="flex items-center justify-center space-x-4">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    <Download className="h-5 w-5" />
                    <span>Download PDF</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span>Share Floor Plan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Virtual Tour Modal */}
        {showVirtualTour && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-full max-h-[80vh] glass-morphism rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h3 className="text-2xl font-bold text-white font-poppins">360° Virtual Tour</h3>
                <button
                  onClick={() => setShowVirtualTour(false)}
                  className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Virtual Tour Controls */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
                    <Play className="h-5 w-5" />
                    <span>Play Tour</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
                    <Pause className="h-5 w-5" />
                    <span>Pause</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
                    <RotateCcw className="h-5 w-5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Virtual Tour Display */}
                <div className="h-96 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-semibold">360° Virtual Tour</p>
                    <p className="text-slate-300">Interactive tour coming soon</p>
                  </div>
                  
                  {/* Tour Navigation Dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {virtualTourRooms.map((room, index) => (
                      <button
                        key={room.id}
                        onClick={() => setCurrentRoom(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          currentRoom === index 
                            ? 'bg-white' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Room Navigation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {virtualTourRooms.map((room, index) => (
                    <button
                      key={room.id}
                      onClick={() => setCurrentRoom(index)}
                      className={`p-4 rounded-xl transition-all ${
                        currentRoom === index
                          ? 'bg-white/20 text-white border-2 border-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-semibold">{room.name}</div>
                        <div className="text-xs opacity-70">Room {index + 1}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Tour Information */}
                <div className="glass-morphism p-6 rounded-2xl">
                  <h4 className="font-bold text-lg mb-4 text-white">Tour Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{virtualTourRooms.length}</div>
                      <div className="text-sm opacity-70">Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">2:30</div>
                      <div className="text-sm opacity-70">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">HD</div>
                      <div className="text-sm opacity-70">Quality</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  {virtualTourRooms.map((room, index) => (
                    <button
                      key={room.id}
                      onClick={() => setCurrentRoom(room.id)}
                      className={`p-3 rounded-xl transition-all ${
                        currentRoom === room.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="text-sm font-semibold">{room.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floor Plan Modal */}
        {showFloorPlan && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-4xl w-full p-8 luxury-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">Floor Plans</h3>
                <button
                  onClick={() => setShowFloorPlan(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-96 bg-slate-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Layers className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-slate-600">Floor Plan</p>
                  <p className="text-slate-500">Detailed floor plan coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-md w-full p-8 luxury-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">Write a Review</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-2xl hover:scale-110 transition-transform"
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Share your experience with this property..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Price Comparison Modal */}
        {showPriceComparison && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-4xl w-full p-8 luxury-shadow max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">Price Comparison</h3>
                <button
                  onClick={() => setShowPriceComparison(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 glass-morphism rounded-2xl">
                    <div className="text-2xl font-bold text-blue-600 mb-2 font-poppins">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-slate-600 font-semibold">This Property</div>
                  </div>
                  <div className="text-center p-6 glass-morphism rounded-2xl">
                    <div className="text-2xl font-bold text-green-600 mb-2 font-poppins">
                      {formatPrice(marketTrends?.averagePrice || 0)}
                    </div>
                    <div className="text-slate-600 font-semibold">Area Average</div>
                  </div>
                  <div className="text-center p-6 glass-morphism rounded-2xl">
                    <div className="text-2xl font-bold text-purple-600 mb-2 font-poppins">
                      ₹{marketTrends?.pricePerSqft || 0}
                    </div>
                    <div className="text-slate-600 font-semibold">Price per Sq Ft</div>
                  </div>
                </div>

                <div className="h-64 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-slate-600">Price Comparison Chart</p>
                    <p className="text-slate-500">Interactive chart coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Gallery Modal */}
        {isImageGalleryOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl h-full max-h-[90vh] glass-morphism rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h3 className="text-2xl font-bold text-white font-poppins">Property Gallery</h3>
                <button
                  onClick={() => setIsImageGalleryOpen(false)}
                  className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Gallery Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={prevImage}
                    className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  
                  <div className="text-white text-center">
                    <div className="text-lg font-semibold">
                      {currentImageIndex + 1} of {property.images?.length || 0}
                    </div>
                    <div className="text-sm opacity-70">Property Images</div>
                  </div>
                  
                  <button
                    onClick={nextImage}
                    className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </div>

                {/* Main Image Display */}
                <div className="h-96 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                  <img
                    src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'}
                    alt={`Property image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnail Grid */}
                <div className="grid grid-cols-6 gap-3">
                  {property.images?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-xl overflow-hidden transition-all ${
                        index === currentImageIndex 
                          ? 'ring-2 ring-white scale-105' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <img
                        src={image || `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=150&h=150&fit=crop&sig=${index}`}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Gallery Actions */}
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
                    <Download className="h-5 w-5" />
                    <span>Download All</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span>Share Gallery</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
                    <Play className="h-5 w-5" />
                    <span>View Slideshow</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nearby Map Modal */}
        {showNearbyMap && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="glass-morphism rounded-3xl max-w-6xl w-full p-8 luxury-shadow max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 font-poppins">Location & Nearby Places</h3>
                <button
                  onClick={() => setShowNearbyMap(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-96 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-slate-600">Interactive Map</p>
                  <p className="text-slate-500">Google Maps integration coming soon</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(nearbyPlaces).map(([category, places]) => (
                  <div key={category} className="glass-morphism p-4 rounded-2xl">
                    <h4 className="font-bold text-slate-900 mb-3 capitalize font-poppins">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {places.slice(0, 3).map((place, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{place.name}</span>
                          <span className="text-slate-500">{place.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyDetails;