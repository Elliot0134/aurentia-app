import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Award, Briefcase, GraduationCap, Star, Trophy, Globe, Handshake } from 'lucide-react';
import './Timeline.css';

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date: string; // This will now hold the timeframe string
  icon: React.ReactNode;
  isActive?: boolean;
}

interface TimelineProps {
  items?: TimelineItem[];
  accentColor?: 'blue' | 'emerald';
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({
  items = [], // Changed default to empty array as items will come from fetched data
  accentColor = 'blue',
  className = ''
}) => {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const accentClasses = {
    blue: {
      marker: 'bg-blue-500',
      ring: 'focus:ring-blue-500',
      shadow: 'shadow-blue-500/20'
    },
    emerald: {
      marker: 'bg-emerald-500',
      ring: 'focus:ring-emerald-500',
      shadow: 'shadow-emerald-500/20'
    }
  };

  const accent = accentClasses[accentColor];

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-timeline-item]');
    elements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        elements.forEach((el) => {
          observerRef.current?.unobserve(el);
        });
      }
    };
  }, [items]);

  return (
    <div className={`min-h-screen bg-gray-50 font-['Poppins', 'Inter', system-ui, sans-serif] rounded-lg ${className}`}> {/* Added rounded-lg class */}
      <div className="w-full md:max-w-4xl md:mx-auto py-8 px-0 md:p-12 rounded-lg"> {/* Added rounded-lg class */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Ma success story</h2> {/* Added timeline title */}
        {/* Removed static header */}
        {/* Removed static description */}

        <div className="grid grid-cols-1 md:grid-cols-[40px_1fr] gap-0 relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-[19px] top-0 bottom-0 w-[2px] bg-gray-200"></div>

          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {/* Timeline Marker */}
              <div className="hidden md:flex items-start justify-center pt-8">
                <div
                  className={`
                    relative w-3 h-3 rounded-full transition-all duration-300 ease-in-out z-10
                    ${item.isActive || visibleItems.has(item.id)
                      ? `${accent.marker} shadow-lg ${accent.shadow}`
                      : 'bg-gray-300'
                    }
                  `}
                >
                  {(item.isActive || visibleItems.has(item.id)) && (
                    <div className={`absolute inset-0 rounded-full ${accent.marker} animate-ping opacity-20`}></div>
                  )}
                </div>
              </div>

              {/* Timeline Content */}
              <div
                id={item.id}
                data-timeline-item
                className={`
                  timeline-item opacity-0 translate-y-4 transition-all duration-700 ease-out
                  ${visibleItems.has(item.id) ? 'opacity-100 translate-y-0' : ''}
                  ${index < items.length - 1 ? 'mb-8 md:mb-12' : ''}
                `}
                style={{
                  transitionDelay: `${index * 150}ms`
                }}
              >
                <div
                  className={`
                    group bg-white rounded-lg border-[0.5px] border-gray-200
                    shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 md:p-8
                    transition-all duration-300 ease-in-out cursor-pointer
                    hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-1
                    focus:outline-none focus:ring-2 ${accent.ring} focus:ring-offset-2
                    min-h-[44px] md:ml-0 ml-0
                  `}
                  tabIndex={0}
                  role="article"
                  aria-label={`Timeline item: ${item.title}`}
                >
                  {/* Mobile Timeline Marker */}
                  <div className="md:hidden flex items-center mb-4">
                    <div
                      className={`
                        w-3 h-3 rounded-full mr-4 transition-all duration-300 ease-in-out
                        ${item.isActive || visibleItems.has(item.id)
                          ? `${accent.marker} shadow-lg ${accent.shadow}`
                          : 'bg-gray-300'
                        }
                      `}
                    ></div>
                    <div className="flex-1 h-[2px] bg-gray-200"></div>
                  </div>

                  <div className="flex flex-col items-start md:flex-row md:items-start md:space-x-4">
                    <div className="flex-shrink-0 mt-1 mb-4 md:mb-1"> {/* Added mb-4 for mobile spacing */}
                      <div className={`
                        p-2 rounded-lg bg-gray-50 text-gray-600
                        group-hover:bg-gray-100 transition-colors duration-300
                        ${(item.isActive || visibleItems.has(item.id)) ? `text-${accentColor}-600` : ''}
                      `}>
                        {item.icon}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <h3 className="text-xl md:text-2xl font-medium tracking-wide text-gray-900 mb-1 md:mb-0">
                          {item.title}
                        </h3>
                        <time className="text-sm text-gray-500 font-light flex items-center">
                          {/* Removed Calendar icon here as date is now timeframe */}
                          {/* Removed timeframe text as requested */}
                        </time>
                      </div>

                      <p className="text-sm text-gray-500 font-light mb-4 tracking-wide">
                        {item.subtitle}
                      </p>

                      <p className="text-base text-gray-700 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
};

// Removed defaultTimelineItems as data will be fetched

export default Timeline;
