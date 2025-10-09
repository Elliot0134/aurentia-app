import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { cn } from "@/lib/utils"; // Import cn for conditional class names
import { supabase } from '@/integrations/supabase/client';
import { EmailConfirmationGuard } from './auth/EmailConfirmationGuard';
import { User } from '@supabase/supabase-js';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ProtectedLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for sidebar collapse
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkAuth();

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <EmailConfirmationGuard user={user} fallbackMode="block">
      <div className="flex min-h-screen bg-[#F9F6F2]">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={cn("flex-grow transition-all duration-300",
          !isMobile ? (isCollapsed ? "md:ml-20" : "md:ml-64") : ""
        )}>
          <Outlet />
        </main>
      </div>
    </EmailConfirmationGuard>
  );
};

export default ProtectedLayout;
