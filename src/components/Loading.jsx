import React from 'react';

const Loading = ({ message = "Loading...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            {/* Animated house icon */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-md flex items-center justify-center">
                <div className="text-2xl">🏠</div>
              </div>
            </div>
            
            {/* Loading dots */}
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
          
          <p className="text-slate-600 text-lg font-medium">{message}</p>
          <p className="text-slate-400 text-sm mt-2">Finding the perfect properties for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-lg animate-spin"></div>
          <div className="absolute inset-1 bg-white rounded-md"></div>
        </div>
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loading;