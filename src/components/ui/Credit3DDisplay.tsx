import React from 'react';

interface Credit3DDisplayProps {
  credits: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Credit3DDisplay: React.FC<Credit3DDisplayProps> = ({ 
  credits, 
  size = 'md', 
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-3 py-1.5',
          coin: 'w-5 h-5',
          text: 'text-xs font-semibold'
        };
      case 'lg':
        return {
          container: 'px-6 py-3',
          coin: 'w-8 h-8',
          text: 'text-lg font-bold'
        };
      default:
        return {
          container: 'px-4 py-2',
          coin: 'w-6 h-6',
          text: 'text-sm font-bold'
        };
    }
  };

  const sizes = getSizeClasses();

  return (
    <div className={`
      flex items-center gap-2 
      bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 
      ${sizes.container} 
      rounded-xl 
      border border-orange-200 
      shadow-lg 
      hover:shadow-xl 
      transition-all duration-300 
      hover:scale-105
      ${className}
    `}>
      {/* Image 3D des crédits */}
      <div className="relative group">
        {/* Ombre de l'image */}
        <div className={`
          ${sizes.coin} 
          absolute 
          transform translate-x-1 translate-y-1 
          opacity-30 
          blur-sm
        `}>
          <img 
            src="/credit-3D.png" 
            alt="Credit shadow" 
            className={`${sizes.coin} object-contain`}
          />
        </div>
        
        {/* Image principale avec effets */}
        <div className={`
          ${sizes.coin} 
          transform 
          group-hover:rotate-180 
          transition-transform duration-500 
          relative 
          overflow-hidden
          drop-shadow-lg
        `}>
          <img 
            src="/credit-3D.png" 
            alt="Credits" 
            className={`${sizes.coin} object-contain hover:scale-110 transition-transform duration-300`}
          />
          
          {/* Effet de brillance animé */}
          <div className={`
            ${sizes.coin} 
            bg-gradient-to-r from-transparent via-white/30 to-transparent 
            rounded-full 
            absolute inset-0 
            transform -skew-x-12 
            animate-pulse
          `}></div>
        </div>
      </div>
      
      {/* Texte avec effet gradient */}
      <span className={`
        ${sizes.text} 
        bg-gradient-to-r from-orange-700 to-orange-600 
        bg-clip-text text-transparent
      `}>
        {credits === 0 ? 'Gratuit' : `${credits} crédits`}
      </span>
    </div>
  );
};