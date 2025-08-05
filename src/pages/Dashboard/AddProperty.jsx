import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { addProperty, uploadImagesToStorage } from '../../services/supabaseService';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  MapPin,
  Home,
  IndianRupee,
  FileText,
  Camera,
  Eye,
  Check,
  AlertCircle,
  Loader,
  Save,
  Download,
  Trash2
} from 'lucide-react';

const AddProperty = () => {
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftExists, setDraftExists] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState(null);

  const { register, handleSubmit, watch, formState: { errors }, reset, trigger, setValue } = useForm();

  const totalSteps = 6;
  const formData = watch();

  // Check for existing draft on component mount
  useEffect(() => {
    const existingDraft = localStorage.getItem(`property_draft_${user?.uid}`);
    if (existingDraft) {
      setDraftExists(true);
      try {
        const draftData = JSON.parse(existingDraft);
        if (draftData.timestamp) {
          setDraftTimestamp(draftData.timestamp);
        }
      } catch (error) {
        console.error('Error parsing draft timestamp:', error);
      }
    }
  }, [user?.uid]);

  const steps = [
    { id: 1, title: 'Property Basics', icon: Home, description: 'Basic information about your property' },
    { id: 2, title: 'Location & Details', icon: MapPin, description: 'Address and property specifications' },
    { id: 3, title: 'Pricing', icon: IndianRupee, description: 'Set your property price and terms' },
    { id: 4, title: 'Media Upload', icon: Camera, description: 'Upload photos and videos' },
    { id: 5, title: 'Description & Amenities', icon: FileText, description: 'Detailed description and features' },
    { id: 6, title: 'Preview & Publish', icon: Eye, description: 'Review and publish your listing' }
  ];

  const onDrop = (acceptedFiles) => {
    setErrorMessage('');
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  // Save draft function
  const saveDraft = async () => {
    if (!user?.uid) {
      setErrorMessage('Please log in to save a draft');
      return;
    }

    setIsSavingDraft(true);
    setErrorMessage('');

    try {
      const draftData = {
        formData: formData,
        currentStep: currentStep,
        uploadedImages: uploadedImages,
        timestamp: new Date().toISOString(),
        step: currentStep
      };

      localStorage.setItem(`property_draft_${user.uid}`, JSON.stringify(draftData));
      setDraftSaved(true);
      setDraftExists(true);
      setDraftTimestamp(draftData.timestamp);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setDraftSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrorMessage('Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Load draft function
  const loadDraft = () => {
    if (!user?.uid) {
      setErrorMessage('Please log in to load a draft');
      return;
    }

    // Check if there's current form data that might be lost
    const hasCurrentData = Object.keys(formData).some(key => formData[key] && formData[key] !== '');
    
    if (hasCurrentData) {
      const confirmLoad = window.confirm(
        'Loading a draft will replace your current form data. Are you sure you want to continue?'
      );
      if (!confirmLoad) return;
    }

    try {
      const savedDraft = localStorage.getItem(`property_draft_${user.uid}`);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        
        // Restore form data
        Object.keys(draftData.formData).forEach(key => {
          if (draftData.formData[key] !== undefined && draftData.formData[key] !== null) {
            setValue(key, draftData.formData[key]);
          }
        });

        // Restore uploaded images
        if (draftData.uploadedImages && draftData.uploadedImages.length > 0) {
          setUploadedImages(draftData.uploadedImages);
        }

        // Restore current step
        setCurrentStep(draftData.currentStep || 1);
        
        setErrorMessage('');
        setDraftSaved(false);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      setErrorMessage('Failed to load draft. Please try again.');
    }
  };

  // Clear draft function
  const clearDraft = () => {
    if (!user?.uid) return;

    const confirmClear = window.confirm(
      'Are you sure you want to delete this draft? This action cannot be undone.'
    );
    if (!confirmClear) return;

    try {
      localStorage.removeItem(`property_draft_${user.uid}`);
      setDraftExists(false);
      setDraftSaved(false);
      setDraftTimestamp(null);
      setErrorMessage('');
    } catch (error) {
      console.error('Error clearing draft:', error);
      setErrorMessage('Failed to clear draft.');
    }
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!user?.uid) return;

    const autoSaveInterval = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        saveDraft();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData, user?.uid]);

  const validateStep = async () => {
    const fieldsToValidate = {
      1: ['title', 'propertyType', 'category', 'area'],
      2: ['address', 'city', 'state', 'pincode'],
      3: ['price'],
      4: [], // No validation needed for this step
      5: ['description'],
      6: []
    };
    
    // Trigger validation for the current step's fields
    const isValid = await trigger(fieldsToValidate[currentStep]);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setErrorMessage('');
    } else {
      setErrorMessage('Please fill out all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrorMessage('');
    }
  };

  const onSubmit = async (data) => {
    if (!user?.uid) {
      setErrorMessage('Please log in to add a property');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Step 1: Upload images to storage
      let imageUrls = [];
      console.log('📸 Number of images to upload:', uploadedImages.length);
      if (uploadedImages.length > 0) {
        try {
          console.log('📤 Starting image upload...');
          imageUrls = await uploadImagesToStorage(uploadedImages.map(img => img.file), user.uid);
          console.log('✅ Images uploaded successfully:', imageUrls);
        } catch (uploadError) {
          console.error('❌ Error uploading images:', uploadError);
          setErrorMessage('Failed to upload images. Please try again.');
          setIsSubmitting(false);
          return;
        }
      } else {
        console.log('⚠️ No images selected for upload');
      }

      // Step 2: Prepare property data for the database
      const propertyData = {
        title: data.title,
        description: data.description,
        type: data.propertyType,
        property_type: data.category,
        category: (data.category === 'office' || data.category === 'shop') ? 'commercial' : 'residential',
        price: parseFloat(data.price),
        area: parseFloat(data.area),
        bedrooms: parseInt(data.bedrooms) || 0,
        bathrooms: parseInt(data.bathrooms) || 0,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        furnishing: data.furnishing,
        negotiable: data.negotiable === 'yes',
        maintenance: parseFloat(data.maintenance) || 0,
        bookingAmount: parseFloat(data.bookingAmount) || 0,
        amenities: data.amenities || [],
        images: imageUrls, // Store the final image URLs
        featured: data.featured || false,
        status: 'active'
      };

      console.log('📋 Submitting property data:', propertyData);

      // Step 3: Add property to the database
      const result = await addProperty(user.uid, propertyData);
      
      if (result.success) {
        setSubmitSuccess(true);
        
        // Clear draft after successful submission
        clearDraft();
        
        // Dispatch event to notify other components that a property was added
        window.dispatchEvent(new CustomEvent('propertyAdded', {
          detail: { propertyId: result.data.id }
        }));
        
        // Reset form after successful submission
        setTimeout(() => {
          reset();
          setUploadedImages([]);
          setCurrentStep(1);
          setSubmitSuccess(false);
        }, 2000);
      } else {
        setErrorMessage(result.error || 'Failed to add property.');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      setErrorMessage('Failed to add property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Variants for framer-motion animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const stepVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => console.log('Go back')} // Mocking back button action
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add New Property
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a stunning listing for your property
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <motion.button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </motion.div>
                <span className={`text-xs font-medium text-center ${
                  currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {/* Error Message Box */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2"
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
              {/* Step 1: Property Basics */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Home className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Property Basics
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Let's start with the basic information about your property
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Property Title *
                      </label>
                      <input
                        {...register('title', { required: 'Property title is required' })}
                        type="text"
                        placeholder="e.g., Modern 3BHK Apartment in Bandra"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Listing Type *
                        </label>
                        <select
                          {...register('propertyType', { required: 'Listing type is required' })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        >
                          <option value="">Select listing type</option>
                          <option value="rent">For Rent</option>
                          <option value="sale">For Sale</option>
                        </select>
                        {errors.propertyType && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.propertyType.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Property Category *
                        </label>
                        <select
                          {...register('category', { required: 'Property category is required' })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        >
                          <option value="">Select property category</option>
                          <option value="apartment">Apartment</option>
                          <option value="villa">Villa</option>
                          <option value="house">House</option>
                          <option value="office">Office Space</option>
                          <option value="shop">Shop</option>
                          <option value="land">Land/Plot</option>
                        </select>
                        {errors.category && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.category.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Bedrooms
                        </label>
                        <select
                          {...register('bedrooms')}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        >
                          <option value="">Select bedrooms</option>
                          <option value="1">1 BHK</option>
                          <option value="2">2 BHK</option>
                          <option value="3">3 BHK</option>
                          <option value="4">4 BHK</option>
                          <option value="5+">5+ BHK</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Bathrooms
                        </label>
                        <select
                          {...register('bathrooms')}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        >
                          <option value="">Select bathrooms</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5+">5+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Area (sq ft) *
                        </label>
                        <input
                          {...register('area', { required: 'Area is required' })}
                          type="number"
                          placeholder="e.g., 1200"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                        {errors.area && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.area.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Furnishing Status
                        </label>
                        <select
                          {...register('furnishing')}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        >
                          <option value="">Select furnishing</option>
                          <option value="unfurnished">Unfurnished</option>
                          <option value="semi-furnished">Semi-Furnished</option>
                          <option value="fully-furnished">Fully Furnished</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Location & Details
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Provide the location and additional details
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Full Address *
                      </label>
                      <textarea
                        {...register('address', { required: 'Address is required' })}
                        rows="3"
                        placeholder="Enter complete address with landmark"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          City *
                        </label>
                        <input
                          {...register('city', { required: 'City is required' })}
                          type="text"
                          placeholder="e.g., Mumbai"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          State *
                        </label>
                        <input
                          {...register('state', { required: 'State is required' })}
                          type="text"
                          placeholder="e.g., Maharashtra"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.state.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          PIN Code *
                        </label>
                        <input
                          {...register('pincode', { required: 'PIN code is required' })}
                          type="text"
                          placeholder="e.g., 400050"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                        {errors.pincode && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.pincode.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Floor Number
                        </label>
                        <input
                          {...register('floor')}
                          type="number"
                          placeholder="e.g., 5"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Total Floors
                        </label>
                        <input
                          {...register('totalFloors')}
                          type="number"
                          placeholder="e.g., 10"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IndianRupee className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Pricing Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Set your property price and terms
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Property Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          {...register('price', { required: 'Price is required' })}
                          type="number"
                          placeholder="e.g., 5000000"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                      </div>
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Price Negotiable
                      </label>
                      <select
                        {...register('negotiable')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Maintenance (Monthly)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          {...register('maintenance')}
                          type="number"
                          placeholder="e.g., 5000"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Booking Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          {...register('bookingAmount')}
                          type="number"
                          placeholder="e.g., 100000"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Media Upload */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Upload Media
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add photos to showcase your property
                    </p>
                  </div>

                  {/* Drag & Drop Area */}
                  <motion.div
                    {...getRootProps()}
                    whileHover={{ scale: 1.02 }}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <motion.div
                      animate={{ y: isDragActive ? -5 : 0 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {isDragActive ? 'Drop images here' : 'Upload Property Images'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Drag & drop images or click to browse
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          Supports: JPG, PNG, WebP (Max 10MB each)
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Uploaded Images */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Uploaded Images ({uploadedImages.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uploadedImages.map((image) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group"
                          >
                            <img
                              src={image.preview}
                              alt="Property"
                              className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeImage(image.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Description & Amenities */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Description & Amenities
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Describe your property and list amenities
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Property Description *
                      </label>
                      <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows="6"
                        placeholder="Describe your property in detail. Mention key features, nearby landmarks, and what makes it special..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Amenities & Features
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          'Swimming Pool', 'Gym', 'Parking', 'Security', 'Elevator',
                          'Garden', 'Balcony', 'AC', 'Internet', 'Power Backup',
                          'Water Supply', 'Club House'
                        ].map((amenity) => (
                          <motion.label
                            key={amenity}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200"
                          >
                            <input
                              {...register('amenities')}
                              type="checkbox"
                              value={amenity}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {amenity}
                            </span>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Preview & Publish */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Preview & Publish
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Review your listing before publishing
                    </p>
                  </div>

                  {/* Property Preview */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Property Preview
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {previewMode ? 'Edit Mode' : 'Preview Mode'}
                      </motion.button>
                    </div>
                    {/* The preview part remains the same, showing form data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {formData.title || 'Property Title'}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {formData.address || 'Property Address'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{formData.bedrooms || 'N/A'} BHK</span>
                          <span>{formData.area || 'N/A'} sq ft</span>
                          <span>{formData.propertyType || 'Property Type'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">
                          ₹{formData.price ? parseInt(formData.price).toLocaleString('en-IN') : '0'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.negotiable === 'yes' ? 'Negotiable' : 'Fixed Price'}
                        </p>
                      </div>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="mt-6">
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedImages.slice(0, 3).map((image) => (
                            <img
                              key={image.id}
                              src={image.preview}
                              alt="Property"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Publish Options */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Publishing Options
                    </h3>
                    <div className="space-y-3">
                      <motion.label
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          {...register('makePublic')}
                          defaultChecked
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Make this listing public immediately
                        </span>
                      </motion.label>
                      <motion.label
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          {...register('sendEmail')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Send me email notifications for inquiries
                        </span>
                      </motion.label>
                      <motion.label
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          {...register('featured')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Feature this property (Premium listing)
                        </span>
                      </motion.label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Draft Management & Navigation Buttons */}
          <div className="p-8 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            {/* Draft Status & Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {draftExists && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      Draft available
                      {draftTimestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          (Last saved: {new Date(draftTimestamp).toLocaleString()})
                        </span>
                      )}
                    </span>
                  </motion.div>
                )}
                {draftSaved && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400"
                  >
                    <Check className="h-4 w-4" />
                    <span>Draft saved!</span>
                  </motion.div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {draftExists && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={loadDraft}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4" />
                      <span>Load Draft</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={clearDraft}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear Draft</span>
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentStep === 1 || isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </motion.button>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={saveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isSavingDraft || isSubmitting
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSavingDraft ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
                </motion.button>

                {currentStep < totalSteps ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : submitSuccess
                        ? 'bg-gradient-to-r from-green-600 to-green-700'
                        : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : submitSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span>
                      {isSubmitting ? 'Publishing...' : submitSuccess ? 'Published!' : 'Publish Property'}
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddProperty;
