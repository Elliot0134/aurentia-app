import React from 'react';

interface CloseIconProps {
  className?: string;
  onClick?: () => void;
}

const CloseIcon: React.FC<CloseIconProps> = ({ 
  className = "h-6 w-6", 
  onClick 
}) => {
  return (
    <button
      className="text-gray-600 hover:text-gray-900 transition-colors"
      onClick={onClick}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M6 18L18 6M6 6l12 12" 
        />
      </svg>
    </button>
  );
};

export default CloseIcon;