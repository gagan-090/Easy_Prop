import React, { useEffect, useState } from 'react';

const InteractiveCursor = () => {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Main cursor trail */}
      <div
        className={`fixed pointer-events-none z-[9999] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: cursor.x - 8,
          top: cursor.y - 8,
        }}
      >
        <div className="w-4 h-4 bg-blue-500/30 rounded-full blur-sm animate-pulse"></div>
      </div>

      {/* Secondary cursor trail */}
      <div
        className={`fixed pointer-events-none z-[9998] transition-opacity duration-500 ${
          isVisible ? 'opacity-60' : 'opacity-0'
        }`}
        style={{
          left: cursor.x - 12,
          top: cursor.y - 12,
        }}
      >
        <div className="w-6 h-6 bg-purple-500/20 rounded-full blur-md animate-ping"></div>
      </div>

      {/* Hover effect for interactive elements */}
      <div
        className={`fixed pointer-events-none z-[9997] transition-all duration-200 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
        style={{
          left: cursor.x - 20,
          top: cursor.y - 20,
        }}
      >
        <div className="w-10 h-10 border border-blue-400/50 rounded-full"></div>
      </div>
    </>
  );
};

export default InteractiveCursor;
