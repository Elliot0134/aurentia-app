import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ProjectCreationData } from '@/types/projectCreation';
import { VoiceInputFieldButton } from '@/components/ui/voice-input-button';

interface StepNeedsProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
}

const StepNeeds = ({ data, onChange }: StepNeedsProps) => {
  const needsRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Vos besoins</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            De quoi avez-vous besoin pour vous lancer ?
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/ressources-icon.png" alt="Besoins" className="w-10 h-10 object-contain" />
            </div>
            <div className="relative flex-1">
              <Textarea
                ref={needsRef}
                className="flex-1 text-base md:text-lg min-h-[120px] pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="Matériel, compétences, ressources financières, partenaires, etc."
                value={data.needs || ''}
                onChange={(e) => onChange('needs', e.target.value)}
              />
              <div className="absolute bottom-3 right-3">
                <VoiceInputFieldButton
                  fieldId="create-project-needs"
                  inputRef={needsRef}
                  size="sm"
                  variant="ghost"
                  questionContext="De quoi avez-vous besoin pour vous lancer ?"
                  onTranscript={(text) => onChange('needs', text)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepNeeds;
