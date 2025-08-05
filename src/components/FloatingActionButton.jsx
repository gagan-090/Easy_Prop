import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, Phone, Search, Filter, Heart, Share2, Calculator, MapPin } from 'lucide-react';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show FAB on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const actions = [
    {
      icon: Search,
      label: 'Quick Search',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      action: () => console.log('Quick search'),
      animation: 'bounce-in'
    },
    {
      icon: Filter,
      label: 'Advanced Filter',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      action: () => console.log('Advanced filter'),
      animation: 'slide-in-right'
    },
    {
      icon: Calculator,
      label: 'EMI Calculator',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      action: () => console.log('EMI calculator'),
      animation: 'scale-in'
    },
    {
      icon: MapPin,
      label: 'Nearby Properties',
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
      action: () => console.log('Nearby properties'),
      animation: 'rotate-in'
    },
    {
      icon: Heart,
      label: 'Saved Properties',
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      action: () => console.log('Saved properties'),
      animation: 'flip-in'
    },
    {
      icon: Share2,
      label: 'Share App',
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      action: () => console.log('Share app'),
      animation: 'elastic-in'
    },
    {
      icon: MessageCircle,
      label: 'Chat Support',
      color: 'bg-gradient-to-r from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700',
      action: () => console.log('Chat support'),
      animation: 'slide-in-left'
    },
    {
      icon: Phone,
      label: 'Call Agent',
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      action: () => console.log('Call agent'),
      animation: 'zoom-in'
    }
  ];

  return (
    <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
    }`}>
      {/* Ripple effect background */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        isOpen ? 'scale-150 opacity-20' : 'scale-100 opacity-0'
      } bg-gradient-to-r from-blue-600 to-purple-600`}></div>
      
      {/* Action buttons */}
      <div className={`flex flex-col space-y-3 mb-4 transition-all duration-500 ${
        isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <div 
            key={index} 
            className={`flex items-center space-x-3 ${action.animation}`}
            style={{
              animationDelay: isOpen ? `${index * 0.1}s` : '0s',
              animationDuration: '0.6s',
              animationFillMode: 'both'
            }}
          >
            {/* Label */}
            <div className="glass-morphism text-slate-800 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 crystal-shine">
              {action.label}
            </div>
            
            {/* Action button */}
            <button
              onClick={action.action}
              className={`w-14 h-14 ${action.color} ${action.hoverColor} text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 interactive-button energy-pulse`}
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            >
              <action.icon className="h-6 w-6" />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center hover:scale-110 interactive-button ${
          isOpen ? 'rotate-45 scale-110' : 'rotate-0 scale-100'
        } ${isOpen ? 'glow-pulse' : 'energy-pulse'}`}
      >
        <Plus className={`h-8 w-8 transition-all duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
        
        {/* Animated ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-white/30 transition-all duration-500 ${
          isOpen ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
        }`}></div>
        
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" style={{animationDelay: '0.5s'}}></div>
      </button>
      
      {/* Floating particles around FAB */}
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full floating-particles opacity-60"
              style={{
                left: `${Math.cos(i * 45 * Math.PI / 180) * 40 + 50}%`,
                top: `${Math.sin(i * 45 * Math.PI / 180) * 40 + 50}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Notification badge */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg heartbeat">
        3
      </div>
    </div>
  );
};

export default FloatingActionButton;