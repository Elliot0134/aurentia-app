import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  images: string[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  activeIndex,
  onIndexChange,
  className
}) => {
  if (!images || images.length === 0) {
    return (
      <div className={cn("aspect-square bg-gray-100 rounded-lg flex items-center justify-center", className)}>
        <span className="text-6xl">📄</span>
      </div>
    );
  }

  const goToPrevious = () => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    onIndexChange(newIndex);
  };

  const goToNext = () => {
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    onIndexChange(newIndex);
  };

  const goToSlide = (index: number) => {
    onIndexChange(index);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Image principale */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src={images[activeIndex]} 
          alt={`Image ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Flèches de navigation (seulement si plus d'une image) */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Indicateurs de pagination (dots) */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === activeIndex 
                  ? "bg-[#F86E19] w-6" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Thumbnails (miniatures) optionnelles */}
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                index === activeIndex 
                  ? "border-[#F86E19] opacity-100" 
                  : "border-gray-200 opacity-60 hover:opacity-80"
              )}
              onClick={() => goToSlide(index)}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;