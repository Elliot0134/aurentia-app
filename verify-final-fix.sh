#!/bin/bash

echo "🔍 Verifying Authentication Fix..."
echo ""

PASS=0
FAIL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: useUserProfile fetches on mount
echo "📋 Check 1: useUserProfile fetches on mount"
if grep -q "Fetching profile on mount" src/hooks/useUserProfile.tsx; then
    echo -e "${GREEN}✅ PASS${NC} - Immediate fetch on mount found"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing immediate fetch on mount"
    ((FAIL++))
fi

# Check 2: useUserProfile has timeout protection
echo "📋 Check 2: useUserProfile has getSession() timeout protection"
if grep -q "Promise.race" src/hooks/useUserProfile.tsx && grep -q "getSession timeout" src/hooks/useUserProfile.tsx; then
    echo -e "${GREEN}✅ PASS${NC} - Timeout protection found"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing timeout protection"
    ((FAIL++))
fi

# Check 3: useUserProfile has debouncing
echo "📋 Check 3: useUserProfile has debouncing to prevent race conditions"
if grep -q "isFetching" src/hooks/useUserProfile.tsx && grep -q "Already fetching, skipping" src/hooks/useUserProfile.tsx; then
    echo -e "${GREEN}✅ PASS${NC} - Debouncing found"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing debouncing"
    ((FAIL++))
fi

# Check 4: ProtectedRoute has timeout protection
echo "📋 Check 4: ProtectedRoute has getSession() timeout protection"
if grep -q "Promise.race" src/App.tsx && grep -q "getSession timeout" src/App.tsx; then
    echo -e "${GREEN}✅ PASS${NC} - Timeout protection found"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing timeout protection"
    ((FAIL++))
fi

# Check 5: Supabase client has localStorage config
echo "📋 Check 5: Supabase client configured with localStorage"
if grep -q "storage: window.localStorage" src/integrations/supabase/client.ts; then
    echo -e "${GREEN}✅ PASS${NC} - localStorage config found"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing localStorage config"
    ((FAIL++))
fi

# Check 6: Supabase client has storageKey
echo "📋 Check 6: Supabase client has storageKey configured"
if grep -q "storageKey: 'sb-llcliurrrrxnkquwmwsi-auth-token'" src/integrations/supabase/client.ts; then
    echo -e "${GREEN}✅ PASS${NC} - storageKey config found"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing storageKey config"
    ((FAIL++))
fi

# Check 7: Supabase client uses PKCE flow
echo "📋 Check 7: Supabase client uses PKCE flow"
if grep -q "flowType: 'pkce'" src/integrations/supabase/client.ts; then
    echo -e "${GREEN}✅ PASS${NC} - PKCE flow configured"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing PKCE flow"
    ((FAIL++))
fi

# Check 8: Supabase client is singleton
echo "📋 Check 8: Supabase client uses singleton pattern"
if grep -q "let supabaseInstance" src/integrations/supabase/client.ts && grep -q "getSupabaseClient" src/integrations/supabase/client.ts; then
    echo -e "${GREEN}✅ PASS${NC} - Singleton pattern found"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing singleton pattern"
    ((FAIL++))
fi

# Check 9: useUserProfile uses getSession() not getUser()
echo "📋 Check 9: useUserProfile uses getSession() instead of getUser()"
if grep -q "supabase.auth.getSession()" src/hooks/useUserProfile.tsx && ! grep -q "supabase.auth.getUser()" src/hooks/useUserProfile.tsx; then
    echo -e "${GREEN}✅ PASS${NC} - Using getSession() correctly"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Still using getUser() or missing getSession()"
    ((FAIL++))
fi

# Check 10: ProtectedRoute uses getSession() not getUser()
echo "📋 Check 10: ProtectedRoute uses getSession() instead of getUser()"
if grep -q "supabase.auth.getSession()" src/App.tsx; then
    echo -e "${GREEN}✅ PASS${NC} - Using getSession() correctly"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Missing getSession()"
    ((FAIL++))
fi

# Check 11: Diagnostic tool exists
echo "📋 Check 11: Diagnostic tool (diagnose-auth.html) exists"
if [ -f "diagnose-auth.html" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Diagnostic tool found"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Diagnostic tool not found (optional)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results: ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! The fix is properly applied.${NC}"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Start the development server: npm run dev"
    echo "   2. Login to your account"
    echo "   3. Refresh the page (F5)"
    echo "   4. Verify you stay logged in"
    echo "   5. Check console for profile loading logs"
    echo ""
    echo "📋 Optional: Open diagnose-auth.html in browser for detailed diagnostics"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review the errors above.${NC}"
    exit 1
fi
