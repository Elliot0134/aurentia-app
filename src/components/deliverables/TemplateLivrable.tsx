import React, { useState } from 'react';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';

interface StructureContent {
  title: string;
  content: string;
}

interface StructureSection {
  title: string;
  items: StructureContent[];
}

interface LivrableProps {
  title: string;
  avis: string;
  justification_avis: string;
  structure: StructureSection[];
  iconSrc?: string;
  definition?: string;
  recommendations?: string;
}

const TemplateLivrable: React.FC<LivrableProps> = ({
  title,
  avis,
  justification_avis,
  structure,
  iconSrc = "/icones-livrables/market-icon.png",
  definition,
  recommendations,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <div
        className={`p-6 border rounded-lg shadow cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-indigo-300 bg-white hover:border-indigo-500`}
        onClick={handleTemplateClick}
      >
        <img src={iconSrc} alt={`${title} icon`} className="mb-4 h-16 w-16 object-contain" />
        <h3 className={`text-xl font-semibold mb-2 text-indigo-700`}>{title}</h3>
        
        {avis && (
          <div className="mt-4">
            <span className="inline-block px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
              ✅ Généré
            </span>
          </div>
        )}
      </div>

      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        iconSrc={iconSrc}
        title={title}
        definition={definition}
        recommendations={recommendations}
        hasContent={!!avis}
        hasDefinition={!!definition}
        structure={structure}
      >
        <div className="space-y-6">
          {avis && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-800 mb-2">Avis Expert</h4>
              <p className="text-blue-700">{avis}</p>
            </div>
          )}

          {justification_avis && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-amber-800 mb-2">Justification</h4>
              <p className="text-amber-700">{justification_avis}</p>
            </div>
          )}
        </div>
      </HarmonizedDeliverableModal>
    </>
  );
};

export default TemplateLivrable;
