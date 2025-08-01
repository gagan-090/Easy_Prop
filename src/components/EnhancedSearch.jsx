import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Building, TrendingUp, Clock, X } from 'lucide-react';

const EnhancedSearch = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches] = useState([
    'Bandra West Mumbai',
    '3 BHK Apartment',
    'Villa in Juhu',
    'Commercial Space BKC'
  ]);
  
  const [trendingSearches] = useState([
    'Luxury Apartments Mumbai',
    'Affordable Housing Pune',
    'Office Space Bangalore',
    'Villa with Pool'
  ]);

  const [suggestions] = useState([
    { type: 'location', text: 'Bandra West, Mumbai', icon: MapPin },
    { type: 'location', text: 'Andheri East, Mumbai', icon: MapPin },
    { type: 'property', text: '3 BHK Apartment', icon: Building },
    { type: 'property', text: 'Luxury Villa', icon: Building },
  ]);

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Search by location, property type, or keyword..."
          className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-12 flex items-center pr-2"
          >
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className="absolute inset-y-0 right-0 flex items-center pr-4"
        >
          <div className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors">
            <Search className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-96 overflow-y-auto">
          {/* Suggestions based on query */}
          {query && filteredSuggestions.length > 0 && (
            <div className="p-4 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Suggestions</h4>
              <div className="space-y-2">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <suggestion.icon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Recent Searches
              </h4>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <span className="text-slate-700">{search}</span>
                    <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {!query && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending Searches
              </h4>
              <div className="space-y-2">
                {trendingSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-slate-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;