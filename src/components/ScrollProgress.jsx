import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollProgress = ({ showBackToTop = true }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      
      setScrollProgress(progress);
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/50 backdrop-blur-sm z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-300 ease-out glow-pulse"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Circular progress indicator */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="relative w-12 h-12">
          {/* Background circle */}
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-300"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress circle */}
            <path
              className="text-blue-600"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${scrollProgress}, 100`}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700">
              {Math.round(scrollProgress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-24 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-500 flex items-center justify-center z-40 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          } hover:scale-110 energy-pulse`}
        >
          <ChevronUp className="h-6 w-6" />
          
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
        </button>
      )}

      {/* Reading progress sections */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col space-y-4">
          {['Hero', 'Properties', 'Features', 'Contact'].map((section, index) => (
            <div
              key={section}
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                scrollProgress > index * 25 
                  ? 'bg-gradient-to-b from-blue-600 to-purple-600 glow-pulse' 
                  : 'bg-gray-300'
              }`}
              title={section}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint animation */}
      {scrollProgress < 5 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <div className="flex flex-col items-center space-y-2 text-slate-600">
            <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-pulse"></div>
            </div>
            <span className="text-sm font-medium">Scroll to explore</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ScrollProgress;