'use client';

import { ProjectCreationData } from '@/types/projectCreation';
import { Textarea } from '@/components/ui/textarea';

interface StepRetranscriptionProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
  isLoading?: boolean;
}

interface RetranscriptionField {
  key: keyof ProjectCreationData;
  label: string;
  placeholder: string;
  icon: string;
}

const StepRetranscription = ({ data, onChange, isLoading }: StepRetranscriptionProps) => {
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Génération de votre retranscription en cours...
        </p>
      </div>
    );
  }

  const fields: RetranscriptionField[] = [
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
    { key: 'equipeFondatrice', label: "L'équipe fondatrice", placeholder: "Décrivez l'équipe fondatrice et ses compétences clés.", icon: 'partenaires-icon.png' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Bandeau d'alerte */}
      <div className="text-center text-lg md:text-xl font-semibold p-4 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
        Modifiez les réponses un maximum
        <p className="text-sm font-normal mt-1">
          Plus vous donnez d'informations sur votre concept, plus la génération des livrables sera développée.
        </p>
      </div>

      {/* Champs de retranscription */}
      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  src={`/icones-livrables/${field.icon}`} 
                  alt={field.label} 
                  className="w-6 h-6 object-contain" 
                />
              </div>
              <label className="text-base font-medium text-gray-800 dark:text-gray-200">
                {field.label}
              </label>
            </div>
            <Textarea
              value={(data[field.key] as string) || ''}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="min-h-[100px] resize-y transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepRetranscription;
