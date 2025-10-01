import React from 'react';

interface HarmonizedDeliverableCardProps {
  title: string;
  description?: string;
  avis?: string;
  iconSrc: string;
  onClick: () => void;
  className?: string;
}

const HarmonizedDeliverableCard: React.FC<HarmonizedDeliverableCardProps> = ({
  title,
  description,
  avis,
  iconSrc,
  onClick,
  className = ''
}) => {
  return (
    <div
      className={`border border-gray-200 rounded-xl p-4 mb-4 text-white cursor-pointer flex justify-between h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${className}`}
      onClick={onClick}
      style={{ backgroundColor: 'white' }}
    >
      <div className="flex-grow flex flex-col">
        <h2 className="text-xl font-bold mb-2 text-black">{title}</h2>
        {description && <p className="text-gray-700 mb-4 line-clamp-3">{description}</p>}
        <div className="flex-grow">
          {/* Content will be dynamically generated */}
        </div>
        {avis && (
          <div className="flex-shrink-0 mt-auto">
            <button
              className="text-xs px-2 py-1 rounded-full cursor-default pointer-events-none"
              style={{ backgroundColor: '#FEF2ED', color: '#FF5932', border: '1px solid #FFBDA4' }}
            >
              {avis}
            </button>
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <img src={iconSrc} alt="Deliverable Icon" className="w-8 h-8 object-cover self-start" />
      </div>
    </div>
  );
};

export default HarmonizedDeliverableCard;
