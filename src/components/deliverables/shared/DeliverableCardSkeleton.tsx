import React from 'react';

const DeliverableCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#f4f4f5] rounded-xl px-4 py-2 h-full mb-4 animate-pulse">
      <div className="flex gap-4 h-full items-center">
        {/* Left side: Icon skeleton */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-[#e0e0e0] rounded-lg"></div>
        </div>

        {/* Right side: Content skeleton */}
        <div className="flex-grow flex flex-col min-w-0 gap-2">
          {/* Title skeleton */}
          <div className="h-4 bg-[#e0e0e0] rounded w-3/4"></div>

          {/* Description skeleton - 2 lines */}
          <div className="space-y-1.5">
            <div className="h-3 bg-[#e0e0e0] rounded w-full"></div>
            <div className="h-3 bg-[#e0e0e0] rounded w-5/6"></div>
          </div>

          {/* Tag skeleton */}
          <div className="h-5 bg-[#e0e0e0] rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
};

export default DeliverableCardSkeleton;
