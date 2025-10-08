import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ items, className }) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm"
        >
          <button
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F86E19]/20"
            onClick={() => toggleItem(index)}
          >
            <span className="font-semibold text-gray-900 pr-4">
              {item.question}
            </span>
            <div
              className={cn(
                "flex-shrink-0 transition-transform duration-200",
                openItems.has(index) && "rotate-180"
              )}
            >
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </button>
          
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openItems.has(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="px-6 pb-4 text-gray-700 leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;