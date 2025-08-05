import React from 'react';

const Loading = ({ 
  message = "Loading...", 
  fullScreen = false, 
  variant = 'default',
  showProgress = false,
  progress = 0 
}) => {
  const getLoadingAnimation = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full energy-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <div className="text-2xl">🏠</div>
              </div>
            </div>
          </div>
        );
      
      case 'morph':
        return (
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 morphing-blob flex items-center justify-center">
              <div className="text-2xl text-white">🏠</div>
            </div>
          </div>
        );
      
      case 'holographic':
        return (
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 holographic hologram-flicker rounded-lg flex items-center justify-center">
              <div className="text-2xl text-white">🏠</div>
            </div>
          </div>
        );
      
      case 'quantum':
        return (
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg quantum-blur flex items-center justify-center">
              <div className="text-2xl text-white digital-glitch">🏠</div>
            </div>
          </div>
        );
      
      case 'crystal':
        return (
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg crystal-shine flex items-center justify-center">
              <div className="text-2xl text-white">🏠</div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg levitate"></div>
              <div className="absolute inset-2 bg-white rounded-md flex items-center justify-center">
                <div className="text-2xl heartbeat">🏠</div>
              </div>
            </div>
          </div>
        );
    }
  };

  const getLoadingDots = () => {
    switch (variant) {
      case 'wave':
        return (
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full wave-animation"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'spiral':
        return (
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full spiral-rotate"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );
      
      case 'glow':
        return (
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-600 rounded-full glow-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        );
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 glass-morphism flex items-center justify-center z-50">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full floating-particles opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
        
        <div className="text-center relative z-10">
          {getLoadingAnimation()}
          {getLoadingDots()}
          
          <div className="mb-4">
            <p className="text-slate-900 text-lg font-medium mb-2 fade-in">{message}</p>
            <p className="text-slate-600 text-sm typing-animation">Finding the perfect properties for you...</p>
          </div>
          
          {showProgress && (
            <div className="w-64 mx-auto">
              <div className="progress-bar mb-2">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{progress}% Complete</p>
            </div>
          )}
          
          {/* Loading stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div className="fade-in" style={{animationDelay: '0.5s'}}>
              <div className="text-2xl font-bold text-blue-600 heartbeat">10K+</div>
              <div className="text-xs text-slate-500">Properties</div>
            </div>
            <div className="fade-in" style={{animationDelay: '0.7s'}}>
              <div className="text-2xl font-bold text-purple-600 wave-animation">500+</div>
              <div className="text-xs text-slate-500">Agents</div>
            </div>
            <div className="fade-in" style={{animationDelay: '0.9s'}}>
              <div className="text-2xl font-bold text-pink-600 breathing">50+</div>
              <div className="text-xs text-slate-500">Cities</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-lg spiral-rotate"></div>
          <div className="absolute inset-1 bg-white rounded-md"></div>
        </div>
        <p className="text-slate-600 font-medium fade-in">{message}</p>
      </div>
    </div>
  );
};

export default Loading;