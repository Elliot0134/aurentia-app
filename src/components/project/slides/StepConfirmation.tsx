import { ProjectCreationData } from '@/types/projectCreation';

interface StepConfirmationProps {
  data: ProjectCreationData;
  organizations?: Array<{ id: string; name: string }>;
  selectedOrg?: string;
}

const StepConfirmation = ({ data, organizations, selectedOrg }: StepConfirmationProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          ⚠️ Confirmation
        </h2>
      </div>

      {/* Récapitulatif en 2 colonnes */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4 text-center">
          📋 Récapitulatif de vos informations
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Colonne gauche */}
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Nom du projet</p>
              <p className="text-gray-600 text-sm">{data.projectName || 'Non renseigné'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Description en une phrase</p>
              <p className="text-gray-600 text-sm">{data.projectIdeaSentence || 'Non renseigné'}</p>
            </div>

            {selectedOrg && selectedOrg !== 'none' && organizations && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="font-semibold text-gray-700 text-sm">Organisation liée</p>
                <p className="text-gray-600 text-sm">
                  {organizations.find((org) => org.id === selectedOrg)?.name || 'Organisation sélectionnée'}
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Produits/Services</p>
              <p className="text-gray-600 text-sm">{data.productsServices || 'Non renseigné'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Problème résolu</p>
              <p className="text-gray-600 text-sm">{data.problemSolved || 'Non renseigné'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Clientèle cible</p>
              <p className="text-gray-600 text-sm">{data.clienteleCible || 'Non renseigné'}</p>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Besoins pour lancer</p>
              <p className="text-gray-600 text-sm">{data.needs || 'Non renseigné'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Type de projet</p>
              <p className="text-gray-600 text-sm">{data.projectType || 'Non renseigné'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Zone géographique</p>
              <p className="text-gray-600 text-sm">{data.geographicArea || 'Non applicable'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Informations supplémentaires</p>
              <p className="text-gray-600 text-sm">{data.additionalInfo || 'Non renseigné'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Motivation entrepreneuriale</p>
              <p className="text-gray-600 text-sm">{data.whyEntrepreneur || 'Non renseigné'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 text-sm">Équipe</p>
              <p className="text-gray-600 text-sm">{data.teamSize || 'Non renseigné'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message de confirmation */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
          Êtes-vous sûr de vouloir continuer ? ✅
        </h4>
        <p className="text-sm text-gray-600">
          Vos informations seront traitées pour générer votre retranscription de concept. Vous pourrez toujours modifier
          les résultats à l'étape suivante.
        </p>
      </div>
    </div>
  );
};

export default StepConfirmation;
