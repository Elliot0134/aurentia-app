import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ProjectCreationData } from '@/types/projectCreation';
import { VoiceInputFieldButton } from '@/components/ui/voice-input-button';

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
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Commençons par les bases</h2>
      </div>

      <div className="space-y-6">
        {/* Question 1 - Nom du projet */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            Quel est le nom de votre projet ?
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Icon container - Desktop only, takes full height of content */}
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/reglage-icon.png" alt="Nom du projet" className="w-10 h-10 object-contain" />
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
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceInputFieldButton
                  fieldId="create-project-projectName"
                  inputRef={projectNameRef}
                  size="sm"
                  variant="ghost"
                  questionContext="Quel est le nom de votre projet ?"
                  onTranscript={(text) => onChange('projectName', text)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question 2 - Description */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            Décrivez votre projet en une phrase
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Icon container - Desktop only, takes full height of content */}
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/retranscription-icon.png" alt="Description" className="w-10 h-10 object-contain" />
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
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceInputFieldButton
                  fieldId="create-project-projectIdeaSentence"
                  inputRef={projectIdeaRef}
                  size="sm"
                  variant="ghost"
                  questionContext="Décrivez votre projet en une phrase"
                  onTranscript={(text) => onChange('projectIdeaSentence', text)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepBasicInfo;
