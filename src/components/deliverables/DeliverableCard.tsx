import React from 'react';

interface DeliverableCardProps {
  title: string;
  description: string;
  iconSrc: string;
  bgColor: string;
  onClick: () => void;
  isBlurred?: boolean;
  onUnlockClick?: () => void;
  avis?: string | null; // Add avis prop
}

const DeliverableCard: React.FC<DeliverableCardProps> = ({
  title,
  description,
  iconSrc,
  bgColor, // This prop will now be ignored for background color, but kept for compatibility
  onClick,
  isBlurred = false,
  onUnlockClick,
  avis,
}) => {
  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 bg-white text-black transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-full`}
      onClick={onClick}
    >
      <div className="flex-grow flex flex-col">
        <h2 className="text-xl font-bold mb-2 text-black">{title}</h2>
        {description && <p className="text-gray-700 mb-4 line-clamp-3">{description}</p>}
        <div className="flex-grow">
          {/* Children for the template content */}
        </div>
        <div className="flex-shrink-0 mt-auto">
          {avis && (
            <button className={`text-xs px-2 py-1 rounded-full cursor-default pointer-events-none`} style={{ backgroundColor: '#FEF2ED', color: '#FF5932', border: '1px solid #FFBDA4' }}>
              {avis}
            </button>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <img src={iconSrc} alt={`${title} Icon`} className="w-8 h-8 object-cover self-start" />
      </div>

      {isBlurred && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex flex-col items-center justify-center rounded-lg p-4 text-center">
          <p className="text-gray-700 font-semibold mb-4">Débloquez ce livrable</p>
          {onUnlockClick && (
            <button
              className="btn-primary text-sm px-4 py-2"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click from firing
                onUnlockClick();
              }}
            >
              Débloquer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliverableCard;
