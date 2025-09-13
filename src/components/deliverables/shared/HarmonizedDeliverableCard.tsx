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
  avis = 'Commentaire',
  iconSrc,
  onClick,
  className = ''
}) => {
  return (
    <div
      className={`border rounded-lg p-4 mb-4 text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-full ${className}`}
      onClick={onClick}
      style={{ borderColor: '#e2e8f0', backgroundColor: 'white' }}
    >
      <div className="flex-grow flex flex-col">
        <h2 className="text-xl font-bold mb-2 text-black">{title}</h2>
        {description && <p className="text-gray-700 mb-4 line-clamp-3">{description}</p>}
        <div className="flex-grow">
          {/* Content will be dynamically generated */}
        </div>
        <div className="flex-shrink-0 mt-auto">
          <button 
            className="text-xs px-2 py-1 rounded-full cursor-default pointer-events-none"
            style={{ backgroundColor: '#FEF2ED', color: '#FF5932', border: '1px solid #FFBDA4' }}
          >
            {avis}
          </button>
        </div>
      </div>
      <div className="flex-shrink-0">
        <img src={iconSrc} alt="Deliverable Icon" className="w-8 h-8 object-cover self-start" />
      </div>
    </div>
  );
};

export default HarmonizedDeliverableCard;