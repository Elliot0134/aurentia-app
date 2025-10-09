#!/bin/bash

# Script to update all loading states to use LoadingSpinner component
# This is a reference script - changes should be made manually to ensure accuracy

echo "Files that need LoadingSpinner updates:"
echo ""
echo "HIGH PRIORITY (User-facing pages):"
echo "✅ src/App.tsx - DONE"
echo "✅ src/components/ProtectedLayout.tsx - DONE"
echo "✅ src/pages/Collaborateurs.tsx - DONE"
echo "✅ src/pages/SetupOrganization.tsx - DONE"
echo "✅ src/pages/organisation/OrganisationDashboard.tsx - DONE"
echo "✅ src/pages/OrganisationRedirect.tsx - DONE"
echo ""
echo "MEDIUM PRIORITY (Common pages):"
echo "- src/pages/Automatisations.tsx"
echo "- src/pages/Ressources.tsx"
echo "- src/pages/ProjectBusiness.tsx"
echo "- src/pages/PlanActionPage.tsx"
echo "- src/pages/ChatbotPage.tsx"
echo "- src/pages/Partenaires.tsx"
echo "- src/pages/Roadmap.tsx"
echo "- src/pages/Dashboard.tsx"
echo "- src/pages/MyOrganization.tsx"
echo ""
echo "ORGANIZATION PAGES:"
echo "- src/pages/organisation/OrganisationForms.tsx"
echo "- src/pages/organisation/OrganisationAnalytics.tsx"
echo "- src/pages/organisation/OrganisationAnalyticsAdvanced.tsx"
echo "- src/pages/organisation/OrganisationEvenements.tsx"
echo "- src/pages/organisation/OrganisationMentors.tsx"
echo "- src/pages/organisation/OrganisationOnboarding.tsx"
echo "- src/pages/organisation/OrganisationProfile.tsx"
echo "- src/pages/organisation/OrganisationLivrables.tsx"
echo "- src/pages/organisation/OrganisationAdherents.tsx"
echo "- src/pages/organisation/OrganisationInvitations.tsx"
echo "- src/pages/organisation/OrganisationPartenaires.tsx"
echo ""
echo "COMPONENTS (Inline loaders - keep Loader2 for buttons/small elements):"
echo "- Most inline button loaders can stay as Loader2"
echo "- Page-level loading states should use LoadingSpinner"
echo ""

echo "Pattern to replace:"
echo '  <div className="animate-spin rounded-full h-X w-X border-b-2 border-COLOR"></div>'
echo "With:"
echo '  <LoadingSpinner message="Message..." />'
echo ""

echo "Pattern to replace:"
echo '  return <div>Chargement...</div>;'
echo "With:"
echo '  return <LoadingSpinner message="Chargement..." fullScreen />;'
