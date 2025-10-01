import React from 'react';
import CloseIcon from './CloseIcon';
import { Edit } from 'lucide-react';

interface DeliverableModalHeaderProps {
  title: string;
  iconSrc?: string;
  iconComponent?: React.ReactNode;
  onClose: () => void;
  onEdit?: () => void;
  className?: string;
}

const DeliverableModalHeader: React.FC<DeliverableModalHeaderProps> = ({
  title,
  iconSrc,
  iconComponent,
  onClose,
  onEdit,
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
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            className="text-gray-600 hover:text-gray-900 transition-colors p-1"
            onClick={onEdit}
          >
            <Edit className="h-6 w-6" />
          </button>
        )}
        <CloseIcon onClick={onClose} />
      </div>
    </div>
  );
};

export default DeliverableModalHeader;
