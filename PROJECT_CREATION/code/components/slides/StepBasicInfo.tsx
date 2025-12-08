'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ProjectCreationData } from '@/types/projectCreation';

interface StepBasicInfoProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
}

const StepBasicInfo = ({ data, onChange }: StepBasicInfoProps) => {
  const projectNameRef = useRef<HTMLInputElement>(null);
  const projectIdeaRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Commençons par les bases
        </h2>
      </div>

      <div className="space-y-6">
        {/* Question 1 - Nom du projet */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800 dark:text-gray-200">
            Quel est le nom de votre projet ?
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Icon container - Desktop only */}
            <div className="hidden md:flex w-16 bg-gray-100 dark:bg-gray-800 rounded-lg items-center justify-center flex-shrink-0">
              <img 
                src="/icones-livrables/reglage-icon.png" 
                alt="Nom du projet" 
                className="w-10 h-10 object-contain" 
              />
            </div>
            <div className="relative flex-1">
              <Input
                ref={projectNameRef}
                type="text"
                className="flex-1 text-base md:text-lg pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="Ex: Ma Boutique Éco-Responsable"
                value={data.projectName || ''}
                onChange={(e) => onChange('projectName', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Question 2 - Description */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800 dark:text-gray-200">
            Décrivez votre projet en une phrase
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Icon container - Desktop only */}
            <div className="hidden md:flex w-16 bg-gray-100 dark:bg-gray-800 rounded-lg items-center justify-center flex-shrink-0">
              <img 
                src="/icones-livrables/retranscription-icon.png" 
                alt="Description" 
                className="w-10 h-10 object-contain" 
              />
            </div>
            <div className="relative flex-1">
              <Input
                ref={projectIdeaRef}
                type="text"
                className="flex-1 text-base md:text-lg pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="Ex: Une plateforme pour connecter les producteurs locaux aux consommateurs"
                value={data.projectIdeaSentence || ''}
                onChange={(e) => onChange('projectIdeaSentence', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepBasicInfo;
