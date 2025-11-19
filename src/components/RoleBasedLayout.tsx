import { useState, useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import RoleBasedSidebar from './RoleBasedSidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const RoleBasedLayout = () => {
  const { userProfile, loading } = useUserRole();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  console.log('[RoleBasedLayout] Render - loading:', loading, 'userProfile:', userProfile?.id);

  // Check if current route is an organisation route
  const isOrganisationRoute = location.pathname.startsWith('/organisation/');

  // Get organization branding settings
  const whiteLabelEnabled = userProfile?.organization?.settings?.branding?.whiteLabel ?? false;
  const orgPrimaryColor = userProfile?.organization?.settings?.branding?.primaryColor
    || userProfile?.organization?.primary_color
    || '#ff5932';
  const orgSecondaryColor = userProfile?.organization?.settings?.branding?.secondaryColor
    || userProfile?.organization?.secondary_color
    || '#1a1a1a';

  // Create CSS custom properties for organization colors
  // IMPORTANT: Only apply custom colors when white-label is enabled
  const customStyles = useMemo(() => {
    if (isOrganisationRoute && userProfile?.organization && whiteLabelEnabled) {
      return {
        '--org-primary-color': orgPrimaryColor,
        '--org-secondary-color': orgSecondaryColor,
        '--org-primary-rgb': hexToRgb(orgPrimaryColor),
        '--org-secondary-rgb': hexToRgb(orgSecondaryColor),
        // Override Tailwind CSS variables to apply colors globally
        '--color-primary': orgPrimaryColor,
        '--color-secondary': orgSecondaryColor,
        '--color-aurentia-orange': orgPrimaryColor,
        '--color-aurentia-pink': orgPrimaryColor,
      } as React.CSSProperties;
    }
    // When white-label is OFF, return default Aurentia colors
    return {
      '--color-primary': '#FF592C',
      '--color-secondary': '#FF592C',
      '--color-aurentia-orange': '#FF592C',
      '--color-aurentia-pink': '#EF4A6D',
    } as React.CSSProperties;
  }, [isOrganisationRoute, userProfile?.organization, whiteLabelEnabled, orgPrimaryColor, orgSecondaryColor]);

  if (loading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  return (
    <div className="flex h-screen bg-[var(--bg-page)] transition-colors duration-200" style={customStyles}>
      <RoleBasedSidebar
        userProfile={userProfile}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        "md:ml-0", // Mobile: no margin
        isCollapsed ? "md:ml-20" : "md:ml-64" // Desktop: adjust for sidebar
      )}>
        {isOrganisationRoute ? (
          <div className="max-w-[100vw] overflow-x-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl">
              <Outlet />
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
}

export default RoleBasedLayout;
