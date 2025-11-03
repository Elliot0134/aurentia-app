import { Textarea } from '@/components/ui/textarea';
import { ProjectCreationData } from '@/types/projectCreation';

interface StepRetranscriptionProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
  isLoading?: boolean;
}

const StepRetranscription = ({ data, onChange, isLoading }: StepRetranscriptionProps) => {
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="spinner mb-4"></div>
        <p className="text-gray-600 text-lg">Génération de votre retranscription en cours...</p>
      </div>
    );
  }

  // Définition des champs avec leurs icônes
  const fields = [
    { key: 'descriptionSynthetique', label: 'Description synthétique', placeholder: 'Décrivez votre concept de manière concise.', icon: 'retranscription-icon.png' },
    { key: 'produitServiceRetranscription', label: 'Produit / Service', placeholder: 'Détaillez les produits ou services que vous proposez.', icon: 'proposition-valeur-icon.png' },
    { key: 'propositionValeur', label: 'Proposition de valeur', placeholder: 'Quelle valeur unique apportez-vous à vos clients ?', icon: 'proposition-valeur-icon.png' },
    { key: 'elementDistinctif', label: 'Élément distinctif', placeholder: 'Qu\'est-ce qui vous différencie de la concurrence ?', icon: 'concurrence-icon.png' },
    { key: 'clienteleCibleRetranscription', label: 'Clientèle cible', placeholder: 'Décrivez votre public idéal.', icon: 'persona-icon.png' },
    { key: 'problemResoudreRetranscription', label: 'Problème à résoudre', placeholder: 'Quel problème majeur votre solution résout-elle ?', icon: 'market-icon.png' },
    { key: 'vision3Ans', label: 'Vision 3 ans', placeholder: 'Où vous voyez-vous dans 3 ans avec ce projet ?', icon: 'vision-icon.png' },
    { key: 'businessModel', label: 'Business Model', placeholder: 'Comment allez-vous générer des revenus ?', icon: 'business-model-icon.png' },
    { key: 'competences', label: 'Compétences', placeholder: 'Quelles compétences clés possède votre équipe ?', icon: 'ressources-icon.png' },
    { key: 'monPourquoiRetranscription', label: 'Mon Pourquoi', placeholder: 'Décrivez vos motivations profondes pour ce projet.', icon: 'story-icon.png' },
    { key: 'equipeFondatrice', label: 'L\'équipe fondatrice', placeholder: 'Décrivez l\'équipe fondatrice et ses compétences clés.', icon: 'partenaires-icon.png' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Bandeau d'alerte en haut */}
      <div className="text-center text-lg md:text-xl font-semibold p-4 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
        Modifiez les réponses un maximum
        <p className="text-sm font-normal mt-1">
          Plus vous donnez d'informations sur votre concept, plus la génération des livrables sera développée.
        </p>
      </div>

      {/* Champs de retranscription avec icônes */}
      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="block text-base md:text-lg text-gray-800">{field.label}</label>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Icon container - matches full height of content */}
              <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
                <img src={`/icones-livrables/${field.icon}`} alt={field.label} className="w-10 h-10 object-contain" />
              </div>
              <Textarea
                placeholder={field.placeholder}
                className="flex-1 min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={data[field.key as keyof ProjectCreationData] as string || ''}
                onChange={(e) => onChange(field.key as keyof ProjectCreationData, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepRetranscription;
