import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageCircle, Star, MapPin, Calendar, Clock, User, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const AgentContact = () => {
  const { id, agentId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredTime: 'morning',
    contactMethod: 'phone'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock agent data - in real app, fetch from API
  const agent = {
    id: agentId || '1',
    name: 'Priya Sharma',
    title: 'Senior Property Consultant',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
    rating: 4.9,
    reviews: 127,
    experience: '8+ years',
    specialization: 'Luxury Properties',
    phone: '+91 98765 43210',
    email: 'priya.sharma@easyprop.com',
    location: 'Mumbai, Maharashtra',
    languages: ['English', 'Hindi', 'Marathi'],
    properties: 45,
    deals: 156,
    responseTime: '< 2 hours',
    availability: 'Mon-Sat, 9 AM - 7 PM',
    bio: 'Experienced real estate professional specializing in luxury properties across Mumbai. Known for personalized service and deep market knowledge.',
    achievements: [
      'Top Performer 2023',
      'Customer Choice Award',
      'Luxury Property Specialist'
    ]
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Message sent successfully! The agent will contact you soon.');
    setIsSubmitting(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      preferredTime: 'morning',
      contactMethod: 'phone'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link 
            to={id ? `/property/${id}` : '/properties'}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Property</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Agent Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Agent Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mt-4">{agent.name}</h1>
              <p className="text-slate-600 mb-4">{agent.title}</p>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <span className="font-semibold">{agent.rating}</span>
                  <span className="text-slate-500">({agent.reviews} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">{agent.properties}</div>
                  <div className="text-sm text-slate-600">Properties Listed</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">{agent.deals}</div>
                  <div className="text-sm text-slate-600">Deals Closed</div>
                </div>
              </div>
            </div>

            {/* Agent Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                <MapPin className="h-5 w-5 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-900">Location</div>
                  <div className="text-slate-600">{agent.location}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                <Clock className="h-5 w-5 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-900">Response Time</div>
                  <div className="text-slate-600">{agent.responseTime}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                <Calendar className="h-5 w-5 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-900">Availability</div>
                  <div className="text-slate-600">{agent.availability}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="font-medium text-slate-900 mb-2">Specialization</div>
                <div className="text-slate-600">{agent.specialization}</div>
                <div className="text-slate-600 mt-1">{agent.experience} experience</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="font-medium text-slate-900 mb-2">Languages</div>
                <div className="flex flex-wrap gap-2">
                  {agent.languages.map((lang, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="font-medium text-slate-900 mb-2">Achievements</div>
                <div className="space-y-1">
                  {agent.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-slate-600 text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call Now</span>
                </a>
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Contact Agent</h2>
                <p className="text-slate-600">Send a message to {agent.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about your requirements, budget, preferred location, etc."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Quick Response Guaranteed</div>
                  <div className="text-slate-600 text-sm mt-1">
                    {agent.name} typically responds within {agent.responseTime}. 
                    You'll receive a confirmation email once your message is sent.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AgentContact;