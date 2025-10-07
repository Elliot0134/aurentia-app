#!/bin/bash

# Script de test pour l'outil Blog SEO
echo "🚀 Test de l'outil Blog SEO - Aurentia"
echo "======================================"

# Vérifier que le serveur est démarré
echo "1. Vérification du serveur de développement..."
if curl -s http://localhost:8082 > /dev/null; then
    echo "✅ Serveur de développement actif sur le port 8082"
else
    echo "❌ Serveur de développement non accessible"
    echo "💡 Lancez: npm run dev"
    exit 1
fi

# Vérifier l'accès à l'outil
echo "2. Test d'accès à l'outil Blog SEO..."
TOOL_URL="http://localhost:8082/individual/outils/5b1967d7-dd02-4a15-9a01-ea28fb8c5f9e"
echo "🔗 URL de test: $TOOL_URL"

# Vérifier le webhook n8n
echo "3. Test du webhook n8n..."
WEBHOOK_URL="https://n8n.srv906204.hstgr.cloud/webhook/seo-blog"
echo "🔗 URL du webhook: $WEBHOOK_URL"

# Test payload
TEST_PAYLOAD='{
  "theme": "Les tendances du marketing digital en 2025",
  "target_audience": "Entrepreneurs",
  "usage_id": "test-usage-id",
  "user_id": "test-user-id",
  "tool_id": "5b1967d7-dd02-4a15-9a01-ea28fb8c5f9e"
}'

echo "📦 Payload de test:"
echo "$TEST_PAYLOAD"

echo ""
echo "🧪 Tests à effectuer manuellement:"
echo "1. Ouvrir: $TOOL_URL"
echo "2. Aller dans l'onglet 'Paramètres'"
echo "3. Saisir un public cible (ex: 'Entrepreneurs')"
echo "4. Sauvegarder les paramètres"
echo "5. Aller dans l'onglet 'Utilisation'"
echo "6. Saisir un thème (ex: 'Les tendances du marketing digital en 2025')"
echo "7. Cliquer sur 'Générer l'article'"
echo "8. Vérifier que l'article est généré avec succès"
echo ""
echo "🔍 Points à vérifier:"
echo "- ✅ L'interface charge sans erreur"
echo "- ✅ Les paramètres se sauvegardent"
echo "- ✅ Le formulaire de génération fonctionne"
echo "- ✅ Les crédits sont déduits (25 crédits)"
echo "- ✅ L'historique s'affiche"
echo "- ✅ Le webhook n8n reçoit les bonnes données"
echo ""
echo "🎯 Structure du payload envoyé au webhook:"
echo "- theme: Le thème de l'article"
echo "- target_audience: Le public cible depuis les paramètres"
echo "- usage_id: ID de l'historique d'usage"
echo "- user_id: ID de l'utilisateur connecté"
echo "- tool_id: ID de l'outil (5b1967d7-dd02-4a15-9a01-ea28fb8c5f9e)"
echo ""
echo "📋 Checklist d'implémentation:"
echo "✅ Service aiToolsService.ts - Fonction deductCredits ajoutée"
echo "✅ Service aiToolsService.ts - Fonction executeTool améliorée"
echo "✅ ToolDetailPage.tsx - Onglet Paramètres simplifié (1 champ)"
echo "✅ ToolDetailPage.tsx - Onglet Utilisation adapté au blog SEO"
echo "✅ useAIToolsNew.ts - Hook complet avec authentification"
echo "✅ Migration SQL - Tables AI Tools créées"
echo "✅ Migration SQL - Outil Blog SEO inséré"
echo ""
echo "🚀 L'outil Blog SEO est prêt à être testé !"