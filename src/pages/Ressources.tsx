import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProjectRequiredGuard from '@/components/ProjectRequiredGuard';
import { useProject } from '@/contexts/ProjectContext'; // Import useProject
import { Button } from "@/components/ui/button"; // Import Button
import { useUserRole } from '@/hooks/useUserRole'; // Import useUserRole

const Ressources = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { currentProjectId, userProjectsLoading } = useProject(); // Use userProjectsLoading
  const { userRole } = useUserRole(); // Get user role

  if (userProjectsLoading) {
    return <div>Chargement...</div>; // Ou un composant de chargement
  }

  if (!currentProjectId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] animate-popup-appear">
        <div className="container mx-auto px-4 py-8 text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-[90vw]">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Que l'aventure commence !</h2>
          <p className="text-gray-600 mb-6 text-lg">Créez un nouveau projet pour découvrir tout le potentiel de votre idée.</p>
          <Button 
            onClick={() => navigate("/individual/warning")} 
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-primary hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Créer un nouveau projet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProjectRequiredGuard>
      <div className="animate-fade-in">
        <MarketplaceLayout />
      </div>
    </ProjectRequiredGuard>
  );
};

export default Ressources;
