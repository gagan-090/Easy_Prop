import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  MessageSquare,
  Filter,
  Search,
  MoreVertical,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getUserTours, 
  updateTourStatus, 
  getTourStatistics,
  addTourFeedback 
} from '../../services/supabaseService';

const Tours = () => {
  const { user } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    agent_rating: 5,
    agent_feedback: '',
    agent_notes: '',
    follow_up_required: false,
    follow_up_date: '',
    follow_up_notes: ''
  });

  useEffect(() => {
    if (user?.uid) {
      fetchTours();
      fetchStatistics();
    }
  }, [user, filter]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (filter !== 'all') {
        filters.status = filter;
      }
      
      const result = await getUserTours(user.uid, filters);
      if (result.success) {
        setTours(result.data);
      } else {
        toast.error('Failed to fetch tours');
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast.error('Failed to fetch tours');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await getTourStatistics(user.uid);
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error fetching tour statistics:', error);
    }
  };

  const handleStatusUpdate = async (tourId, newStatus) => {
    try {
      const result = await updateTourStatus(tourId, newStatus, user.uid);
      if (result.success) {
        toast.success(`Tour ${newStatus} successfully`);
        fetchTours();
        fetchStatistics();
      } else {
        toast.error('Failed to update tour status');
      }
    } catch (error) {
      console.error('Error updating tour status:', error);
      toast.error('Failed to update tour status');
    }
  };

  const handleAddFeedback = async () => {
    try {
      const result = await addTourFeedback(selectedTour.id, feedback, user.uid);
      if (result.success) {
        toast.success('Feedback added successfully');
        setShowFeedbackModal(false);
        setSelectedTour(null);
        setFeedback({
          agent_rating: 5,
          agent_feedback: '',
          agent_notes: '',
          follow_up_required: false,
          follow_up_date: '',
          follow_up_notes: ''
        });
        fetchTours();
      } else {
        toast.error('Failed to add feedback');
      }
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast.error('Failed to add feedback');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no_show': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.visitor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.properties?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tour Management</h1>
          <p className="text-gray-600 mt-1">Manage property tour requests and schedules</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tours</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total_tours || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tours</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.pending_tours || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tours</p>
              <p className="text-2xl font-bold text-green-600">{statistics.completed_tours || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.conversion_rate || 0}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tours by visitor name, email, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Tours</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tours List */}
      <div className="space-y-4">
        {filteredTours.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any tour requests yet." 
                : `No ${filter} tours found.`}
            </p>
          </div>
        ) : (
          filteredTours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Property Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={tour.properties?.images?.[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&crop=center"}
                    alt={tour.properties?.title}
                    className="w-16 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{tour.properties?.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{tour.properties?.address}, {tour.properties?.city}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(tour.tour_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatTime(tour.tour_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visitor Info */}
                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">{tour.visitor_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{tour.visitor_email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{tour.visitor_phone}</span>
                    </div>
                    {tour.visitor_message && (
                      <div className="flex items-start text-sm text-gray-600 mt-2">
                        <MessageSquare className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <span className="italic">"{tour.visitor_message}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end space-y-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(tour.status)}`}>
                    {getStatusIcon(tour.status)}
                    <span className="ml-1 capitalize">{tour.status.replace('_', ' ')}</span>
                  </span>

                  <div className="flex space-x-2">
                    {tour.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(tour.id, 'confirmed')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(tour.id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {tour.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(tour.id, 'completed')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(tour.id, 'no_show')}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          No Show
                        </button>
                      </>
                    )}

                    {tour.status === 'completed' && !tour.agent_feedback && (
                      <button
                        onClick={() => {
                          setSelectedTour(tour);
                          setShowFeedbackModal(true);
                        }}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add Feedback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Tour Feedback</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tour Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback({ ...feedback, agent_rating: star })}
                      className={`p-1 ${star <= feedback.agent_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={feedback.agent_feedback}
                  onChange={(e) => setFeedback({ ...feedback, agent_feedback: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="How was the tour? Any feedback for the visitor?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={feedback.agent_notes}
                  onChange={(e) => setFeedback({ ...feedback, agent_notes: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Internal notes (not visible to visitor)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="followUp"
                  checked={feedback.follow_up_required}
                  onChange={(e) => setFeedback({ ...feedback, follow_up_required: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="followUp" className="ml-2 text-sm text-gray-700">
                  Follow-up required
                </label>
              </div>

              {feedback.follow_up_required && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={feedback.follow_up_date}
                    onChange={(e) => setFeedback({ ...feedback, follow_up_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddFeedback}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save Feedback
              </button>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedTour(null);
                  setFeedback({
                    agent_rating: 5,
                    agent_feedback: '',
                    agent_notes: '',
                    follow_up_required: false,
                    follow_up_date: '',
                    follow_up_notes: ''
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tours;