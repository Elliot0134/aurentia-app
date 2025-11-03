import { Textarea } from '@/components/ui/textarea';
import { ProjectCreationData } from '@/types/projectCreation';

interface StepTeamProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
}

const StepTeam = ({ data, onChange }: StepTeamProps) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Votre équipe</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-base md:text-lg text-gray-800">
            Combien êtes-vous sur le projet ?
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
              <img src="/icones-livrables/partenaires-icon.png" alt="Équipe" className="w-10 h-10 object-contain" />
            </div>
            <Textarea
              className="flex-1 text-base md:text-lg min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              placeholder="Ex: Je suis seul / Nous sommes 2 cofondateurs / Une équipe de 5 personnes..."
              value={data.teamSize || ''}
              onChange={(e) => onChange('teamSize', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTeam;
