import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ProjectCreationData } from '@/types/projectCreation';
import { VoiceInputFieldButton } from '@/components/ui/voice-input-button';

interface StepProductsServicesProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
}

const StepProductsServices = ({ data, onChange }: StepProductsServicesProps) => {
  const productsServicesRef = useRef<HTMLTextAreaElement>(null);
  const problemSolvedRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Vos produits et services</h2>
      </div>

      <div className="space-y-6">
        {/* Question 1 - Produits/Services */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            Quels produits/services souhaitez-vous proposer ?
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/proposition-valeur-icon.png" alt="Produits" className="w-10 h-10 object-contain" />
            </div>
            <div className="relative flex-1">
              <Textarea
                ref={productsServicesRef}
                className="flex-1 text-base md:text-lg min-h-[120px] pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="Notez sous forme de liste les produits ou services que vous allez proposer..."
                value={data.productsServices || ''}
                onChange={(e) => onChange('productsServices', e.target.value)}
              />
              <div className="absolute bottom-3 right-3">
                <VoiceInputFieldButton
                  fieldId="create-project-productsServices"
                  inputRef={productsServicesRef}
                  size="sm"
                  variant="ghost"
                  questionContext="Quels produits/services souhaitez-vous proposer ?"
                  onTranscript={(text) => onChange('productsServices', text)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question 2 - Problème résolu */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            À quel problème répond votre projet ?
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/market-icon.png" alt="Problème" className="w-10 h-10 object-contain" />
            </div>
            <div className="relative flex-1">
              <Textarea
                ref={problemSolvedRef}
                className="flex-1 text-base md:text-lg min-h-[120px] pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="Identifiez le besoin auquel votre solution répond concrètement..."
                value={data.problemSolved || ''}
                onChange={(e) => onChange('problemSolved', e.target.value)}
              />
              <div className="absolute bottom-3 right-3">
                <VoiceInputFieldButton
                  fieldId="create-project-problemSolved"
                  inputRef={problemSolvedRef}
                  size="sm"
                  variant="ghost"
                  questionContext="À quel problème répond votre projet ?"
                  onTranscript={(text) => onChange('problemSolved', text)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepProductsServices;
