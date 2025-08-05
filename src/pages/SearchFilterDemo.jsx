import React, { useState, useCallback } from "react";
import ModernSearchFilter from "../components/ModernSearchFilter";

const SearchFilterDemo = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Optimized handlers with useCallback
  const handleSearch = useCallback((query, filters) => {
    console.log("Search executed:", { query, filters });
    setSearchResults({ query, filters, timestamp: new Date().toISOString() });
  }, []);

  const handleFilterChange = useCallback((filters) => {
    console.log("Filters changed:", filters);
    setAppliedFilters(filters);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      {/* Header */}
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1
            className={`text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            🏠 Enhanced Property Search Filter
          </h1>
          <p
            className={`text-xl mb-8 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Experience the most advanced property search with modern UI,
            accessibility features, and smart filters
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div
              className={`p-6 rounded-2xl shadow-lg ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-3xl mb-3">🎨</div>
              <h3
                className={`font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Modern UI Design
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Glassmorphism, smooth animations, and responsive design
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl shadow-lg ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-3xl mb-3">♿</div>
              <h3
                className={`font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Fully Accessible
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                ARIA labels, keyboard navigation, and screen reader support
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl shadow-lg ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-3xl mb-3">🔍</div>
              <h3
                className={`font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Smart Features
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Auto-suggest, geolocation, and advanced filters
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl shadow-lg ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-3xl mb-3">🌓</div>
              <h3
                className={`font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Dark Mode Support
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Toggle between light and dark themes seamlessly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter Component */}
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <ModernSearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            darkMode={darkMode}
            onDarkModeToggle={toggleDarkMode}
            initialFilters={{
              location: "Mumbai",
              propertyType: "apartment",
              priceRange: { min: "2000000", max: "13000000" },
              bedrooms: "3",
            }}
          />
        </div>
      </div>

      {/* Results Display */}
      {(searchResults || Object.keys(appliedFilters).length > 0) && (
        <div className="pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div
              className={`rounded-3xl shadow-2xl p-8 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                🔍 Search & Filter Results
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search Results */}
                {searchResults && (
                  <div>
                    <h3
                      className={`text-lg font-semibold mb-4 ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Latest Search Query
                    </h3>
                    <div
                      className={`p-4 rounded-xl ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`text-sm mb-2 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Query:{" "}
                        <span className="font-mono">
                          {searchResults.query || "No query"}
                        </span>
                      </div>
                      <div
                        className={`text-sm mb-2 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Timestamp:{" "}
                        {new Date(searchResults.timestamp).toLocaleString()}
                      </div>
                      <pre
                        className={`text-xs overflow-auto ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {JSON.stringify(searchResults.filters, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Applied Filters */}
                {Object.keys(appliedFilters).length > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-semibold mb-4 ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Current Filters
                    </h3>
                    <div
                      className={`p-4 rounded-xl ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <pre
                        className={`text-xs overflow-auto ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {JSON.stringify(appliedFilters, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Documentation */}
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`rounded-3xl shadow-2xl p-8 ${
              darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-8 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ✨ Enhanced Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className={`text-lg font-semibold mb-4 text-blue-500`}>
                  🎯 Core Improvements
                </h3>
                <ul
                  className={`space-y-2 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>✅ Fully clickable filter boxes</li>
                  <li>✅ Improved text readability</li>
                  <li>✅ Enhanced contrast and spacing</li>
                  <li>✅ Modern icons throughout</li>
                  <li>✅ Smooth hover animations</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-4 text-green-500`}>
                  🆕 New Filters
                </h3>
                <ul
                  className={`space-y-2 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>✅ Possession Status</li>
                  <li>✅ Furnishing Options</li>
                  <li>✅ Area Range (Sq. ft.)</li>
                  <li>✅ Builder Name Search</li>
                  <li>✅ Property Age Filter</li>
                  <li>✅ Facing Direction</li>
                  <li>✅ Floor Number</li>
                  <li>✅ Gated Society Toggle</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-4 text-purple-500`}>
                  🚀 Smart Features
                </h3>
                <ul
                  className={`space-y-2 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>✅ Auto-suggest search</li>
                  <li>✅ Geolocation support</li>
                  <li>✅ Dark mode toggle</li>
                  <li>✅ Responsive design</li>
                  <li>✅ Advanced amenities</li>
                  <li>✅ Filter count badges</li>
                  <li>✅ Quick clear options</li>
                  <li>✅ Glassmorphism effects</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterDemo;
