import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectCreationData } from '@/types/projectCreation';

interface StepTypeLocationProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
}

const StepTypeLocation = ({ data, onChange }: StepTypeLocationProps) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Type et localisation</h2>
      </div>

      <div className="space-y-6">
        {/* Question 1 - Type de projet */}
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            Quel est le type de votre projet ?
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/business-model-icon.png" alt="Type" className="w-10 h-10 object-contain" />
            </div>
            <Select value={data.projectType || ''} onValueChange={(value) => onChange('projectType', value)}>
              <SelectTrigger className="flex-1 text-base md:text-lg transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Physique">Physique (Boutique, restaurant, etc.)</SelectItem>
                <SelectItem value="Digital">Digital (E-commerce, logiciel, formation, etc.)</SelectItem>
                <SelectItem value="Les deux">Les deux (Agence web avec local)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Question 2 - Zone géographique (conditional) */}
        {(data.projectType === 'Physique' || data.projectType === 'Les deux') && (
          <div className="space-y-3">
            <label className="block text-base md:text-lg text-gray-800">
              Quelle zone géographique ciblez-vous ?
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
                <img src="/icones-livrables/distribution-icon.png" alt="Localisation" className="w-10 h-10 object-contain" />
              </div>
              <Input
                type="text"
                className="flex-1 text-base md:text-lg transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="Ville, région, pays..."
                value={data.geographicArea || ''}
                onChange={(e) => onChange('geographicArea', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepTypeLocation;
