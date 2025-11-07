import React from 'react';
import { DeliverableType } from '@/types/deliverableDefinitions';
import { deliverableDefinitions } from '@/data/deliverableDefinitions';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface DefinitionContentProps {
  deliverableType: DeliverableType;
}

export const DefinitionContent: React.FC<DefinitionContentProps> = ({ deliverableType }) => {
  const definition = deliverableDefinitions[deliverableType];

  if (!definition) {
    return (
      <div className="prose max-w-none">
        <p className="text-gray-500">Aucune définition disponible pour ce livrable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Qu'est-ce que c'est ? */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-gray-900">Qu'est-ce que c'est ?</h3>
        <p className="text-gray-700 leading-relaxed">{definition.whatIsIt}</p>
      </section>

      {/* Pourquoi c'est crucial ? */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Pourquoi c'est crucial ?</h3>
        <ul className="space-y-3">
          {definition.whyCrucial.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quand l'utiliser ? */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-gray-900">Quand l'utiliser ?</h3>
        <p className="text-gray-700 leading-relaxed">{definition.whenToUse}</p>
      </section>

      {/* Ce qu'un bon livrable contient */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Ce qu'un bon livrable contient</h3>
        <ul className="space-y-3">
          {definition.whatGoodContains.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Pièges courants à éviter */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Pièges courants à éviter</h3>
        <div className="space-y-4">
          {definition.commonPitfalls.map((pitfall, index) => (
            <div key={index} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="font-medium text-gray-900">{pitfall.mistake}</p>
              </div>
              <p className="text-gray-700 ml-8 leading-relaxed">
                <span className="font-medium text-green-700">Solution : </span>
                {pitfall.solution}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
