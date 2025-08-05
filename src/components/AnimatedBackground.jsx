import React from 'react';

const AnimatedBackground = ({ variant = 'default', children }) => {
  const getBackgroundClass = () => {
    switch (variant) {
      case 'aurora':
        return 'aurora-background';
      case 'plasma':
        return 'plasma-effect';
      case 'holographic':
        return 'holographic';
      case 'retro':
        return 'retro-wave';
      case 'cosmic':
        return 'cosmic-dust';
      case 'cyber':
        return 'cyber-grid';
      default:
        return 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50';
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${getBackgroundClass()}`}>
      {/* Animated geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 float liquid-morph"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 float morphing-blob" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-pink-200 rounded-full opacity-20 float levitate" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-60 left-1/2 w-14 h-14 bg-green-200 rounded-full opacity-20 float breathing" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-60 right-1/3 w-18 h-18 bg-yellow-200 rounded-full opacity-20 float energy-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-32 right-32 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 rotate-45 spiral-rotate"></div>
        <div className="absolute bottom-32 left-32 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 opacity-30 rotate-45 wave-animation" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-16 w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 opacity-30 rounded-full heartbeat" style={{animationDelay: '2.5s'}}></div>
        
        {/* Floating lines */}
        <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-blue-300 to-transparent opacity-30 data-stream"></div>
        <div className="absolute top-0 right-1/4 w-px h-40 bg-gradient-to-b from-transparent via-purple-300 to-transparent opacity-30 data-stream" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-0 left-3/4 w-px h-24 bg-gradient-to-b from-transparent via-pink-300 to-transparent opacity-30 data-stream" style={{animationDelay: '2s'}}></div>
        
        {/* Matrix-style elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full floating-particles"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
        
        {/* Holographic grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'cyberGridMove 30s linear infinite'
          }}></div>
        </div>
        
        {/* Glowing orbs with different animations */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-radial from-blue-400/20 to-transparent rounded-full glow-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-radial from-purple-400/20 to-transparent rounded-full glow-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 right-1/3 w-20 h-20 bg-gradient-radial from-pink-400/20 to-transparent rounded-full glow-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Animated borders */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-300/30 rounded-lg electric-border"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-purple-300/30 rounded-full electric-border" style={{animationDelay: '1s'}}></div>
        
        {/* Quantum effects */}
        <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-cyan-400 rounded-full quantum-blur"></div>
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-magenta-400 rounded-full quantum-blur" style={{animationDelay: '1.5s'}}></div>
        
        {/* Digital rain effect */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-green-400 via-green-300 to-transparent matrix-rain"
              style={{
                left: `${i * 10}%`,
                height: '100px',
                animationDelay: `${i * 2}s`,
                animationDuration: '20s'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;