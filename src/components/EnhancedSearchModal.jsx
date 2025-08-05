import React, { useState } from 'react';
import { X, MapPin, Building, Bed, Bath, Car, Wifi, Dumbbell, Waves, Shield, TreePine } from 'lucide-react';

const EnhancedSearchModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    propertyType: '',
    priceRange: { min: '', max: '' },
    bedrooms: '',
    bathrooms: '',
    amenities: [],
    location: '',
    sqftRange: { min: '', max: '' }
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'office', label: 'Office Space' },
    { value: 'land', label: 'Land/Plot' }
  ];

  const bedroomOptions = [
    { value: '1', label: '1 BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4+', label: '4+ BHK' }
  ];

  const bathroomOptions = [
    { value: '1', label: '1 Bath' },
    { value: '2', label: '2 Baths' },
    { value: '3', label: '3 Baths' },
    { value: '4+', label: '4+ Baths' }
  ];

  const amenitiesList = [
    { id: 'pool', label: 'Swimming Pool', icon: Waves },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'balcony', label: 'Balcony', icon: Building },
    { id: 'garden', label: 'Garden', icon: TreePine },
    { id: 'security', label: '24/7 Security', icon: Shield },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'elevator', label: 'Elevator', icon: Building }
  ];

  const handleAmenityToggle = (amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({
      propertyType: '',
      priceRange: { min: '', max: '' },
      bedrooms: '',
      bathrooms: '',
      amenities: [],
      location: '',
      sqftRange: { min: '', max: '' }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Advanced Search Filters</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Property Type */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Property Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFilters(prev => ({ ...prev, propertyType: type.value }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      filters.propertyType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Building className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Price Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="₹ 10,00,000"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="₹ 1,00,00,000"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bedrooms */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Bedrooms</h3>
                <div className="grid grid-cols-2 gap-3">
                  {bedroomOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters(prev => ({ ...prev, bedrooms: option.value }))}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        filters.bedrooms === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Bed className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Bathrooms</h3>
                <div className="grid grid-cols-2 gap-3">
                  {bathroomOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters(prev => ({ ...prev, bathrooms: option.value }))}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        filters.bathrooms === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Bath className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenitiesList.map((amenity) => {
                  const IconComponent = amenity.icon;
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => handleAmenityToggle(amenity.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        filters.amenities.includes(amenity.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">{amenity.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Square Footage */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Square Footage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Sqft</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={filters.sqftRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sqftRange: { ...prev.sqftRange, min: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Sqft</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={filters.sqftRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sqftRange: { ...prev.sqftRange, max: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 rounded-b-3xl">
            <div className="flex items-center justify-between">
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Clear All Filters
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSearchModal;