/**
 * Formate le texte des recommandations selon les règles spécifiées :
 * - Supprime tous les \n
 * - Ajoute un retour à la ligne avant chaque numéro suivi de )
 */
export const formatRecommendations = (text: string): string => {
  if (!text) return '';
  
  // Supprime tous les \n
  let formattedText = text.replace(/\\n/g, ' ');
  
  // Ajoute un retour à la ligne avant chaque numéro suivi de )
  // Utilise une regex pour détecter les patterns comme "1)", "2)", etc.
  formattedText = formattedText.replace(/(\d+\))/g, '\n$1');
  
  // Supprime le retour à la ligne au début si le texte commence par un numéro
  formattedText = formattedText.replace(/^\n/, '');
  
  return formattedText;
};
