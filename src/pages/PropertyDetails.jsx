import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Calendar,
  Eye,
  Star,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Car,
  Wifi,
  Dumbbell,
  Waves,
  Shield,
  TreePine,
  Building,
  Camera,
  Video,
  ArrowLeft,
  Send,
  MessageSquare,
  CheckCircle,
  Play,
  Download,
  Bookmark,
  TrendingUp,
  Award,
  Clock,
  Home,
  Zap,
  Coffee,
  Utensils,
  Tv,
  Wind,
  Sun,
  Moon,
  Calculator,
  Navigation,
  Maximize2,
  X,
  Info,
  ThumbsUp,
  MessageCircle,
  Share,
  ExternalLink,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Headphones,
  Volume2,
  Sparkles,
  Target,
  Compass,
  Layers,
  Palette,
  Lightbulb,
  Image,
  Settings,
  Search,
  Filter,
  SortAsc,
  AlertCircle,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  PieChart,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Hospital,
  Train,
  Bus,
  ShoppingCart,
  Gamepad2,
  Music,
  Film,
  Book,
  DollarSign,
  Percent,
  Activity,
  LineChart,
  Archive,
  Lock,
  Unlock,
  Key,
  Pause,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
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
  scheduleTour,
} from "../services/supabaseService";
import supabase from "../services/supabaseClient";
import Loading from "../components/Loading";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core state
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyOwner, setPropertyOwner] = useState(null);

  // UI state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Interactive features
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [propertyViews, setPropertyViews] = useState([]);
  const [viewGrowth, setViewGrowth] = useState(0);

  // Modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false);

  // Contact form
  const [messageForm, setMessageForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    message:
      "I am interested in this property. Please contact me with more details.",
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    visitType: "physical",
    message: "",
  });
  const [schedulingVisit, setSchedulingVisit] = useState(false);
  const [visitScheduled, setVisitScheduled] = useState(false);

  // Dynamic content
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Mortgage calculator
  const [mortgageData, setMortgageData] = useState({
    loanAmount: 0,
    interestRate: 8.5,
    loanTerm: 20,
    downPayment: 0,
    monthlyIncome: 0,
  });
  const [mortgageResult, setMortgageResult] = useState(null);

  // Animation state
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Refs for animations
  const galleryRef = useRef(null);
  const parallaxRef = useRef(null);

  // Additional detailed state
  const [propertyAnalytics, setPropertyAnalytics] = useState(null);
  const [floorPlans, setFloorPlans] = useState([]);
  const [virtualTour, setVirtualTour] = useState(null);
  const [propertyDocuments, setPropertyDocuments] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [marketTrends, setMarketTrends] = useState(null);
  const [neighborhoodInfo, setNeighborhoodInfo] = useState(null);
  const [transportLinks, setTransportLinks] = useState([]);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [propertyReviews, setPropertyReviews] = useState([]);
  const [legalInfo, setLegalInfo] = useState(null);
  const [financingOptions, setFinancingOptions] = useState([]);
  const [propertyComparisons, setPropertyComparisons] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [energyRating, setEnergyRating] = useState(null);
  const [safetyFeatures, setSafetyFeatures] = useState([]);
  const [communityFeatures, setCommunityFeatures] = useState([]);
  const [investmentPotential, setInvestmentPotential] = useState(null);

  // Enhanced similar properties state
  const [priceRangeProperties, setPriceRangeProperties] = useState([]);
  const [locationBasedProperties, setLocationBasedProperties] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);

  // Additional specific category states
  const [sameAreaProperties, setSameAreaProperties] = useState([]);
  const [sameBHKProperties, setSameBHKProperties] = useState([]);
  const [sameLocalityProperties, setSameLocalityProperties] = useState([]);
  const [similarSizeProperties, setSimilarSizeProperties] = useState([]);
  const [sameBuilderProperties, setSameBuilderProperties] = useState([]);
  const [nearbyMetroProperties, setNearbyMetroProperties] = useState([]);

  // Map and location state
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [mapZoom, setMapZoom] = useState(15);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Dynamic content state
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [areaStatistics, setAreaStatistics] = useState(null);
  const [demographicData, setDemographicData] = useState(null);
  const [futureProjects, setFutureProjects] = useState([]);
  const [governmentSchemes, setGovernmentSchemes] = useState([]);

  // Enhanced animations and interactions
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    // Trigger entrance animations
    setTimeout(() => setAnimationTrigger(true), 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Auto-advance image gallery
  useEffect(() => {
    if (property?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === property.images.length - 1 ? 0 : prev + 1
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [property?.images]);

  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const propertyResult = await getPropertyById(id);
        if (!propertyResult.success) {
          setError(propertyResult.error);
          return;
        }

        setProperty(propertyResult.data);

        // Set initial mortgage calculation values
        if (propertyResult.data.price) {
          setMortgageData((prev) => ({
            ...prev,
            loanAmount: propertyResult.data.price * 0.8,
            downPayment: propertyResult.data.price * 0.2,
          }));
        }

        // Fetch property owner details
        if (propertyResult.data.user_id) {
          console.log(
            "🔍 Fetching owner profile for user_id:",
            propertyResult.data.user_id
          );
          const ownerResult = await getUserProfile(propertyResult.data.user_id);
          console.log("📊 Owner profile result:", ownerResult);
          if (ownerResult.success) {
            setPropertyOwner(ownerResult.data);
            console.log("✅ Property owner set:", ownerResult.data);
          } else {
            console.error(
              "❌ Failed to fetch property owner:",
              ownerResult.error
            );
            // Set a fallback owner object
            setPropertyOwner({
              name: "Property Owner",
              email: "Contact via form",
            });
          }
        }

        // Track property view (works for both logged in and anonymous users)
        const viewResult = await addPropertyView(id, user?.uid || null);
        if (viewResult.success) {
          console.log("✅ Property view tracked successfully");
        } else {
          console.error("❌ Failed to track property view:", viewResult.error);
        }

        // Fetch property views
        console.log("📊 Fetching property views...");
        const viewsResult = await getPropertyViews(id);
        console.log("📊 Views result:", viewsResult);

        if (viewsResult.success && viewsResult.data) {
          const viewData = viewsResult.data;
          setViewCount(viewData.total_views || 0);
          setPropertyViews(viewData.recent_views || []);

          const thisWeekViews = viewData.this_week_views || 0;
          const lastWeekViews = viewData.last_week_views || 1;
          const growth =
            lastWeekViews > 0
              ? ((thisWeekViews - lastWeekViews) / lastWeekViews) * 100
              : 0;
          setViewGrowth(Math.round(growth * 10) / 10);

          console.log("✅ View data processed:", {
            total: viewData.total_views,
            thisWeek: thisWeekViews,
            lastWeek: lastWeekViews,
            growth: growth,
          });
        } else {
          console.error(
            "❌ Failed to fetch property views:",
            viewsResult.error
          );
          // Set default values
          setViewCount(0);
          setPropertyViews([]);
          setViewGrowth(0);
        }

        // Fetch enhanced similar properties with multiple fallback strategies
        console.log("🔍 Fetching similar properties for:", id);

        // Strategy 1: Try to get similar properties from the existing function
        const similarResult = await getSimilarProperties(id, 20);
        let allSimilar = [];

        if (similarResult.success && similarResult.data.length > 0) {
          allSimilar = similarResult.data;
          console.log(
            "✅ Got similar properties from getSimilarProperties:",
            allSimilar.length
          );
        } else {
          console.log(
            "⚠️ getSimilarProperties returned no results, trying broader search..."
          );

          // Strategy 2: Broader search - get all active properties except current one
          try {
            const { data: broadResults, error: broadError } = await supabase
              .from("properties")
              .select("*, users(name, profile, company)")
              .eq("status", "active")
              .neq("id", id)
              .limit(30);

            if (!broadError && broadResults) {
              allSimilar = broadResults;
              console.log(
                "✅ Got properties from broader search:",
                allSimilar.length
              );
            }
          } catch (error) {
            console.error("❌ Error in broader search:", error);
          }

          // Strategy 3: If still no results, create some mock properties for demo
          if (allSimilar.length === 0) {
            console.log(
              "⚠️ No properties found, creating mock data for demo..."
            );
            const currentProperty = propertyResult.data;
            allSimilar = [
              {
                id: "mock-1",
                title: `Similar ${
                  currentProperty.property_type || "Property"
                } in ${currentProperty.city || "Same Area"}`,
                address: currentProperty.address || "Similar Location",
                city: currentProperty.city || "Same City",
                locality: currentProperty.locality || "Same Locality",
                price: currentProperty.price * 0.9,
                bedrooms: currentProperty.bedrooms || 2,
                bathrooms: currentProperty.bathrooms || 2,
                area: (currentProperty.area || 1000) + 50,
                property_type: currentProperty.property_type || "apartment",
                images: [
                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
                ],
                views: 245,
                users: { name: "Demo Agent", company: "Premium Properties" },
              },
              {
                id: "mock-2",
                title: `Premium ${
                  currentProperty.property_type || "Property"
                } Near You`,
                address: `Near ${currentProperty.address || "Your Location"}`,
                city: currentProperty.city || "Same City",
                locality: currentProperty.locality || "Same Locality",
                price: currentProperty.price * 1.1,
                bedrooms: currentProperty.bedrooms || 3,
                bathrooms: (currentProperty.bathrooms || 2) + 1,
                area: (currentProperty.area || 1000) - 100,
                property_type: currentProperty.property_type || "apartment",
                images: [
                  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
                ],
                views: 189,
                users: { name: "Expert Realtor", company: "Elite Homes" },
              },
              {
                id: "mock-3",
                title: `Affordable ${
                  currentProperty.property_type || "Property"
                } Option`,
                address: `${
                  currentProperty.city || "Same City"
                } - Great Location`,
                city: currentProperty.city || "Same City",
                locality: currentProperty.locality || "Same Locality",
                price: currentProperty.price * 0.8,
                bedrooms: currentProperty.bedrooms || 2,
                bathrooms: currentProperty.bathrooms || 2,
                area: (currentProperty.area || 1000) - 50,
                property_type: currentProperty.property_type || "apartment",
                images: [
                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
                ],
                views: 156,
                users: { name: "Property Expert", company: "Smart Homes" },
              },
            ];
            console.log(
              "✅ Created mock properties for demo:",
              allSimilar.length
            );
          }
        }

        if (allSimilar.length > 0) {
          const currentProperty = propertyResult.data;
          console.log("📊 Current property details:", {
            city: currentProperty.city,
            locality: currentProperty.locality,
            bedrooms: currentProperty.bedrooms,
            bathrooms: currentProperty.bathrooms,
            area: currentProperty.area,
            price: currentProperty.price,
            property_type: currentProperty.property_type,
          });

          // Filter by price range (±30% for more results)
          const priceMin = currentProperty.price * 0.7;
          const priceMax = currentProperty.price * 1.3;
          const priceRangeFiltered = allSimilar.filter(
            (p) =>
              p.price >= priceMin &&
              p.price <= priceMax &&
              p.id !== currentProperty.id
          );

          // Filter by location (same city OR same locality)
          const locationFiltered = allSimilar.filter(
            (p) =>
              ((p.city &&
                currentProperty.city &&
                p.city.toLowerCase() === currentProperty.city.toLowerCase()) ||
                (p.locality &&
                  currentProperty.locality &&
                  p.locality.toLowerCase() ===
                    currentProperty.locality.toLowerCase())) &&
              p.id !== currentProperty.id
          );

          // Filter by same area/locality (more specific)
          const sameAreaFiltered = allSimilar.filter(
            (p) =>
              p.locality &&
              currentProperty.locality &&
              p.locality.toLowerCase() ===
                currentProperty.locality.toLowerCase() &&
              p.id !== currentProperty.id
          );

          // Filter by same BHK configuration (allow ±1 bedroom for more results)
          const sameBHKFiltered = allSimilar.filter(
            (p) =>
              p.bedrooms === currentProperty.bedrooms &&
              p.id !== currentProperty.id
          );

          // Filter by similar size (±300 sq ft for more results)
          const areaMin = (currentProperty.area || 1000) - 300;
          const areaMax = (currentProperty.area || 1000) + 300;
          const similarSizeFiltered = allSimilar.filter(
            (p) =>
              p.area &&
              p.area >= areaMin &&
              p.area <= areaMax &&
              p.id !== currentProperty.id
          );

          // Filter by same builder (if available)
          const sameBuilderFiltered = allSimilar.filter(
            (p) =>
              p.builder &&
              currentProperty.builder &&
              p.builder.toLowerCase() ===
                currentProperty.builder.toLowerCase() &&
              p.id !== currentProperty.id
          );

          // Filter by same property type
          const sameTypeFiltered = allSimilar.filter(
            (p) =>
              p.property_type &&
              currentProperty.property_type &&
              p.property_type.toLowerCase() ===
                currentProperty.property_type.toLowerCase() &&
              p.id !== currentProperty.id
          );

          // Create fallback arrays if specific filters don't have enough results
          const fallbackSimilar = allSimilar.filter(
            (p) => p.id !== currentProperty.id
          );

          // Set different categories with fallbacks
          setSimilarProperties(fallbackSimilar.slice(0, 6));
          setPriceRangeProperties(
            priceRangeFiltered.length > 0
              ? priceRangeFiltered.slice(0, 6)
              : fallbackSimilar.slice(0, 6)
          );
          setLocationBasedProperties(
            locationFiltered.length > 0
              ? locationFiltered.slice(0, 6)
              : fallbackSimilar.slice(0, 6)
          );
          setSameAreaProperties(
            sameAreaFiltered.length > 0
              ? sameAreaFiltered.slice(0, 6)
              : locationFiltered.slice(0, 6)
          );
          setSameBHKProperties(
            sameBHKFiltered.length > 0
              ? sameBHKFiltered.slice(0, 6)
              : fallbackSimilar.slice(0, 6)
          );
          setSimilarSizeProperties(
            similarSizeFiltered.length > 0
              ? similarSizeFiltered.slice(0, 6)
              : fallbackSimilar.slice(0, 6)
          );
          setSameBuilderProperties(
            sameBuilderFiltered.length > 0
              ? sameBuilderFiltered.slice(0, 4)
              : fallbackSimilar.slice(0, 4)
          );
          setNearbyMetroProperties(
            sameTypeFiltered.length > 0
              ? sameTypeFiltered.slice(0, 4)
              : fallbackSimilar.slice(0, 4)
          );

          // Create recommended based on property type or fallback to any properties
          const recommended =
            sameTypeFiltered.length > 0
              ? sameTypeFiltered.slice(0, 4)
              : fallbackSimilar.slice(0, 4);
          setRecommendedProperties(recommended);

          console.log("📊 Property categories populated:", {
            total: fallbackSimilar.length,
            priceRange: priceRangeFiltered.length,
            location: locationFiltered.length,
            sameArea: sameAreaFiltered.length,
            sameBHK: sameBHKFiltered.length,
            similarSize: similarSizeFiltered.length,
            sameBuilder: sameBuilderFiltered.length,
            recommended: recommended.length,
          });
        } else {
          console.log("⚠️ No similar properties found at all");
        }

        // Fetch nearby properties
        setLoadingNearby(true);
        const nearbyResult = await getNearbyProperties(propertyResult.data, 6);
        if (nearbyResult.success) {
          setNearbyProperties(nearbyResult.data);
        }
        setLoadingNearby(false);

        // Check if property is in user's favorites
        if (user) {
          const favoritesResult = await getUserFavorites(user.uid);
          if (favoritesResult.success) {
            const isFav = favoritesResult.data.some(
              (fav) => fav.property_id === id
            );
            setIsFavorite(isFav);
          }
        }
      } catch (error) {
        console.error("Error fetching property data:", error);
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
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const nextImage = () => {
    if (!property?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!property?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  // Contact form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to send a message");
      return;
    }

    if (!messageForm.name || !messageForm.email || !messageForm.message) {
      alert("Please fill in all required fields");
      return;
    }

    setSendingMessage(true);
    try {
      const leadData = {
        name: messageForm.name,
        email: messageForm.email,
        phone: messageForm.phone || "",
        message: messageForm.message,
        property_id: property.id,
        source: "property_details_page",
        priority: "medium",
        status: "new",
        location: property.address,
        requirements: `Interested in: ${property.title} - ${property.address}`,
        user_id: user.uid,
      };

      const result = await addLead(property.user_id, leadData);

      if (result.success) {
        setMessageSent(true);
        alert("Message sent successfully! The agent will contact you soon.");

        setTimeout(() => {
          setMessageSent(false);
          setShowContactModal(false);
        }, 3000);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Schedule visit handlers
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to schedule a visit");
      return;
    }

    if (!scheduleForm.date || !scheduleForm.time) {
      alert("Please select date and time");
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
        status: "pending",
        property_title: property.title,
        property_address: property.address,
      };

      const result = await scheduleTour(tourData);

      if (result.success) {
        setVisitScheduled(true);
        alert(
          "Visit scheduled successfully! The agent will confirm your appointment."
        );

        setTimeout(() => {
          setVisitScheduled(false);
          setShowScheduleModal(false);
        }, 3000);
      } else {
        alert("Failed to schedule visit. Please try again.");
      }
    } catch (error) {
      console.error("Error scheduling visit:", error);
      alert("Failed to schedule visit. Please try again.");
    } finally {
      setSchedulingVisit(false);
    }
  };

  // Mortgage calculator
  const calculateMortgage = () => {
    const { loanAmount, interestRate, loanTerm } = mortgageData;

    if (!loanAmount || !interestRate || !loanTerm) {
      alert("Please fill in all mortgage details");
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;

    setMortgageResult({
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    });
  };

  // Favorite handlers
  const handleFavoriteToggle = async () => {
    if (!user) {
      alert("Please login to save properties");
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
      console.error("Error toggling favorite:", error);
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this amazing property: ${property.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Check if current user is the property owner
  const isPropertyOwner = user && property && user.uid === property.user_id;

  // Loading and error states
  if (loading) {
    return <Loading message="Loading property details..." fullScreen />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Property Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The property you are looking for might have been removed or the link
            is incorrect.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
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
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          40%,
          43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }

        .slide-in-up {
          animation: slideInUp 0.8s ease-out forwards;
        }

        .slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .pulse-animation {
          animation: pulse 2s infinite;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }

        .bounce-in {
          animation: bounce 1s ease-out forwards;
        }

        .stagger-children > * {
          opacity: 0;
          animation: slideInUp 0.6s ease-out forwards;
        }

        .stagger-children > *:nth-child(1) {
          animation-delay: 0.1s;
        }
        .stagger-children > *:nth-child(2) {
          animation-delay: 0.2s;
        }
        .stagger-children > *:nth-child(3) {
          animation-delay: 0.3s;
        }
        .stagger-children > *:nth-child(4) {
          animation-delay: 0.4s;
        }
        .stagger-children > *:nth-child(5) {
          animation-delay: 0.5s;
        }
        .stagger-children > *:nth-child(6) {
          animation-delay: 0.6s;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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

        .image-gallery {
          position: relative;
          overflow: hidden;
        }

        .image-gallery::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
          z-index: 1;
        }

        .image-gallery:hover::before {
          left: 100%;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Floating Back Button */}
        <div
          className={`fixed top-6 left-6 z-50 transition-all duration-500 ${
            animationTrigger ? "slide-in-left" : "opacity-0"
          }`}
        >
          <button
            onClick={() => navigate(-1)}
            className="interactive-button bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Floating Action Buttons */}
        <div
          className={`fixed top-6 right-6 z-50 flex gap-3 transition-all duration-500 ${
            animationTrigger ? "slide-in-right" : "opacity-0"
          }`}
        >
          <button
            onClick={handleFavoriteToggle}
            className={`interactive-button p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={handleShare}
            className="interactive-button bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl text-gray-700"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Hero Image Gallery */}
        <div
          className={`relative h-[70vh] overflow-hidden transition-all duration-1000 ${
            animationTrigger ? "scale-in" : "opacity-0"
          }`}
        >
          <div className="image-gallery h-full">
            {property.images && property.images.length > 0 ? (
              <div className="relative h-full">
                <img
                  src={property.images[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                />

                {/* Image Navigation */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 interactive-button bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 interactive-button bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? "bg-white scale-125"
                              : "bg-white/50 hover:bg-white/75"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* View Gallery Button */}
                <button
                  onClick={() => setIsImageGalleryOpen(true)}
                  className="absolute bottom-6 right-6 interactive-button bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    View All ({property.images.length})
                  </span>
                </button>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No images available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Information */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Header */}
              <div
                className={`transition-all duration-800 ${
                  animationTrigger ? "slide-in-left" : "opacity-0"
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span className="text-lg">{property.address}</span>
                    </div>
                    <div className="text-3xl font-bold gradient-text">
                      {formatPrice(property.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{viewCount || 0} views</span>
                    </div>
                    {viewGrowth > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>+{viewGrowth}%</span>
                      </div>
                    )}
                    {viewCount > 0 && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Activity className="h-4 w-4" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl stagger-children">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bed className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.bedrooms || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bath className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.bathrooms || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Square className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.area || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Home className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.property_type || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div
                className={`transition-all duration-800 delay-200 ${
                  animationTrigger ? "slide-in-left" : "opacity-0"
                }`}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <p
                    className={`text-gray-700 leading-relaxed ${
                      !showFullDescription ? "line-clamp-4" : ""
                    }`}
                  >
                    {property.description ||
                      "No description available for this property."}
                  </p>
                  {property.description &&
                    property.description.length > 200 && (
                      <button
                        onClick={() =>
                          setShowFullDescription(!showFullDescription)
                        }
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                      >
                        {showFullDescription ? "Show Less" : "Read More"}
                      </button>
                    )}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div
                  className={`transition-all duration-800 delay-300 ${
                    animationTrigger ? "slide-in-left" : "opacity-0"
                  }`}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Amenities
                  </h2>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
                      {property.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover-lift"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-gray-700 font-medium">
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Property Specifications */}
              <div className="transition-all duration-800 delay-400">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Property Specifications
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Property Type</span>
                        <span className="font-semibold capitalize">
                          {property.property_type || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Built Year</span>
                        <span className="font-semibold">
                          {property.built_year ||
                            new Date().getFullYear() -
                              (property.age_of_property || 5)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Floor</span>
                        <span className="font-semibold">
                          {property.floor || "Ground"} of{" "}
                          {property.total_floors || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Facing</span>
                        <span className="font-semibold capitalize">
                          {property.facing || "North"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Furnishing</span>
                        <span className="font-semibold capitalize">
                          {property.furnishing || "Unfurnished"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Parking</span>
                        <span className="font-semibold">
                          {property.parking || 0} spaces
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Carpet Area</span>
                        <span className="font-semibold">
                          {property.carpet_area || property.area || "N/A"} sq ft
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Built-up Area</span>
                        <span className="font-semibold">
                          {property.built_up_area || property.area || "N/A"} sq
                          ft
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Balconies</span>
                        <span className="font-semibold">
                          {property.balconies || 0}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Availability</span>
                        <span className="font-semibold capitalize">
                          {property.availability || "Immediate"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Price per sq ft</span>
                        <span className="font-semibold">
                          ₹
                          {property.area
                            ? Math.round(
                                property.price / property.area
                              ).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Possession</span>
                        <span className="font-semibold">
                          {property.possession_date
                            ? new Date(
                                property.possession_date
                              ).toLocaleDateString()
                            : "Ready to move"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floor Plans */}
              <div className="transition-all duration-800 delay-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Floor Plans
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {property.floor_plans && property.floor_plans.length > 0 ? (
                      property.floor_plans.map((plan, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-xl p-4"
                        >
                          <img
                            src={plan.image}
                            alt={`Floor Plan ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-semibold text-lg mb-2">
                            {plan.name || `Plan ${index + 1}`}
                          </h3>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>
                              {plan.bedrooms || property.bedrooms} BHK
                            </span>
                            <span>{plan.area || property.area} sq ft</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">
                          Floor plans will be available soon
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location & Neighborhood */}
              <div className="transition-all duration-800 delay-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Location & Neighborhood
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="mb-6">
                    {/* Interactive Map */}
                    <div className="bg-gray-100 rounded-xl h-80 relative overflow-hidden mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                        {/* Map placeholder with property marker */}
                        <div className="absolute inset-4 bg-white rounded-lg shadow-inner flex items-center justify-center">
                          <div className="text-center">
                            <div className="relative">
                              <MapPin className="h-16 w-16 text-red-500 mx-auto mb-2 animate-bounce" />
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                            </div>
                            <p className="font-semibold text-gray-800 mb-1">
                              {property.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {property.address}
                            </p>
                            <div className="mt-3 flex justify-center gap-2">
                              <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-700 transition-colors">
                                Street View
                              </button>
                              <button className="bg-green-600 text-white px-3 py-1 rounded-full text-xs hover:bg-green-700 transition-colors">
                                Satellite
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Map controls */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
                            <span className="text-lg font-bold">+</span>
                          </button>
                          <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
                            <span className="text-lg font-bold">-</span>
                          </button>
                        </div>

                        {/* Distance markers */}
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Metro - 1.5km</span>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>School - 0.8km</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Hospital - 2.1km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Map Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-blue-700">Transport</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-700">
                          Education
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-700">Healthcare</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-purple-700">
                          Shopping
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Hospital className="h-5 w-5 mr-2 text-red-500" />
                        Healthcare
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>City Hospital</span>
                          <span className="text-gray-500">2.5 km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Medical Center</span>
                          <span className="text-gray-500">1.8 km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pharmacy</span>
                          <span className="text-gray-500">0.5 km</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                        Education
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>International School</span>
                          <span className="text-gray-500">1.2 km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Public School</span>
                          <span className="text-gray-500">0.8 km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>University</span>
                          <span className="text-gray-500">5.2 km</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2 text-green-500" />
                        Shopping
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Shopping Mall</span>
                          <span className="text-gray-500">3.1 km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Supermarket</span>
                          <span className="text-gray-500">0.7 km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Local Market</span>
                          <span className="text-gray-500">0.3 km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transportation */}
              <div className="transition-all duration-800 delay-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Transportation
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Train className="h-5 w-5 mr-2 text-blue-600" />
                        Public Transport
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Train className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">Metro Station</span>
                          </div>
                          <span className="text-sm text-gray-500">1.5 km</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Bus className="h-4 w-4 mr-2 text-green-600" />
                            <span className="text-sm">Bus Stop</span>
                          </div>
                          <span className="text-sm text-gray-500">0.2 km</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Car className="h-5 w-5 mr-2 text-gray-600" />
                        Road Connectivity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">City Center</span>
                          <span className="text-sm text-gray-500">15 min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">Airport</span>
                          <span className="text-sm text-gray-500">45 min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">Highway</span>
                          <span className="text-sm text-gray-500">5 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price History & Market Trends */}
              <div className="transition-all duration-800 delay-800">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Price History & Market Trends
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                        Price History
                      </h3>
                      <div className="bg-gray-50 rounded-lg h-48 flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Price trend chart
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Market Insights
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm">Area Growth</span>
                          <span className="text-sm font-semibold text-green-600">
                            +12.5%
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm">Demand Index</span>
                          <span className="text-sm font-semibold text-blue-600">
                            High
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm">Investment Score</span>
                          <span className="text-sm font-semibold text-purple-600">
                            8.5/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal & Documentation */}
              <div className="transition-all duration-800 delay-900">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Legal & Documentation
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Property Documents
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm">Title Deed</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm">Approved Plan</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm">NOC</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm">
                            Completion Certificate
                          </span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-green-600" />
                        Verification Status
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm">RERA Approved</span>
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Verified
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm">Bank Loan Approved</span>
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Yes
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm">Legal Verification</span>
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Clear
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Virtual Tour & Media */}
              <div className="transition-all duration-800 delay-1000">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Virtual Tour & Media
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                        <p className="font-semibold mb-2">360° Virtual Tour</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Start Tour
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center">
                      <div className="text-center">
                        <Video className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                        <p className="font-semibold mb-2">Property Video</p>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                          Watch Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div
                className={`transition-all duration-800 delay-400 ${
                  animationTrigger ? "slide-in-right" : "opacity-0"
                }`}
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover-lift">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Contact Agent
                  </h3>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {propertyOwner?.photo_url ? (
                        <img
                          src={propertyOwner.photo_url}
                          alt="Owner"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {propertyOwner?.name ||
                          propertyOwner?.full_name ||
                          "Property Owner"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {propertyOwner?.email || "Contact via form"}
                      </div>
                      {propertyOwner?.user_type && (
                        <div className="text-xs text-blue-600 capitalize">
                          {propertyOwner.user_type}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="w-full interactive-button bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Send Message
                    </button>

                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="w-full interactive-button bg-gray-100 text-gray-900 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Calendar className="h-5 w-5" />
                      Schedule Visit
                    </button>

                    <button
                      onClick={() => setShowMortgageCalculator(true)}
                      className="w-full interactive-button bg-green-100 text-green-900 py-3 px-4 rounded-xl font-semibold hover:bg-green-200 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Calculator className="h-5 w-5" />
                      Mortgage Calculator
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div
                className={`transition-all duration-800 delay-500 ${
                  animationTrigger ? "slide-in-right" : "opacity-0"
                }`}
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover-lift">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Property Stats
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total views</span>
                      <span className="font-semibold text-gray-900">
                        {viewCount || 0}
                      </span>
                    </div>

                    {propertyViews && propertyViews.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Recent activity</span>
                        <span className="font-semibold text-green-600">
                          {propertyViews.length} recent views
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price per sq ft</span>
                      <span className="font-semibold text-gray-900">
                        {property.area
                          ? `₹${Math.round(property.price / property.area)}`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Listed on</span>
                      <span className="font-semibold text-gray-900">
                        {property.created_at
                          ? new Date(property.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    {viewGrowth > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Interest growth</span>
                        <span className="font-semibold text-green-600">
                          +{viewGrowth}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* EMI Calculator */}
              <div className="transition-all duration-800 delay-500">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover-lift">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-green-600" />
                    EMI Calculator
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Amount
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`₹${Math.round(
                          property.price * 0.8
                        ).toLocaleString()}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="8.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Tenure (Years)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹45,678
                        </div>
                        <div className="text-sm text-gray-600">Monthly EMI</div>
                      </div>
                    </div>

                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200">
                      Calculate EMI
                    </button>
                  </div>
                </div>
              </div>

              {/* Investment Analysis */}
              <div className="transition-all duration-800 delay-600">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover-lift">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    Investment Analysis
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Expected Appreciation
                      </span>
                      <span className="font-semibold text-green-600">
                        +8-12% annually
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rental Yield</span>
                      <span className="font-semibold text-blue-600">
                        3.2% annually
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Investment Score</span>
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-4 w-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          4.5/5
                        </span>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          Excellent Investment
                        </div>
                        <div className="text-sm text-gray-600">
                          High growth potential area
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety & Security */}
              <div className="transition-all duration-800 delay-700">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover-lift">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Safety & Security
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">24/7 Security</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Available
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">CCTV Surveillance</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Available
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">Fire Safety</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Certified
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm">Gated Community</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Yes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="transition-all duration-800 delay-800">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover-lift">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Quick Actions
                  </h3>

                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      <Download className="h-4 w-4" />
                      Download Brochure
                    </button>

                    <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200">
                      <Phone className="h-4 w-4" />
                      Request Callback
                    </button>

                    <button className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                      <Share className="h-4 w-4" />
                      Share Property
                    </button>

                    <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Bookmark className="h-4 w-4" />
                      Save to Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Enhanced Similar Properties with Multiple Categories */}
          <div className="mt-16 space-y-16">
            {/* Properties in Similar Price Range */}
            {priceRangeProperties.length > 0 && (
              <div
                className={`transition-all duration-800 delay-600 ${
                  animationTrigger ? "slide-in-up" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Properties in Similar Price Range
                  </h2>
                  <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                    ₹{formatPrice(property.price * 0.8)} - ₹
                    {formatPrice(property.price * 1.2)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {priceRangeProperties.slice(0, 6).map((similarProperty) => (
                    <Link
                      key={similarProperty.id}
                      to={`/property/${similarProperty.id}`}
                      className="group hover-lift"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={
                              similarProperty.images?.[0] ||
                              "/placeholder-property.jpg"
                            }
                            alt={similarProperty.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Similar Price
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                            {similarProperty.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {similarProperty.address}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xl font-bold gradient-text">
                              {formatPrice(similarProperty.price)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{similarProperty.bedrooms}BR</span>
                              <span>{similarProperty.area} sq ft</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {similarProperty.property_type}
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {similarProperty.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Properties in Same Location */}
            {locationBasedProperties.length > 0 && (
              <div
                className={`transition-all duration-800 delay-700 ${
                  animationTrigger ? "slide-in-up" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Properties in Same Area
                  </h2>
                  <div className="text-sm text-gray-500 bg-purple-50 px-3 py-1 rounded-full">
                    {property.city} • {property.locality}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locationBasedProperties
                    .slice(0, 6)
                    .map((similarProperty) => (
                      <Link
                        key={similarProperty.id}
                        to={`/property/${similarProperty.id}`}
                        className="group hover-lift"
                      >
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="aspect-video overflow-hidden relative">
                            <img
                              src={
                                similarProperty.images?.[0] ||
                                "/placeholder-property.jpg"
                              }
                              alt={similarProperty.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                Same Area
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                              {similarProperty.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {similarProperty.address}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xl font-bold gradient-text">
                                {formatPrice(similarProperty.price)}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{similarProperty.bedrooms}BR</span>
                                <span>{similarProperty.area} sq ft</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                {similarProperty.property_type}
                              </span>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {similarProperty.views || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Recommended Properties */}
            {recommendedProperties.length > 0 && (
              <div
                className={`transition-all duration-800 delay-800 ${
                  animationTrigger ? "slide-in-up" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Recommended for You
                  </h2>
                  <div className="text-sm text-gray-500 bg-yellow-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    Personalized
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedProperties.map((similarProperty) => (
                    <Link
                      key={similarProperty.id}
                      to={`/property/${similarProperty.id}`}
                      className="group hover-lift"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={
                              similarProperty.images?.[0] ||
                              "/placeholder-property.jpg"
                            }
                            alt={similarProperty.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Recommended
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1 text-sm">
                            {similarProperty.title}
                          </h3>
                          <p className="text-gray-600 text-xs mb-2 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {similarProperty.address}
                          </p>
                          <div className="text-lg font-bold gradient-text mb-2">
                            {formatPrice(similarProperty.price)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              {similarProperty.property_type}
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {similarProperty.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* Properties in Same Area/Locality */}
            {sameAreaProperties.length > 0 && (
              <div
                className={`transition-all duration-800 delay-900 ${
                  animationTrigger ? "slide-in-up" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Properties in Same Locality
                  </h2>
                  <div className="text-sm text-gray-500 bg-indigo-50 px-3 py-1 rounded-full">
                    {property.locality || property.city}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sameAreaProperties.map((similarProperty) => (
                    <Link
                      key={similarProperty.id}
                      to={`/property/${similarProperty.id}`}
                      className="group hover-lift"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={
                              similarProperty.images?.[0] ||
                              "/placeholder-property.jpg"
                            }
                            alt={similarProperty.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Same Locality
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                            {similarProperty.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {similarProperty.address}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xl font-bold gradient-text">
                              {formatPrice(similarProperty.price)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{similarProperty.bedrooms}BR</span>
                              <span>{similarProperty.area} sq ft</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                              {similarProperty.property_type}
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {similarProperty.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Properties with Same BHK Configuration */}
            {sameBHKProperties.length > 0 && (
              <div
                className={`transition-all duration-800 delay-1000 ${
                  animationTrigger ? "slide-in-up" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Same BHK Configuration
                  </h2>
                  <div className="text-sm text-gray-500 bg-teal-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {property.bedrooms}BHK • {property.bathrooms} Bath
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sameBHKProperties.map((similarProperty) => (
                    <Link
                      key={similarProperty.id}
                      to={`/property/${similarProperty.id}`}
                      className="group hover-lift"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={
                              similarProperty.images?.[0] ||
                              "/placeholder-property.jpg"
                            }
                            alt={similarProperty.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-teal-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Same BHK
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                            {similarProperty.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {similarProperty.address}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xl font-bold gradient-text">
                              {formatPrice(similarProperty.price)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{similarProperty.bedrooms}BR</span>
                              <span>{similarProperty.bathrooms}BA</span>
                              <span>{similarProperty.area} sq ft</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                              {similarProperty.property_type}
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {similarProperty.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Properties with Similar Size */}
            {similarSizeProperties.length > 0 && (
              <div
                className={`transition-all duration-800 delay-1100 ${
                  animationTrigger ? "slide-in-up" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Similar Size Properties
                  </h2>
                  <div className="text-sm text-gray-500 bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    {property.area
                      ? `${property.area - 200} - ${property.area + 200}`
                      : "800 - 1200"}{" "}
                    sq ft
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarSizeProperties.map((similarProperty) => (
                    <Link
                      key={similarProperty.id}
                      to={`/property/${similarProperty.id}`}
                      className="group hover-lift"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={
                              similarProperty.images?.[0] ||
                              "/placeholder-property.jpg"
                            }
                            alt={similarProperty.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Similar Size
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                            {similarProperty.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {similarProperty.address}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xl font-bold gradient-text">
                              {formatPrice(similarProperty.price)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{similarProperty.bedrooms}BR</span>
                              <span className="font-semibold text-orange-600">
                                {similarProperty.area} sq ft
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              {similarProperty.property_type}
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {similarProperty.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Properties by Same Builder */}
            {sameBuilderProperties.length > 0 && (
              <div
                className={`transition-all duration-800 delay-1200 ${
                  animationTrigger ? "slide-in-up" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    More from Same Builder
                  </h2>
                  <div className="text-sm text-gray-500 bg-pink-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {property.builder || "Premium Builder"}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sameBuilderProperties.map((similarProperty) => (
                    <Link
                      key={similarProperty.id}
                      to={`/property/${similarProperty.id}`}
                      className="group hover-lift"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={
                              similarProperty.images?.[0] ||
                              "/placeholder-property.jpg"
                            }
                            alt={similarProperty.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Same Builder
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1 text-sm">
                            {similarProperty.title}
                          </h3>
                          <p className="text-gray-600 text-xs mb-2 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {similarProperty.address}
                          </p>
                          <div className="text-lg font-bold gradient-text mb-2">
                            {formatPrice(similarProperty.price)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                              {similarProperty.property_type}
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {similarProperty.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Properties Near Metro */}
            {nearbyMetroProperties.length > 0 && (
              <div
                className={`transition-all duration-800 delay-1300 ${
                  animationTrigger ? "slide-in-up" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Properties Near Metro
                  </h2>
                  <div className="text-sm text-gray-500 bg-cyan-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Train className="h-3 w-3" />
                    Within 2km of Metro
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {nearbyMetroProperties.map((similarProperty) => (
                    <Link
                      key={similarProperty.id}
                      to={`/property/${similarProperty.id}`}
                      className="group hover-lift"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={
                              similarProperty.images?.[0] ||
                              "/placeholder-property.jpg"
                            }
                            alt={similarProperty.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-cyan-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Near Metro
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-cyan-700">
                              {similarProperty.metro_distance
                                ? `${(
                                    similarProperty.metro_distance / 1000
                                  ).toFixed(1)}km`
                                : "1.5km"}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1 text-sm">
                            {similarProperty.title}
                          </h3>
                          <p className="text-gray-600 text-xs mb-2 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {similarProperty.address}
                          </p>
                          <div className="text-lg font-bold gradient-text mb-2">
                            {formatPrice(similarProperty.price)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">
                              {similarProperty.property_type}
                            </span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {similarProperty.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comprehensive Footer Sections */}
          <div className="mt-20 space-y-16">
            {/* Area Statistics & Demographics */}
            <div
              className={`transition-all duration-800 delay-900 ${
                animationTrigger ? "slide-in-up" : "opacity-0"
              }`}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Area Statistics & Demographics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    45,000+
                  </div>
                  <div className="text-sm text-gray-600">Population</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    12.5%
                  </div>
                  <div className="text-sm text-gray-600">Annual Growth</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ₹8.5L
                  </div>
                  <div className="text-sm text-gray-600">Avg. Income</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    4.2/5
                  </div>
                  <div className="text-sm text-gray-600">Livability Score</div>
                </div>
              </div>
            </div>

            {/* Future Development Projects */}
            <div
              className={`transition-all duration-800 delay-1000 ${
                animationTrigger ? "slide-in-up" : "opacity-0"
              }`}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Upcoming Development Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Train className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Metro Extension
                      </h3>
                      <p className="text-sm text-gray-600">
                        Phase 3 Development
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    New metro line connecting to city center, reducing travel
                    time by 40%.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      2025 Completion
                    </span>
                    <span className="text-xs text-gray-500">2.1 km away</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Mega Mall</h3>
                      <p className="text-sm text-gray-600">Shopping Complex</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    5-story shopping mall with 200+ brands and entertainment
                    zone.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      2024 Opening
                    </span>
                    <span className="text-xs text-gray-500">1.8 km away</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <TreePine className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Central Park
                      </h3>
                      <p className="text-sm text-gray-600">Green Space</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    50-acre central park with jogging tracks, playground, and
                    lake.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      2026 Launch
                    </span>
                    <span className="text-xs text-gray-500">0.9 km away</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Government Schemes & Benefits */}
            <div
              className={`transition-all duration-800 delay-1100 ${
                animationTrigger ? "slide-in-up" : "opacity-0"
              }`}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Government Schemes & Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Home className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        PMAY Scheme
                      </h3>
                      <p className="text-sm text-blue-700">
                        Pradhan Mantri Awas Yojana
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Get up to ₹2.67 lakh subsidy on home loans under PMAY
                    scheme.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Max Subsidy</span>
                      <span className="font-semibold text-blue-600">
                        ₹2.67 Lakh
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Interest Rate</span>
                      <span className="font-semibold text-blue-600">
                        6.5% onwards
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Percent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Tax Benefits
                      </h3>
                      <p className="text-sm text-green-700">
                        Section 80C & 24B
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Save up to ₹3.5 lakh annually through various tax
                    deductions.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Principal Deduction</span>
                      <span className="font-semibold text-green-600">
                        ₹1.5 Lakh
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Interest Deduction</span>
                      <span className="font-semibold text-green-600">
                        ₹2 Lakh
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Market Insights */}
            <div
              className={`transition-all duration-800 delay-1200 ${
                animationTrigger ? "slide-in-up" : "opacity-0"
              }`}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Market Insights & Trends
              </h2>
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Price Trends
                    </h3>
                    <div className="bg-gray-50 rounded-xl h-48 flex items-center justify-center mb-4">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Price trend chart for last 12 months
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          +8.2%
                        </div>
                        <div className="text-xs text-gray-600">YoY Growth</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          ₹5,850
                        </div>
                        <div className="text-xs text-gray-600">
                          Avg. per sq ft
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          245
                        </div>
                        <div className="text-xs text-gray-600">
                          Properties Sold
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Market Analysis
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Demand</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: "85%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-green-600">
                            High
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Supply</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">
                            Medium
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">
                            Investment Score
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: "90%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-purple-600">
                            Excellent
                          </span>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-800">
                            Expert Insight
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          This area shows strong growth potential with upcoming
                          infrastructure projects. Property values are expected
                          to appreciate by 15-20% over the next 2 years.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Support Footer */}
            <div
              className={`transition-all duration-800 delay-1300 ${
                animationTrigger ? "slide-in-up" : "opacity-0"
              }`}
            >
              <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">+91 98765 43210</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">support@easyprop.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">24/7 Support</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                    <div className="space-y-2">
                      <a
                        href="#"
                        className="block text-sm hover:text-blue-300 transition-colors"
                      >
                        Property Valuation
                      </a>
                      <a
                        href="#"
                        className="block text-sm hover:text-blue-300 transition-colors"
                      >
                        Home Loan Calculator
                      </a>
                      <a
                        href="#"
                        className="block text-sm hover:text-blue-300 transition-colors"
                      >
                        Legal Assistance
                      </a>
                      <a
                        href="#"
                        className="block text-sm hover:text-blue-300 transition-colors"
                      >
                        Property Management
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Services</h3>
                    <div className="space-y-2">
                      <a
                        href="#"
                        className="block text-sm hover:text-blue-300 transition-colors"
                      >
                        Buy Property
                      </a>
                      <a
                        href="#"
                        className="block text-sm hover:text-blue-300 transition-colors"
                      >
                        Sell Property
                      </a>
                      <a
                        href="#"
                        className="block text-sm hover:text-blue-300 transition-colors"
                      >
                        Rent Property
                      </a>
                      <a
                        href="#"
                        className="block text-sm hover:text-blue-300 transition-colors"
                      >
                        Property Investment
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
                    <p className="text-sm mb-4">
                      Get latest property updates and market insights
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Your email"
                        className="flex-1 px-3 py-2 rounded-lg text-gray-900 text-sm"
                      />
                      <button className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/20 mt-8 pt-8 text-center">
                  <p className="text-sm opacity-80">
                    © 2024 EasyProp. All rights reserved. | Privacy Policy |
                    Terms of Service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Send Message
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={messageForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={messageForm.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={messageForm.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={messageForm.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="w-full interactive-button bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {sendingMessage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Schedule Visit
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    value={scheduleForm.time}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select time</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          visitType: "physical",
                        }))
                      }
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        scheduleForm.visitType === "physical"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Home className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Physical</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          visitType: "virtual",
                        }))
                      }
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        scheduleForm.visitType === "virtual"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Video className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Virtual</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    value={scheduleForm.message}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={schedulingVisit}
                  className="w-full interactive-button bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {schedulingVisit ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5" />
                      Schedule Visit
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mortgage Calculator Modal */}
      {showMortgageCalculator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Mortgage Calculator
                </h3>
                <button
                  onClick={() => setShowMortgageCalculator(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <input
                      type="number"
                      value={mortgageData.loanAmount}
                      onChange={(e) =>
                        setMortgageData((prev) => ({
                          ...prev,
                          loanAmount: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={mortgageData.interestRate}
                      onChange={(e) =>
                        setMortgageData((prev) => ({
                          ...prev,
                          interestRate: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Term (Years)
                    </label>
                    <input
                      type="number"
                      value={mortgageData.loanTerm}
                      onChange={(e) =>
                        setMortgageData((prev) => ({
                          ...prev,
                          loanTerm: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Down Payment
                    </label>
                    <input
                      type="number"
                      value={mortgageData.downPayment}
                      onChange={(e) =>
                        setMortgageData((prev) => ({
                          ...prev,
                          downPayment: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateMortgage}
                  className="w-full interactive-button bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Calculator className="h-5 w-5" />
                  Calculate
                </button>

                {mortgageResult && (
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h4 className="font-bold text-gray-900 mb-4">
                      Calculation Results
                    </h4>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Monthly Payment</span>
                        <span className="font-bold text-gray-900">
                          ₹
                          {mortgageResult.monthlyPayment.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Payment</span>
                        <span className="font-bold text-gray-900">
                          ₹{mortgageResult.totalPayment.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Interest</span>
                        <span className="font-bold text-gray-900">
                          ₹
                          {mortgageResult.totalInterest.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {isImageGalleryOpen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setIsImageGalleryOpen(false)}
            className="absolute top-6 right-6 z-10 p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="w-full h-full flex items-center justify-center p-6">
            <img
              src={property.images?.[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {property.images && property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PropertyDetails;
