import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import RoleBasedSidebar from './RoleBasedSidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const RoleBasedLayout = () => {
  const { userProfile, loading } = useUserRole();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const location = useLocation();

  // Check if current route is an organisation route
  const isOrganisationRoute = location.pathname.startsWith('/organisation/');

  // Récupérer l'utilisateur actuel pour la confirmation d'email
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    getUser();

    // Écouter les changements d'authentification
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);
  
  if (loading || userLoading) {
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
