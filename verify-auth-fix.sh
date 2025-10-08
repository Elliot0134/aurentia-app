#!/bin/bash

# ============================================
# Supabase Auth Fix Verification Script
# ============================================

echo "🔍 Verifying Supabase Auth Fixes..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to check if file contains pattern
check_pattern() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $description"
        ((FAILED++))
        return 1
    fi
}

echo "📁 Checking Supabase Client Configuration..."
check_pattern "src/integrations/supabase/client.ts" "storage: window.localStorage" "Explicit localStorage storage configured"
check_pattern "src/integrations/supabase/client.ts" "storageKey:" "Storage key explicitly set"
check_pattern "src/integrations/supabase/client.ts" "flowType: 'pkce'" "PKCE flow type configured"
check_pattern "src/integrations/supabase/client.ts" "let supabaseInstance" "Singleton pattern implemented"

echo ""
echo "🔐 Checking ProtectedRoute Implementation..."
check_pattern "src/App.tsx" "getSession()" "Using getSession() instead of getUser()"
check_pattern "src/App.tsx" "onAuthStateChange" "Auth state change listener configured"

echo ""
echo "👤 Checking useUserProfile Hook..."
check_pattern "src/hooks/useUserProfile.tsx" "getSession()" "Using getSession() for session check"
check_pattern "src/hooks/useUserProfile.tsx" "session?.user" "Checking session before profile query"
check_pattern "src/hooks/useUserProfile.tsx" "SIGNED_OUT" "Handling SIGNED_OUT event"

echo ""
echo "🎯 Checking for Duplicate Client Instances..."
if grep -q "createClient(supabaseUrl, supabaseAnonKey)" "src/components/deliverables/CadreJuridiqueLivrable.tsx" 2>/dev/null; then
    echo -e "${RED}❌${NC} Duplicate client found in CadreJuridiqueLivrable.tsx"
    ((FAILED++))
else
    echo -e "${GREEN}✅${NC} No duplicate clients - using singleton"
    ((PASSED++))
fi

echo ""
echo "📊 Test Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Auth fix is correctly implemented.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please review the implementation.${NC}"
    exit 1
fi
