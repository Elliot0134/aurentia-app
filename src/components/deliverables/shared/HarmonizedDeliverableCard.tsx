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
      className={`bg-[#f4f4f5] rounded-xl px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#e8e8e9] h-full mb-4 ${className}`}
      onClick={onClick}
    >
      <div className="flex gap-4 h-full items-center">
        {/* Left side: Icon centered vertically */}
        <div className="flex-shrink-0">
          <img src={iconSrc} alt="Deliverable Icon" className="w-12 h-12 object-contain" />
        </div>

        {/* Right side: Content */}
        <div className="flex-grow flex flex-col min-w-0">
          <h2 className="text-base font-sans font-semibold mb-1.5 text-text-primary">{title}</h2>
          {description && (
            <p className="text-xs font-sans text-text-muted mb-2 line-clamp-2 flex-grow">
              {description}
            </p>
          )}
          {avis && (
            <div className="flex-shrink-0 mt-auto">
              <span
                className="inline-block text-xs font-sans px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#FEF2ED', color: '#FF5932', border: '1px solid #FFBDA4' }}
              >
                {avis}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HarmonizedDeliverableCard;
