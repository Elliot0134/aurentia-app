import { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import RoleBasedSidebar from './RoleBasedSidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const RoleBasedLayout = () => {
  const { userProfile, loading } = useUserRole();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  console.log('[RoleBasedLayout] Render - loading:', loading, 'userProfile:', userProfile?.id);

  // Check if current route is an organisation route
  const isOrganisationRoute = location.pathname.startsWith('/organisation/');
  
  if (loading) {
    console.log('[RoleBasedLayout] Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-[#F4F4F1]">
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

export default RoleBasedLayout;
