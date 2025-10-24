import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardMetricsCards } from "@/components/dashboard/DashboardMetricsCards";
import { ActionPlanTimelineWidget } from "@/components/dashboard/ActionPlanTimelineWidget";
import { IndividualActivityFeed } from "@/components/dashboard/IndividualActivityFeed";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { Activity, Plus } from "lucide-react";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    Tally: {
      loadEmbeds: () => void;
    };
  }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Use Project Context instead of local state
  const { userProjects, userProjectsLoading, deleteProject } = useProject();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  // Redirect to onboarding if user has no projects and hasn't completed onboarding
  useEffect(() => {
    if (!userProjectsLoading && !onboardingLoading) {
      if (userProjects.length === 0 && !onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [userProjects, userProjectsLoading, onboardingCompleted, onboardingLoading, navigate]);

  // Format projects for display
  const formattedProjects = userProjects.map(project => ({
    id: project.project_id,
    title: project.nom_projet || "Projet sans nom",
    status: "En cours", // You can enhance this with actual status from project data
    createdAt: new Date(project.created_at).toLocaleDateString('fr-FR')
  }));

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    const success = await deleteProject(projectToDelete);
    if (success) {
      setProjectToDelete(null);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    script.onload = () => {
      if (window.Tally) {
        window.Tally.loadEmbeds();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Get user's first name for greeting
  const firstName = userProfile?.first_name || 'Entrepreneur';

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de votre parcours entrepreneurial
          </p>
        </div>

        {/* Metrics Cards */}
        <DashboardMetricsCards />

        {/* Quick Actions Panel */}
        <QuickActionsPanel />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Plan Timeline - Full width on mobile, 2 cols on desktop */}
          <div className="lg:col-span-2">
            <ActionPlanTimelineWidget />
          </div>

          {/* Create Project Card - 1 col */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Nouveau Projet</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                {userProjects.length === 0 ? (
                  <>
                    <p className="text-gray-600 text-center mb-4">
                      Vous n'avez pas encore de projets
                    </p>
                    <Button
                      onClick={() => navigate("/individual/warning")}
                      className="bg-aurentia-pink hover:bg-aurentia-pink/90 flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Créer votre premier projet
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-center mb-4">
                      {userProjects.length} {userProjects.length === 1 ? 'projet actif' : 'projets actifs'}
                    </p>
                    <Button
                      onClick={() => navigate("/individual/warning")}
                      variant="outline"
                      className="flex items-center gap-2 hover:border-aurentia-pink hover:text-aurentia-pink"
                    >
                      <Plus size={16} />
                      Créer un nouveau projet
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-aurentia-pink" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IndividualActivityFeed limit={15} showLoadMore={true} />
          </CardContent>
        </Card>

        {/* Tally Form Embed - Keep at the bottom */}
        <Card>
          <CardContent className="p-6">
            <iframe
              data-tally-src="https://tally.so/embed/3qq1e8?alignLeft=1&transparentBackground=1&dynamicHeight=1"
              loading="lazy"
              width="100%"
              height="552"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              allow="microphone; camera; geolocation; autoplay"
              title="Votre avis nous aide à grandir !"
            ></iframe>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
