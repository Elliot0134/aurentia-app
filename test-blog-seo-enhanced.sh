#!/bin/bash

# Script de test pour l'outil Blog SEO
# File: test-blog-seo-enhanced.sh

echo "🚀 Test de l'outil Blog SEO amélioré"
echo "=================================="

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Test du payload pour l'outil Blog SEO${NC}"

# Test du payload avec tous les nouveaux champs
PAYLOAD='{
  "theme": "Les tendances du marketing digital en 2025",
  "additional_info": "Inclure des statistiques récentes, parler de l IA, mentionner les réseaux sociaux émergents",
  "reference_article": "https://example.com/marketing-trends-2024",
  "client_type": "entreprise",
  "target_audience": "Dirigeants d entreprises et responsables marketing",
  "internal_links": [
    {
      "id": "1",
      "url": "https://monsite.com/strategie-marketing",
      "description": "Guide complet de stratégie marketing"
    },
    {
      "id": "2", 
      "url": "https://monsite.com/outils-ia-marketing",
      "description": "Les meilleurs outils IA pour le marketing"
    }
  ],
  "project_id": "test-project-uuid-123",
  "usage_id": "test-usage-id",
  "user_id": "test-user-id",
  "tool_id": "5b1967d7-dd02-4a15-9a01-ea28fb8c5f9e"
}'

echo -e "${YELLOW}📤 Envoi du payload au webhook n8n...${NC}"
echo "URL: https://n8n.srv906204.hstgr.cloud/webhook/seo-blog"
echo ""
echo "Payload envoyé:"
echo "$PAYLOAD" | jq '.'

# Test avec curl
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "https://n8n.srv906204.hstgr.cloud/webhook/seo-blog" \
  -w "\nHTTP_CODE:%{http_code}")

# Extraire le code HTTP
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo ""
echo -e "${YELLOW}📥 Réponse reçue:${NC}"
echo "Code HTTP: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Succès!${NC}"
    echo "Réponse:"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Erreur HTTP $HTTP_CODE${NC}"
    echo "Réponse:"
    echo "$RESPONSE_BODY"
fi

echo ""
echo -e "${YELLOW}📊 Résumé du test${NC}"
echo "- Thème: ✅ Les tendances du marketing digital en 2025"
echo "- Informations supplémentaires: ✅ Incluses"
echo "- Article de référence: ✅ URL fournie"
echo "- Type de client: ✅ Entreprise"
echo "- Public cible: ✅ Dirigeants d'entreprises"
echo "- Liens internes: ✅ 2 liens configurés"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}🎉 Test réussi! L'outil Blog SEO est fonctionnel.${NC}"
    exit 0
else
    echo -e "${RED}💥 Test échoué. Vérifiez la configuration du webhook.${NC}"
    exit 1
fi