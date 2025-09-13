// src/utils/apiInterceptor.ts

// Sauvegarder la fonction fetch originale
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  // Vérifier si la réponse est de type JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    // Cloner la réponse pour pouvoir la lire sans la consommer pour le consommateur original
    const clonedResponse = response.clone();
    try {
      const json = await clonedResponse.json();
      if (json && typeof json === 'object' && json.credits === false) {
        console.warn('Crédits insuffisants détectés dans la réponse API (intercepteur global).');
        if (window.triggerCreditsInsufficientDialog) {
          window.triggerCreditsInsufficientDialog();
        }
      }
    } catch (e) {
      // Ignorer les erreurs si le parsing JSON échoue (ex: JSON malformé)
      console.log('Erreur de parsing JSON dans l\'intercepteur global:', e);
    }
  }

  return response;
};

console.log('API Interceptor chargé.');
