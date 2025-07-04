import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { cn } from "@/lib/utils"; // Import cn for conditional class names

const ProtectedLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for sidebar collapse

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
  }, []);

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
