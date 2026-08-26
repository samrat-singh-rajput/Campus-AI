import React, { useState, useEffect } from 'react';

export const GlobalLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Keep visible for ~2.5 seconds, then smoothly fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2500);

    // Completely remove from DOM after 3.0 seconds (500ms transition)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-500 ease-in-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Centered Logo & Animated Loading Text */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
        <img
          src="/logo.png"
          alt="CampusMate AI"
          className="h-[90px] sm:h-[110px] md:h-[128px] w-auto object-contain animate-float-pulse drop-shadow-2xl"
        />

        {/* Loading text with animated dots */}
        <div className="mt-6 flex items-center space-x-1.5 text-slate-300 font-semibold text-base sm:text-lg tracking-wider">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Loading
          </span>
          <span className="inline-flex space-x-1 ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-dot-1" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-dot-2" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-dot-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
