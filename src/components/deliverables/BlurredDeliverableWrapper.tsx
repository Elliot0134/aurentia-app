import React, { useState } from 'react';

interface BlurredDeliverableWrapperProps {
  children: React.ReactNode;
  isBlurred: boolean;
  onUnlockClick: () => void; // Add the new prop
}

const BlurredDeliverableWrapper: React.FC<BlurredDeliverableWrapperProps> = ({ children, isBlurred, onUnlockClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isBlurred && (
        <div
          className={`absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 transition-all duration-300
            ${isHovered ? 'backdrop-blur-sm' : 'backdrop-blur-none'}
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <button
            className={`px-6 py-3 rounded-full text-white font-bold bg-gradient-primary transition-opacity duration-300
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={onUnlockClick} // Add onClick handler
          >
            Débloquer
          </button>
        </div>
      )}
      <div className="h-full"> {/* Removed conditional blur from here */}
        {children}
      </div>
    </div>
  );
};

export default BlurredDeliverableWrapper;
