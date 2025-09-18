import React from 'react';
import CloseIcon from './CloseIcon';

interface DeliverableModalHeaderProps {
  title: string;
  iconSrc?: string;
  iconComponent?: React.ReactNode;
  onClose: () => void;
  className?: string;
}

const DeliverableModalHeader: React.FC<DeliverableModalHeaderProps> = ({
  title,
  iconSrc,
  iconComponent,
  onClose,
  className = ""
}) => {
  return (
    <div className={`sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center">
        {iconComponent && (
          <div className="w-8 h-8 flex items-center justify-center mb-2 sm:mb-0 sm:mr-3">
            {iconComponent}
          </div>
        )}
        {iconSrc && (
          <img 
            src={iconSrc} 
            alt="Template Icon" 
            className="w-8 h-8 object-cover mb-2 sm:mb-0 sm:mr-3" 
          />
        )}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <CloseIcon onClick={onClose} />
    </div>
  );
};

export default DeliverableModalHeader;