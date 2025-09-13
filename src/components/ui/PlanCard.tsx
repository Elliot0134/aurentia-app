import React from 'react';

interface PlanCardProps {
  title: string;
  price: React.ReactNode; // Changed to React.ReactNode
  oldPrice?: string;
  deliverables: React.ReactNode[];
  buttonText: string;
  creditsSection: React.ReactNode; // New prop for Credits section
  className?: string;
  onButtonClick?: () => void; // New prop for button click handler
}

import { Flame, Check } from 'lucide-react'; // Import Flame and Check icons

const PlanCard: React.FC<PlanCardProps> = ({ title, price, oldPrice, deliverables, buttonText, creditsSection, className, onButtonClick }) => {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center md:w-[350px] ${className} border border-gray-200`}>
      {/* Bandeau "Populaire" */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#FF5932] text-white text-sm font-bold px-4 py-1 rounded-full flex items-center gap-1">
        <Flame size={16} fill="white" /> Populaire
      </div>
      <h2 className="text-3xl font-bold text-[#FF5932] mb-4 md:mb-2">{title}</h2>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-[#2D2D2D] text-5xl font-bold">€12,90<span className="text-base font-normal">/mois</span></p>
      </div>
      <div className="w-4/5 border-b border-gray-300 mx-auto mb-6"></div> {/* Divider */}
      <div className="bg-gray-100 p-3 rounded-lg text-gray-800 text-center mb-6 w-4/5 mx-auto">
        <span className="font-bold text-lg">🎁 Premiers livrables premium offerts ! 🎁</span>
      </div>
      <ul className="list-none p-0 m-0 w-4/5 mx-auto flex flex-col items-start mb-6">
        {deliverables.map((item, index) => (
          <li key={index} className="flex items-center mb-3 w-full">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5932] flex items-center justify-center mr-2">
              <Check size={16} className="text-white" />
            </div>
            <span className="text-gray-800 text-xl text-left">{item}</span>
          </li>
        ))}
      </ul>
      <button
        className="mt-auto w-4/5 mx-auto py-3 rounded-lg text-white text-lg font-normal bg-[#FF5932] hover:opacity-90 transition-opacity"
        onClick={onButtonClick}
      >
        C'est partit !
      </button>
    </div>
  );
};

export default PlanCard;
