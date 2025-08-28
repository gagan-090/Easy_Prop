import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, Home, User, Phone, Building } from "lucide-react";

// This component handles both login and registration based on the URL path
// /login -> shows login form
// /register -> shows registration form with OTP verification

const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const registerSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .test(
      "phone-format",
      "Phone number must be 10 digits starting with 6-9",
      function (value) {
        if (!value) return false;
        // Remove spaces, dashes, and +91 prefix properly
        let cleaned = value.replace(/[\s\-]/g, ""); // Remove spaces and dashes
        if (cleaned.startsWith("+91")) {
          cleaned = cleaned.substring(3); // Remove +91 prefix
        }
        // Check if it's exactly 10 digits starting with 6-9
        return /^[6-9]\d{9}$/.test(cleaned);
      }
    )
    .transform((value) => {
      if (!value) return value;
      // Remove spaces, dashes, and +91 prefix properly, then add +91
      let cleaned = value.replace(/[\s\-]/g, ""); // Remove spaces and dashes
      if (cleaned.startsWith("+91")) {
        cleaned = cleaned.substring(3); // Remove +91 prefix
      }
      return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)
        ? `+91${cleaned}`
        : value;
    }),
  company: yup.string(),
  userType: yup
    .string()
    .required("Please select your role")
    .oneOf(["agent", "owner"], "Please select either Agent or Owner"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  terms: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions"),
  otp: yup.string().length(6, "OTP must be 6 digits"),
});

