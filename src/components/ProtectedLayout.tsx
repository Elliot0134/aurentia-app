import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const ProtectedLayout = () => {
  const [isMobile, setIsMobile] = useState(false);

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
      <Sidebar />
      <main className={`flex-grow ${!isMobile ? 'md:ml-64' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout; 