import { formatRecommendations } from './textFormatter';

// Test avec l'exemple fourni par l'utilisateur
const testText = "Préparez un email type professionnel, clair et précis, listant exactement les documents attendus en s'appuyant sur la grille de l'étape T2.1.\\n2) Spécifiez que le CoA doit être celui d'un lot de production récent.\\n3) Fixez une date limite de réponse pour maintenir la dynamique du projet.\\n4) Piège à éviter : accepter des rapports de laboratoire non accrédités ou des résumés de CoA. Exigez toujours le document complet d'un laboratoire tiers.\\n5) Profitez de ce contact pour poser des questions sur leur processus qualité et leur support pour les marques qu'ils fournissent.";

const expectedResult = `Préparez un email type professionnel, clair et précis, listant exactement les documents attendus en s'appuyant sur la grille de l'étape T2.1. 
2) Spécifiez que le CoA doit être celui d'un lot de production récent. 
3) Fixez une date limite de réponse pour maintenir la dynamique du projet. 
4) Piège à éviter : accepter des rapports de laboratoire non accrédités ou des résumés de CoA. Exigez toujours le document complet d'un laboratoire tiers. 
5) Profitez de ce contact pour poser des questions sur leur processus qualité et leur support pour les marques qu'ils fournissent.`;

console.log('=== TEST DE FORMATAGE DES RECOMMANDATIONS ===');
console.log('\nTexte original:');
console.log(testText);
console.log('\nTexte formaté:');
console.log(formatRecommendations(testText));
console.log('\nRésultat attendu:');
console.log(expectedResult);
console.log('\nTest réussi:', formatRecommendations(testText) === expectedResult);
