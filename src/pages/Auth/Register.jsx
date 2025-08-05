import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Home,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const schema = yup.object({
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

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const registerUser = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchedEmail = watch("email");

  // Reset states when email changes
  useEffect(() => {
    setOtpSent(false);
    setEmailExists(false);
    setEmailValid(false);
  }, [watchedEmail]);

  // Check email validity and auto-send OTP
  useEffect(() => {
    const checkEmailAndSendOTP = async () => {
      if (watchedEmail && !errors.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(watchedEmail)) {
          setEmailValid(true);

          if (!otpSent && !emailExists) {
            setIsLoading(true);
            try {
              const userName = getValues("name") || "User";
              const result = await registerUser.sendEmailOTP(
                watchedEmail,
                userName
              );
              if (result.success) {
                setOtpSent(true);
                setEmailExists(false);
                toast.success(`OTP sent to ${watchedEmail}! Check your email.`);
              } else {
                setOtpSent(false);
                if (
                  result.error.includes("already registered") ||
                  result.error.includes("already in use")
                ) {
                  setEmailExists(true);
                }
                toast.error(result.error);
              }
            } catch (error) {
              console.error("Error sending OTP:", error);
              setOtpSent(false);
              toast.error("Failed to send OTP. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }
        } else {
          setEmailValid(false);
        }
      } else {
        setEmailValid(false);
      }
    };

    const timeoutId = setTimeout(checkEmailAndSendOTP, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedEmail, errors.email, otpSent, emailExists, registerUser]);

  const handleResendOTP = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const userName = getValues("name") || "User";
      const result = await registerUser.sendEmailOTP(email, userName);
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

  const handleVerifyAndRegister = async (data) => {
    setIsVerifying(true);
    try {
      const { confirmPassword, terms, otp, ...userData } = data;
      const result = await registerUser.registerWithEmailOTP(userData, otp);

      if (result.success) {
        toast.success("Registration successful! Please login to continue.");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 100);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error during verification/registration:", error);
      toast.error("Invalid OTP or registration failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await registerUser.signInWithGoogle();
      if (result.success) {
        toast.success("Registration successful! Please login to continue.");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 100);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <Link
            to="/"
            className="group flex items-center transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <Home className="h-12 w-12 text-primary-600 group-hover:text-primary-700 transition-colors" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
            <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              EasyProp
            </span>
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Join EasyProp
          </h2>
          <p className="text-gray-600 text-lg">
            Start your property journey today
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors relative group"
            >
              Sign in here
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div
          className="bg-white py-8 px-6 shadow-2xl rounded-3xl border border-gray-200 relative auth-form-container"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}
        >
          <form
            className="space-y-6 relative z-10"
            onSubmit={handleSubmit(handleVerifyAndRegister)}
          >
            <div className="grid grid-cols-1 gap-5">
              <div className="group">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User
                      className={`h-5 w-5 transition-colors ${
                        errors.name
                          ? "text-red-400"
                          : "text-gray-400 group-focus-within:text-primary-500"
                      }`}
                    />
                  </div>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...register("name")}
                    className={`pl-12 pr-4 py-3 w-full text-gray-900 placeholder-gray-400 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-primary-500 bg-gray-50 focus:bg-white"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="group">
                <label
                  htmlFor="userType"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Who are you? *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User
                      className={`h-5 w-5 transition-colors ${
                        errors.userType
                          ? "text-red-400"
                          : "text-gray-400 group-focus-within:text-primary-500"
                      }`}
                    />
                  </div>
                  <select
                    id="userType"
                    {...register("userType")}
                    className={`pl-12 pr-4 py-3 w-full text-gray-900 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 appearance-none bg-white ${
                      errors.userType
                        ? "border-red-300 focus:border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-primary-500 bg-gray-50 focus:bg-white"
                    }`}
                  >
                    <option value="">Select your role</option>
                    <option value="agent">Agent</option>
                    <option value="owner">Owner</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ArrowRight className="h-4 w-4 text-gray-400 rotate-90" />
                  </div>
                </div>
                {errors.userType && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.userType.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail
                        className={`h-5 w-5 transition-colors ${
                          errors.email
                            ? "text-red-400"
                            : emailValid
                            ? "text-green-500"
                            : "text-gray-400 group-focus-within:text-primary-500"
                        }`}
                      />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                      className={`pl-12 pr-4 py-3 w-full text-gray-900 placeholder-gray-400 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                        errors.email || emailExists
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : emailValid && !emailExists
                          ? "border-green-300 focus:border-green-500 bg-green-50"
                          : "border-gray-200 focus:border-primary-500 bg-gray-50 focus:bg-white"
                      }`}
                      placeholder="Enter your email address"
                    />
                    {emailValid && !emailExists && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.email.message}
                    </p>
                  )}
                  {emailExists && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      Email is already registered. Please use a different email
                      or{" "}
                      <Link
                        to="/login"
                        className="ml-1 font-semibold text-red-700 hover:text-red-800 underline"
                      >
                        login here
                      </Link>
                    </p>
                  )}
                  {emailValid && otpSent && !emailExists && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-2" />
                      OTP sent to your email
                    </p>
                  )}
                </div>

                {emailValid && otpSent && !emailExists && (
                  <div className="group">
                    <label
                      htmlFor="otp"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Enter OTP *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock
                          className={`h-5 w-5 transition-colors ${
                            errors.otp
                              ? "text-red-400"
                              : "text-gray-400 group-focus-within:text-primary-500"
                          }`}
                        />
                      </div>
                      <input
                        id="otp"
                        type="text"
                        maxLength="6"
                        {...register("otp")}
                        className={`pl-12 pr-4 py-3 w-full text-gray-900 placeholder-gray-400 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                          errors.otp
                            ? "border-red-300 focus:border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-primary-500 bg-gray-50 focus:bg-white"
                        }`}
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>
                    {errors.otp && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.otp.message}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone
                        className={`h-5 w-5 transition-colors ${
                          errors.phone
                            ? "text-red-400"
                            : "text-gray-400 group-focus-within:text-primary-500"
                        }`}
                      />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      {...register("phone")}
                      className={`pl-12 pr-4 py-3 w-full text-gray-900 placeholder-gray-400 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                        errors.phone
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-primary-500 bg-gray-50 focus:bg-white"
                      }`}
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label
                    htmlFor="company"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Company{" "}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      id="company"
                      type="text"
                      autoComplete="organization"
                      {...register("company")}
                      className="pl-12 pr-4 py-3 w-full text-gray-900 placeholder-gray-400 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:border-primary-500 bg-gray-50 focus:bg-white"
                      placeholder="Company name"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock
                        className={`h-5 w-5 transition-colors ${
                          errors.password
                            ? "text-red-400"
                            : "text-gray-400 group-focus-within:text-primary-500"
                        }`}
                      />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("password")}
                      className={`pl-12 pr-12 py-3 w-full text-gray-900 placeholder-gray-400 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                        errors.password
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-primary-500 bg-gray-50 focus:bg-white"
                      }`}
                      placeholder="Create password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock
                        className={`h-5 w-5 transition-colors ${
                          errors.confirmPassword
                            ? "text-red-400"
                            : "text-gray-400 group-focus-within:text-primary-500"
                        }`}
                      />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                      className={`pl-12 pr-12 py-3 w-full text-gray-900 placeholder-gray-400 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                        errors.confirmPassword
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-primary-500 bg-gray-50 focus:bg-white"
                      }`}
                      placeholder="Confirm password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    {...register("terms")}
                    className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors ${
                      errors.terms ? "border-red-500" : ""
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700 font-medium">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-primary-600 hover:text-primary-700 font-semibold transition-colors relative group"
                    >
                      Terms and Conditions
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary-600 hover:text-primary-700 font-semibold transition-colors relative group"
                    >
                      Privacy Policy
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </label>
                </div>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.terms.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isVerifying || !otpSent || emailExists}
                className="group relative w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-500/25"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Verifying & Registering...
                  </div>
                ) : emailExists ? (
                  <div className="flex items-center justify-center">
                    <Mail className="mr-2 h-5 w-5" />
                    <span>Email already registered</span>
                  </div>
                ) : !otpSent ? (
                  <div className="flex items-center justify-center">
                    <Mail className="mr-2 h-5 w-5" />
                    <span>Enter valid email to continue</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    <span>Continue</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or register with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading || isVerifying}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isGoogleLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-600 mr-2"></div>
                ) : (
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span className="ml-2">
                  {isGoogleLoading ? "Signing in..." : "Google"}
                </span>
              </button>

              <button
                type="button"
                disabled={true}
                className="w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
