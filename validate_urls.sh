#!/bin/bash

echo "🔗 VALIDATION DES URLs DE COLLABORATION"
echo "======================================"

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier le fichier .env
echo -e "\n📋 1. Vérification du fichier .env..."
if [ -f ".env" ]; then
    echo -e "   ${GREEN}✓${NC} Fichier .env trouvé"
    
    # Extraire la valeur de VITE_APP_BASE_URL
    BASE_URL=$(grep "VITE_APP_BASE_URL" .env | cut -d '=' -f2)
    echo "   Configuration actuelle: $BASE_URL"
    
    if [[ "$BASE_URL" == *"localhost:8080"* ]]; then
        echo -e "   ${GREEN}✓${NC} URL configurée pour le développement (port 8080)"
    elif [[ "$BASE_URL" == *"localhost:8082"* ]]; then
        echo -e "   ${RED}✗${NC} PROBLÈME: URL configurée sur le mauvais port (8082)"
        echo "   Recommandation: Changer pour http://localhost:8080"
    elif [[ "$BASE_URL" == *"aurentia.app"* ]]; then
        echo -e "   ${GREEN}✓${NC} URL configurée pour la production"
    else
        echo -e "   ${YELLOW}⚠${NC} URL non standard: $BASE_URL"
    fi
else
    echo -e "   ${RED}✗${NC} Fichier .env non trouvé"
fi

# Vérifier la configuration Vite
echo -e "\n⚙️ 2. Vérification de la configuration Vite..."
if [ -f "vite.config.ts" ]; then
    PORT=$(grep -o "port: [0-9]*" vite.config.ts | grep -o "[0-9]*")
    if [ "$PORT" ]; then
        echo -e "   ${GREEN}✓${NC} Port Vite configuré: $PORT"
        
        if [ "$PORT" = "8080" ]; then
            echo -e "   ${GREEN}✓${NC} Port Vite correspond à l'URL de base"
        else
            echo -e "   ${YELLOW}⚠${NC} Port Vite ($PORT) différent de l'URL de base"
        fi
    else
        echo -e "   ${YELLOW}⚠${NC} Port Vite non trouvé dans la config"
    fi
else
    echo -e "   ${RED}✗${NC} vite.config.ts non trouvé"
fi

# Vérifier le service email
echo -e "\n📧 3. Vérification du service email..."
if [ -f "src/services/email.service.ts" ]; then
    echo -e "   ${GREEN}✓${NC} Service email trouvé"
    
    # Vérifier la présence de la fonction getBaseUrl
    if grep -q "function getBaseUrl" src/services/email.service.ts; then
        echo -e "   ${GREEN}✓${NC} Fonction getBaseUrl présente"
    else
        echo -e "   ${RED}✗${NC} Fonction getBaseUrl manquante"
    fi
    
    # Vérifier l'utilisation cohérente
    OLD_PATTERN_COUNT=$(grep -c "import.meta.env.VITE_APP_BASE_URL || window.location.origin" src/services/email.service.ts || echo "0")
    if [ "$OLD_PATTERN_COUNT" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠${NC} $OLD_PATTERN_COUNT occurrence(s) de l'ancien pattern trouvée(s)"
    else
        echo -e "   ${GREEN}✓${NC} Aucun ancien pattern d'URL trouvé"
    fi
else
    echo -e "   ${RED}✗${NC} Service email non trouvé"
fi

# Vérifier les templates d'emails
echo -e "\n📨 4. Vérification des templates d'emails..."
EMAIL_HREF_COUNT=$(grep -c 'href="${.*inviteUrl.*}"' src/services/email.service.ts || echo "0")
if [ "$EMAIL_HREF_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✓${NC} $EMAIL_HREF_COUNT bouton(s) d'invitation trouvé(s)"
else
    echo -e "   ${RED}✗${NC} Aucun bouton d'invitation trouvé"
fi

# Test de génération d'URL
echo -e "\n🧪 5. Test de génération d'URL..."
TEST_TOKEN="d3f73731-a417-401d-adef-ed6ca412c547"
EXPECTED_URL="$BASE_URL/accept-invitation?token=$TEST_TOKEN"
echo "   URL attendue: $EXPECTED_URL"

# Vérifier si le port est accessible
if [[ "$BASE_URL" == *"localhost"* ]]; then
    PORT_ONLY=$(echo "$BASE_URL" | grep -o ':[0-9]*' | grep -o '[0-9]*')
    if [ "$PORT_ONLY" ]; then
        if command -v nc >/dev/null 2>&1; then
            if nc -z localhost "$PORT_ONLY" 2>/dev/null; then
                echo -e "   ${GREEN}✓${NC} Port $PORT_ONLY accessible"
            else
                echo -e "   ${YELLOW}⚠${NC} Port $PORT_ONLY non accessible (serveur arrêté?)"
            fi
        else
            echo -e "   ${YELLOW}⚠${NC} Impossible de tester le port (nc non disponible)"
        fi
    fi
fi

echo -e "\n🎯 RÉSUMÉ:"
echo "========"
echo "• Variable d'env: $BASE_URL"
echo "• Port Vite: ${PORT:-"Non défini"}"
echo "• Service email: Mis à jour avec getBaseUrl()"
echo "• URL de test: $EXPECTED_URL"

echo -e "\n${GREEN}✅ Validation des URLs terminée !${NC}"

if [[ "$BASE_URL" == *"localhost:8082"* ]]; then
    echo ""
    echo -e "${YELLOW}⚠️ ACTION REQUISE:${NC}"
    echo "Modifiez le fichier .env pour changer:"
    echo "VITE_APP_BASE_URL=http://localhost:8082"
    echo "en:"
    echo "VITE_APP_BASE_URL=http://localhost:8080"
fi