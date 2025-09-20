import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { cn } from "@/lib/utils"; // Import cn for conditional class names
import { supabase } from '@/integrations/supabase/client';

const ProtectedLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for sidebar collapse
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };

    const checkEmailConfirmation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        navigate('/confirm-email'); // Rediriger vers la page de confirmation
      }
      setLoading(false);
    };

    checkEmailConfirmation();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9F6F2]">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={cn("flex-grow transition-all duration-300",
        !isMobile ? (isCollapsed ? "md:ml-20" : "md:ml-64") : ""
      )}>
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
