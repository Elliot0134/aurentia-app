
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import AutomationMarketplace from '@/components/automation/AutomationMarketplace';
import ComingSoonDialog from '@/components/ui/ComingSoonDialog';
import ProjectRequiredGuard from '@/components/ProjectRequiredGuard';
import { useProject } from '@/contexts/ProjectContext'; // Import useProject
import { Button } from "@/components/ui/button"; // Import Button
import { useUserRole } from '@/hooks/useUserRole'; // Import useUserRole
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import usePageTitle from "@/hooks/usePageTitle";

const Automatisations = () => {
  usePageTitle("Automatisations");
  const navigate = useNavigate(); // Initialize useNavigate
  const { currentProjectId, userProjectsLoading } = useProject(); // Use userProjectsLoading
  const { userRole } = useUserRole(); // Get user role
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  useEffect(() => {
    setIsComingSoonOpen(true);
  }, []);

  if (userProjectsLoading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
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
        <AutomationMarketplace />
        <ComingSoonDialog
          isOpen={isComingSoonOpen}
          onClose={() => setIsComingSoonOpen(false)}
          description={
            <>
              Bientôt, laissez Aurentia IA gérer les tâches répétitives de votre entreprise en mode pilote automatique. Nos automatisations vous permettront de :
              <br /><br />
              ✅ <b>Veille stratégique</b> : Analyse de marché hebdomadaire, surveillance concurrentielle automatique
              <br />
              ✅ <b>Relance client</b> : Envoi automatique d'emails de relance, images et contenus personnalisés
              <br />
              ✅ <b>Gestion administrative</b> : Facturation récurrente, rappels d'échéances, suivi des paiements
              <br />
              ✅ <b>Marketing</b> : génération et publication des posts sur les réseaux
              <br />
              ✅ <b>Monitoring business</b> : Rapports de performance automatiques, alertes sur les KPIs critiques
              <br /><br />
              Configurez une fois, profitez à vie ! Chaque automatisation s'adapte à votre rythme et vos besoins spécifiques.
            </>
          }
        />
      </div>
    </ProjectRequiredGuard>
  );
};

export default Automatisations;
