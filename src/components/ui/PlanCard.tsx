import React from 'react';
import { CheckCircle } from 'lucide-react'; // Using CheckCircle for the checkmark icon

interface PlanCardProps {
  title: string;
  price: string;
  oldPrice?: string;
  deliverables: React.ReactNode[];
  buttonText: string;
  pdfSection: React.ReactNode; // New prop for PDF section
  creditsSection: React.ReactNode; // New prop for Credits section
  className?: string;
  onButtonClick?: () => void; // New prop for button click handler
}

const PlanCard: React.FC<PlanCardProps> = ({ title, price, oldPrice, deliverables, buttonText, pdfSection, creditsSection, className, onButtonClick }) => {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center w-full md:w-[300px] ${className} ${title === 'Niveau 2' ? 'border-2 border-aurentia-pink' : 'border border-pink-300'}`}>
      <h2 className="text-3xl font-bold text-aurentia-pink mt-4">{title}</h2>
      <div className="flex items-baseline gap-2 mb-2">
        {oldPrice && <span className="text-gray-500 text-sm line-through">{oldPrice}</span>}
        <p className="text-[#2D2D2D] text-3xl font-bold">{price}</p>
      </div>
      <div className="mb-6 relative rounded-full p-[2px] bg-gradient-to-r from-aurentia-pink to-aurentia-orange">
        <button className="px-4 py-2 rounded-full text-sm bg-white">
          <span className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
            Offre bêta ! (Expire le 18 juillet)
          </span>
        </button>
      </div>
      <div className="w-4/5 border-b border-gray-300 mx-auto mb-6"></div> {/* Divider */}
      <div className="flex flex-col gap-4 w-full mb-6">
        {pdfSection}
        {creditsSection}
      </div>
      <ul className="list-none p-0 m-0 text-left w-full">
        {deliverables.map((item, index) => (
          <li key={index} className="flex items-start mb-3"> {/* Changed items-center to items-start for better top alignment with wrapped text */}
            <CheckCircle className="text-aurentia-pink mr-3 flex-shrink-0" size={20} /> {/* Added flex-shrink-0 */}
            <span className="text-gray-800 flex-grow">{item}</span> {/* Added flex-grow */}
          </li>
        ))}
      </ul>
      <div className="w-4/5 border-b border-gray-300 mx-auto mb-6"></div> {/* Divider after deliverables */}
      <button
        className="mt-auto w-full py-3 rounded-full text-white font-bold bg-gradient-to-r from-aurentia-pink to-aurentia-orange"
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default PlanCard;