const Login = () => {
  const location = useLocation();
  const [isRegisterMode, setIsRegisterMode] = useState(
    location.pathname === "/register"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const auth = useAuth();
  const { login, signInWithGoogle, isAuthenticated, loading } = auth;
  const navigate = useNavigate();

  // Memoized resolver to prevent form re-initialization
  const formResolver = useMemo(() => {
    return isRegisterMode ? yupResolver(registerSchema) : yupResolver(loginSchema);
  }, [isRegisterMode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger,
    getValues,
  } = useForm({
    resolver: formResolver, // Use dynamic resolver based on mode
  });

  const watchedUserType = watch("userType");
  const watchedEmail = watch("email");
  const watchedOtp = watch("otp");

  // Handle mobile viewport height issues
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Debounced toggle function to prevent rapid clicking
  const handleToggleMode = useCallback(() => {
    if (isToggling) return;

    setIsToggling(true);
    setIsRegisterMode((prevMode) => !prevMode);

    // Scroll to top when toggling modes for better UX
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(() => {
      setIsToggling(false);
    }, 500);
  }, [isToggling]);

  // Update URL when mode changes
  useEffect(() => {
    const newPath = isRegisterMode ? "/register" : "/login";
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [isRegisterMode, navigate, location.pathname]);

  // Reset form and states when switching modes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Resetting form for mode:', isRegisterMode);
      reset();
      setOtpSent(false);
      setEmailExists(false);
      setEmailValid(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setRememberMe(false);
    }, 100); // Small delay to prevent rapid resets

    return () => clearTimeout(timeoutId);
  }, [isRegisterMode, reset]);

  // Reset OTP states when email changes (debounced)
  useEffect(() => {
    if (!isRegisterMode) return;

    const timeoutId = setTimeout(() => {
      setOtpSent(false);
      setEmailExists(false);
      setEmailValid(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [watchedEmail, isRegisterMode]);

  // Check email validity and auto-send OTP for registration (optimized)
  useEffect(() => {
    console.log('OTP Effect triggered:', {
      isRegisterMode,
      watchedEmail,
      hasEmailError: !!errors.email,
      otpSent,
      emailExists,
      isLoading
    });

    if (
      !isRegisterMode ||
      !watchedEmail ||
      errors.email ||
      otpSent ||
      emailExists ||
      isLoading
    ) {
      return;
    }

    const checkEmailAndSendOTP = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(watchedEmail)) {
        setEmailValid(false);
        return;
      }

      setEmailValid(true);
      setIsLoading(true);

      try {
        console.log('Automatically sending OTP to:', watchedEmail);
        const userName = getValues("name") || "User";
        const result = await auth.sendEmailOTP(watchedEmail, userName);

        console.log('OTP send result:', result);

        if (result.success) {
          setOtpSent(true);
          setEmailExists(false);
          toast.success(`OTP sent to ${watchedEmail}! Check your email.`);
        } else {
          setOtpSent(false);
          if (
            result.error.includes("already registered") ||
            result.error.includes("already in use") ||
            result.error.includes("already exists")
          ) {
            setEmailExists(true);
            toast.error("User already exists! Redirecting to login...");
            setTimeout(() => setIsRegisterMode(false), 2000);
          } else {
            toast.error(result.error);
          }
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        setOtpSent(false);
        toast.error("Failed to send OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    // Reduced debounce for better user experience
    const timeoutId = setTimeout(checkEmailAndSendOTP, 500);
    return () => clearTimeout(timeoutId);
  }, [
    watchedEmail,
    errors.email,
    otpSent,
    emailExists,
    isRegisterMode,
    isLoading,
    auth,
    getValues,
  ]);

  // Manual OTP sending function
  const handleSendOTP = async () => {
    const email = getValues("email");
    const name = getValues("name");
    
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!name) {
      toast.error("Please enter your name first.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Manually sending OTP to:', email);
      const result = await auth.sendEmailOTP(email, name);
      
      if (result.success) {
        setOtpSent(true);
        setEmailExists(false);
        setEmailValid(true);
        toast.success(`OTP sent to ${email}! Check your email.`);
      } else {
        if (
          result.error.includes("already registered") ||
          result.error.includes("already in use") ||
          result.error.includes("already exists")
        ) {
          setEmailExists(true);
          toast.error("User already exists! Redirecting to login...");
          setTimeout(() => setIsRegisterMode(false), 2000);
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const userName = getValues("name") || "User";
      const result = await auth.sendEmailOTP(email, userName);
      if (result.success) {
        toast.success("OTP resent successfully! Check your email.");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.state]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Home className="h-16 w-16 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading EasyProp...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we check your authentication
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    console.log('Current state:', { isRegisterMode, otpSent, emailValid, emailExists });

    // Validate form data
    if (isRegisterMode) {
      if (!data.name || !data.email || !data.phone || !data.userType || !data.password || !data.confirmPassword || !data.terms) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      // Strict OTP validation for registration
      if (!otpSent) {
        toast.error("Please wait for OTP to be sent automatically after email validation");
        return;
      }
      
      if (!watchedOtp || watchedOtp.length !== 6) {
        toast.error("Please enter the 6-digit OTP sent to your email");
        return;
      }
    } else {
      if (!data.email || !data.password) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setIsLoading(true);
    try {
      let result;

      if (isRegisterMode) {
        // Registration with OTP verification
        console.log('Processing registration with OTP:', data.otp);
        setIsVerifying(true);
        
        // Set flag to prevent automatic login during registration
        localStorage.setItem('registering_user', 'true');
        
        const { confirmPassword, terms, otp, ...userData } = data;
        result = await auth.registerWithEmailOTP(userData, otp);

        if (result.success) {
          toast.success("Registration successful! Welcome to EasyProp!");
          window.location.href = "/";
        } else {
          toast.error(result.error);
        }
        setIsVerifying(false);
      } else {
        // Login
        console.log('Processing login');
        result = await login(data.email, data.password);

        if (result.success) {
          toast.success("Welcome back!");
          window.location.href = "/";
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error(
        isRegisterMode ? "Registration error:" : "Login error:",
        error
      );
      toast.error(
        isRegisterMode
          ? "Registration failed. Please try again."
          : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success) {
        toast.success(result.message || "Welcome back!");
        window.location.href = "/";
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Luxury Property Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Luxury Apartment Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="asset\video\Futuristic_Skyscraper_Animation_Creation.mp4"
              type="video/mp4"
            />
            {/* Fallback image if video fails to load */}
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80"
              alt="Luxury Apartment"
              className="w-full h-full object-cover"
            />
          </video>

          {/* Video overlay for better text readability and luxury feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/15 via-transparent to-blue-900/10"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 leading-tight"></h1>
            <p className="text-xl opacity-90 mb-2">
              Schedule visit in just a few clicks
            </p>
            <p className="text-lg opacity-75">visits in just a few clicks</p>
          </div>

          {/* Pagination dots */}
          <div className="flex space-x-2">
            <div className="w-8 h-1 bg-white rounded-full"></div>
            <div className="w-2 h-1 bg-white/50 rounded-full"></div>
            <div className="w-2 h-1 bg-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Top Left Logo */}
        <div className="absolute top-8 left-8 z-20">
          <Link
            to="/"
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <Home className="h-8 w-8 mr-3" />
            <span className="text-2xl font-bold">EasyProp</span>
          </Link>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-16 bg-gradient-to-br from-gray-50 to-white relative min-h-screen lg:min-h-0">
        {/* Top Right Toggle Button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleToggleMode}
            disabled={isToggling}
            className="bg-gradient-to-r from-gray-900 to-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:from-black hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isToggling
              ? "Switching..."
              : isRegisterMode
              ? "Sign In"
              : "Sign Up"}
          </button>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-6 pt-16">
          <Link
            to="/"
            className="flex items-center text-gray-900 hover:text-gray-700 transition-colors"
          >
            <Home className="h-7 w-7 mr-2" />
            <span className="text-xl font-bold">EasyProp</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div
            className={`mx-auto w-full ${
              isRegisterMode ? "max-w-md" : "max-w-sm"
            }`}
          >
            {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                {isRegisterMode
                  ? "Join EasyProp Today!"
                  : "Welcome Back to EasyProp!"}
              </h1>
              <p className="text-gray-600 text-base">
                {isRegisterMode ? "Create your account" : "Sign in your account"}
              </p>
            </div>

            {/* Luxury Login Form */}
            <div className="overflow-y-auto max-h-[70vh] lg:max-h-none">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Registration Fields */}
                {isRegisterMode && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-800 mb-1.5"
                      >
                        <User className="inline h-4 w-4 mr-1" />
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        {...register("name")}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                          errors.name
                            ? "border-red-300 bg-red-50/50 focus:border-red-400"
                            : "border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-gray-900 hover:border-gray-300"
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-gray-800 mb-1.5"
                      >
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        {...register("phone")}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                          errors.phone
                            ? "border-red-300 bg-red-50/50 focus:border-red-400"
                            : "border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-gray-900 hover:border-gray-300"
                        }`}
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Company (Optional) */}
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-semibold text-gray-800 mb-1.5"
                      >
                        <Building className="inline h-4 w-4 mr-1" />
                        Company (Optional)
                      </label>
                      <input
                        id="company"
                        type="text"
                        autoComplete="organization"
                        {...register("company")}
                        className="w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-gray-900 hover:border-gray-300"
                        placeholder="Your company name"
                      />
                    </div>

                    {/* User Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                        I am a
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="relative">
                          <input
                            type="radio"
                            value="agent"
                            {...register("userType")}
                            className="sr-only"
                          />
                          <div
                            className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                              watchedUserType === "agent"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : errors.userType
                                ? "border-red-300"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="text-sm font-medium">Agent</span>
                          </div>
                        </label>
                        <label className="relative">
                          <input
                            type="radio"
                            value="owner"
                            {...register("userType")}
                            className="sr-only"
                          />
                          <div
                            className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                              watchedUserType === "owner"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : errors.userType
                                ? "border-red-300"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className="text-sm font-medium">Owner</span>
                          </div>
                        </label>
                      </div>
                      {errors.userType && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">
                          {errors.userType.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-semibold text-gray-800 mb-1.5"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          {...register("confirmPassword")}
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                            errors.confirmPassword
                              ? "border-red-300 bg-red-50/50 focus:border-red-400"
                              : "border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-gray-900 hover:border-gray-300"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3">
                      <input
                        id="terms"
                        type="checkbox"
                        {...register("terms")}
                        className={`mt-1 h-4 w-4 rounded border-2 transition-colors ${
                          errors.terms
                            ? "border-red-300 text-red-600 focus:ring-red-500"
                            : "border-gray-300 text-gray-900 focus:ring-gray-500"
                        }`}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-xs text-red-600 font-medium">
                        {errors.terms.message}
                      </p>
                    )}

                    {/* OTP Field - Always show in registration mode */}
                    <div>
                      <label
                        htmlFor="otp"
                        className="block text-sm font-semibold text-gray-800 mb-1.5"
                      >
                        Enter OTP
                      </label>
                      <div className="space-y-3">
                        <input
                          id="otp"
                          type="text"
                          maxLength="6"
                          {...register("otp")}
                          className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 text-center text-lg tracking-widest ${
                            errors.otp
                              ? "border-red-300 bg-red-50/50 focus:border-red-400"
                              : !otpSent
                              ? "border-gray-300 bg-gray-100 text-gray-500"
                              : "border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-gray-900 hover:border-gray-300"
                          }`}
                          placeholder={otpSent ? "000000" : "Waiting for OTP..."}
                          disabled={!otpSent}
                        />
                        <div className="flex justify-between items-center">
                          {otpSent ? (
                            <>
                              <p className="text-sm text-gray-600">
                                OTP sent to your email
                              </p>
                              <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={isLoading}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                              >
                                Resend OTP
                              </button>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">
                              {watchedEmail && !errors.email ? "Sending OTP..." : "Enter email to receive OTP"}
                            </p>
                          )}
                        </div>
                      </div>
                      {errors.otp && (
                        <p className="mt-1.5 text-xs text-red-600 font-medium">
                          {errors.otp.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-800 mb-1.5"
                  >
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                      errors.email
                        ? "border-red-300 bg-red-50/50 focus:border-red-400"
                        : emailExists && isRegisterMode
                        ? "border-yellow-300 bg-yellow-50/50 focus:border-yellow-400"
                        : "border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-gray-900 hover:border-gray-300"
                    }`}
                    placeholder={
                      isRegisterMode
                        ? "john.doe@example.com"
                        : "info.madhu786@gmail.com"
                    }
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                  {isRegisterMode && emailExists && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ This email is already registered. Redirecting to login...
                      </p>
                    </div>
                  )}
                  
                   {/* OTP Status Message - Only show success message */}
                   {isRegisterMode && otpSent && (
                     <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                       <p className="text-sm text-green-800 font-medium">
                         ✅ OTP sent to your email
                       </p>
                     </div>
                   )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-800 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...register("password")}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 ${
                        errors.password
                          ? "border-red-300 bg-red-50/50 focus:border-red-400"
                          : "border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-gray-900 hover:border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password - Only for Login */}
                {!isRegisterMode && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 text-gray-900 focus:ring-gray-500 border-gray-300 rounded transition-colors"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700 font-medium"
                      >
                        Remember Me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isLoading || 
                    isVerifying || 
                    (isRegisterMode && (!otpSent || !watchedOtp || watchedOtp?.length !== 6))
                  }
                  className={`w-full py-3 px-4 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                    isRegisterMode && (!otpSent || !watchedOtp || watchedOtp?.length !== 6)
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-800 focus:ring-gray-500 hover:shadow-xl"
                  }`}
                >
                  {isLoading || isVerifying ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {isRegisterMode
                        ? isVerifying
                          ? "Verifying OTP..."
                          : "Sending OTP..."
                        : "Signing in..."}
                    </div>
                  ) : isRegisterMode ? (
                    otpSent && watchedOtp && watchedOtp.length === 6 ? (
                      "Verify & Create Account"
                    ) : !otpSent ? (
                      "Waiting for OTP..."
                    ) : (
                      "Enter 6-digit OTP"
                    )
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              {/* Instant Login Divider */}
              <div className="mt-6 mb-5">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gradient-to-br from-gray-50 to-white text-gray-500 font-medium">
                      Instant Login
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white/95 backdrop-blur-sm text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600 mr-2"></div>
                  ) : (
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </button>

                <button
                  type="button"
                  disabled={true}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white/95 backdrop-blur-sm text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-4 w-4 mr-2 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </button>
              </div>

              {/* Toggle Link */}
              <p className="mt-6 text-center text-sm text-gray-600">
                {isRegisterMode
                  ? "Already have an account? "
                  : "Don't have any account? "}
                <button
                  onClick={handleToggleMode}
                  disabled={isToggling}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegisterMode ? "Sign In" : "Register"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
