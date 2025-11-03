import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ProjectCreationData } from '@/types/projectCreation';
import { VoiceInputFieldButton } from '@/components/ui/voice-input-button';

interface StepAdditionalInfoProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
}

const StepAdditionalInfo = ({ data, onChange }: StepAdditionalInfoProps) => {
  const additionalInfoRef = useRef<HTMLTextAreaElement>(null);
  const whyEntrepreneurRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Pour finir...</h2>
      </div>

      <div className="space-y-6">
        {/* Question 1 - Informations supplémentaires */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            Informations supplémentaires <span className="text-sm text-gray-500">(optionnel)</span>
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/retranscription-icon.png" alt="Informations" className="w-10 h-10 object-contain" />
            </div>
            <div className="relative flex-1">
              <Textarea
                ref={additionalInfoRef}
                className="flex-1 text-base md:text-lg min-h-[120px] pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="Ajoutez ici toute information supplémentaire pertinente pour votre projet..."
                value={data.additionalInfo || ''}
                onChange={(e) => onChange('additionalInfo', e.target.value)}
              />
              <div className="absolute bottom-3 right-3">
                <VoiceInputFieldButton
                  fieldId="create-project-additionalInfo"
                  inputRef={additionalInfoRef}
                  size="sm"
                  variant="ghost"
                  questionContext="Informations supplémentaires pertinentes pour votre projet"
                  onTranscript={(text) => onChange('additionalInfo', text)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question 2 - Motivation */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            Pourquoi souhaitez-vous entreprendre ? <span className="text-sm text-gray-500">(optionnel)</span>
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/story-icon.png" alt="Motivation" className="w-10 h-10 object-contain" />
            </div>
            <div className="relative flex-1">
              <Textarea
                ref={whyEntrepreneurRef}
                className="flex-1 text-base md:text-lg min-h-[120px] pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="Décrivez vos motivations et objectifs..."
                value={data.whyEntrepreneur || ''}
                onChange={(e) => onChange('whyEntrepreneur', e.target.value)}
              />
              <div className="absolute bottom-3 right-3">
                <VoiceInputFieldButton
                  fieldId="create-project-whyEntrepreneur"
                  inputRef={whyEntrepreneurRef}
                  size="sm"
                  variant="ghost"
                  questionContext="Pourquoi souhaitez-vous entreprendre ?"
                  onTranscript={(text) => onChange('whyEntrepreneur', text)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepAdditionalInfo;
