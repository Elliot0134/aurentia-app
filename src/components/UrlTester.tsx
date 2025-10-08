import React from 'react';

// Fonction utilitaire pour obtenir l'URL de base (identique à celle du service email)
function getBaseUrl(): string {
  // Priorité 1: Variable d'environnement
  if (import.meta.env.VITE_APP_BASE_URL) {
    return import.meta.env.VITE_APP_BASE_URL;
  }
  
  // Priorité 2: Origin actuel (si disponible)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  
  // Priorité 3: URL de production par défaut
  return 'https://aurentia.app';
}

export const UrlTester: React.FC = () => {
  const baseUrl = getBaseUrl();
  const testToken = 'd3f73731-a417-401d-adef-ed6ca412c547';
  const generatedUrl = `${baseUrl}/accept-invitation?token=${testToken}`;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔗 Testeur d'URL de Collaboration</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">📋 Informations URL :</h3>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-bold">Variable d'env:</span> {import.meta.env.VITE_APP_BASE_URL || 'Non définie'}
            </div>
            <div>
              <span className="font-bold">Window origin:</span> {typeof window !== 'undefined' ? window.location.origin : 'Indisponible'}
            </div>
            <div>
              <span className="font-bold">URL de base utilisée:</span> {baseUrl}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">✉️ URL générée pour les emails :</h3>
          <div className="font-mono text-sm break-all bg-white p-3 rounded border">
            {generatedUrl}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🧪 Test du lien :</h3>
          <a 
            href={generatedUrl}
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tester le lien d'invitation
          </a>
          <p className="text-sm text-gray-600 mt-2">
            Ce lien devrait vous emmener vers la page d'acceptation d'invitation avec le token de test.
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">⚙️ Configuration recommandée :</h3>
          <div className="text-sm space-y-1">
            <p>• <strong>Développement:</strong> VITE_APP_BASE_URL=http://localhost:8080</p>
            <p>• <strong>Production:</strong> VITE_APP_BASE_URL=https://aurentia.app</p>
            <p>• <strong>Staging:</strong> VITE_APP_BASE_URL=https://staging.aurentia.app</p>
          </div>
        </div>
      </div>
    </div>
  );
};