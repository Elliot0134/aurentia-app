import { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import RoleBasedSidebar from './RoleBasedSidebar';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const RoleBasedLayout = () => {
  const { userProfile, loading } = useUserRole();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
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
        <Outlet />
      </main>
    </div>
  );
};

export default RoleBasedLayout;