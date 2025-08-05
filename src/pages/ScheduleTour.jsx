import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { getPropertyById, scheduleTour } from '../services/supabaseService';

const ScheduleTour = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoadingProperty(true);
        const result = await getPropertyById(id);
        if (result.success) {
          setProperty(result.data);
        } else {
          toast.error('Property not found');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
      } finally {
        setLoadingProperty(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // Generate available dates (next 30 days, excluding Sundays)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (0 = Sunday)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  const timeSlots = [
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' }
  ];

  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Handle phone number formatting
    if (e.target.name === 'phone') {
      // Remove any non-digit characters except +
      value = value.replace(/[^\d+]/g, '');
      
      // If user enters 10 digits starting with 6-9, auto-add +91
      if (/^[6-9]\d{9}$/.test(value)) {
        value = `+91${value}`;
      }
      // If user starts typing +91, allow it
      else if (value.startsWith('+91') && value.length <= 13) {
        // Keep as is
      }
      // If just digits and less than 10, keep as is for user to continue typing
      else if (/^\d{1,9}$/.test(value)) {
        // Keep as is
      }
      // If starts with +91 and has more digits, validate
      else if (value.startsWith('+91')) {
        const digits = value.substring(3);
        if (digits.length <= 10 && /^[6-9]?\d*$/.test(digits)) {
          // Keep as is
        } else {
          // Invalid, revert to previous value
          value = formData.phone;
        }
      }
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      const tourData = {
        property_id: property.id,
        property_owner_id: property.user_id,
        visitor_name: formData.name,
        visitor_email: formData.email,
        visitor_phone: formData.phone,
        visitor_message: formData.message,
        tour_date: selectedDate,
        tour_time: selectedTime,
        tour_type: 'physical'
      };

      const result = await scheduleTour(tourData);
      
      if (result.success) {
        setIsSubmitted(true);
        toast.success('Tour scheduled successfully!');
      } else {
        toast.error(result.error || 'Failed to schedule tour');
      }
    } catch (error) {
      console.error('Error scheduling tour:', error);
      toast.error('Failed to schedule tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Tour Scheduled!</h1>
            <p className="text-slate-600 mb-6">
              Your tour has been successfully scheduled for{' '}
              <span className="font-semibold">
                {availableDates.find(d => d.value === selectedDate)?.label}
              </span>{' '}
              at{' '}
              <span className="font-semibold">
                {timeSlots.find(t => t.value === selectedTime)?.label}
              </span>
            </p>
            <p className="text-sm text-slate-500 mb-8">
              The property owner has been notified and will contact you soon to confirm the tour details.
            </p>
            <div className="space-y-3">
              <Link
                to={`/property/${id}`}
                className="w-full btn-primary py-3 text-center block"
              >
                Back to Property
              </Link>
              <Link
                to="/"
                className="w-full text-slate-600 hover:text-slate-900 py-3 text-center block transition-colors"
              >
                Browse More Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingProperty) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Property Not Found</h1>
          <p className="text-slate-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Info */}
          <div className="bg-white rounded-3xl p-8 shadow-lg h-fit">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Schedule a Tour</h1>
            
            <div className="flex items-start space-x-4 mb-6">
              <img
                src={property.images?.[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&crop=center"}
                alt={property.title}
                className="w-20 h-16 rounded-xl object-cover"
              />
              <div>
                <h2 className="font-bold text-slate-900 mb-1">{property.title}</h2>
                <div className="flex items-center text-slate-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}, {property.city}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">What to expect:</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Professional guided tour of the entire property</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Detailed information about amenities and features</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Opportunity to ask questions and discuss terms</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Tour duration: approximately 30-45 minutes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Select Date
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {availableDates.slice(0, 10).map((date) => (
                    <button
                      key={date.value}
                      type="button"
                      onClick={() => setSelectedDate(date.value)}
                      className={`p-3 text-left rounded-xl border-2 transition-all duration-300 ${
                        selectedDate === date.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  <Clock className="h-5 w-5 inline mr-2" />
                  Select Time
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time.value}
                      type="button"
                      onClick={() => setSelectedTime(time.value)}
                      className={`p-3 text-center rounded-xl border-2 transition-all duration-300 ${
                        selectedTime === time.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Any specific questions or requirements?"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 text-lg font-semibold interactive-button hover-glow energy-pulse disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Scheduling Tour...
                  </div>
                ) : (
                  'Schedule Tour'
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                By scheduling a tour, you agree to be contacted by our agent regarding this property.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTour;