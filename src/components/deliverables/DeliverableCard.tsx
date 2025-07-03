import React from 'react';

interface DeliverableCardProps {
  title: string;
  description: string;
  iconSrc: string;
  bgColor: string;
  onClick: () => void;
  isBlurred?: boolean;
  onUnlockClick?: () => void;
}

const DeliverableCard: React.FC<DeliverableCardProps> = ({
  title,
  description,
  iconSrc,
  bgColor,
  onClick,
  isBlurred = false,
  onUnlockClick,
}) => {
  return (
    <div
      className={`relative border rounded-lg p-4 transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-full ${bgColor}`}
      onClick={onClick}
    >
      <div className="flex-grow mr-4">
        <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
        {description && <p className="text-white text-sm">{description}</p>}
      </div>
      <div className="flex-shrink-0 mt-4 self-end">
        <img src={iconSrc} alt={`${title} Icon`} className="w-8 h-8 object-cover" />
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
