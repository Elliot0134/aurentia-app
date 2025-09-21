import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganisationData, useOrganisationStats } from '@/hooks/useOrganisationData';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  FileText,
  TrendingUp,
  Code,
  Activity,
  BarChart3,
  Calendar,
  MessageSquare
} from "lucide-react";

interface FeatureRequest {
  type: string;
  title: string;
  description: string;
}

const OrganisationDashboard = () => {
  const navigate = useNavigate();
  const { organisation, loading: orgLoading } = useOrganisationData();
  const { stats, loading: statsLoading } = useOrganisationStats();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FeatureRequest>({
    type: '',
    title: '',
    description: ''
  });

  const handleSubmitRequest = async () => {
    if (!formData.type || !formData.title || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implémenter l'envoi de la demande
      console.log('Demande soumise:', formData);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de fonctionnalité a été envoyée avec succès.",
      });
      
      setDialogOpen(false);
      setFormData({ type: '', title: '', description: '' });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    }
  };

  if (orgLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement du dashboard...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête avec titre, sous-titre et boutons */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Organisation</h1>
              <p className="text-gray-600 text-base">
                Gérez votre organisation {organisation?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white border border-gray-200 hover:bg-gray-50">
                En savoir +
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                    Ajouter +
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouvelle demande de fonctionnalité</DialogTitle>
                    <DialogDescription>
                      En fait, on part de votre demande. Nous nous efforçons d'ajouter les nouvelles fonctionnalités dans les plus brefs délais suite aux demandes de nos utilisateurs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type de fonctionnalité</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outil">Nouvel outil</SelectItem>
                          <SelectItem value="ressource">Nouvelle ressource</SelectItem>
                          <SelectItem value="automation">Nouvelle automatisation</SelectItem>
                          <SelectItem value="partenaire">Nouveau partenaire</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Titre de la demande</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ex: Outil de génération de contenu social media"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description détaillée</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Décrivez en détail votre demande..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSubmitRequest} style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                      Soumettre la demande
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entrepreneurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEntrepreneurs || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.thisMonthSignups || 0} ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.completedProjects || 0} complétés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Codes d'Invitation</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDeliverables || 0}</div>
              <p className="text-xs text-muted-foreground">
                Livrables total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.successRate || 0}%</div> {/* Taux de succès pour l'instant pas lié au back */}
              <p className="text-xs text-muted-foreground">
                Projets terminés avec succès
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/organisation/${organisation?.id}/entrepreneurs`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-aurentia-pink" />
                Gérer les Entrepreneurs
              </CardTitle>
              <CardDescription>
                Voir et gérer les profils des entrepreneurs de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-aurentia-pink text-white py-2 px-4 rounded-md hover:bg-aurentia-pink/90 transition">
                Accéder
              </button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/organisation/${organisation?.id}/invitations`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-aurentia-orange" />
                Codes d'Invitation
              </CardTitle>
              <CardDescription>
                Créer et gérer les codes d'invitation pour nouveaux membres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-aurentia-orange text-white py-2 px-4 rounded-md hover:bg-aurentia-orange/90 transition">
                Gérer les codes
              </button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/organisation/${organisation?.id}/analytics`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Analytics
              </CardTitle>
              <CardDescription>
                Visualiser les performances et l'engagement des entrepreneurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-600/90 transition">
                Voir les analytics
              </button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/organisation/${organisation?.id}/projets`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Projets
              </CardTitle>
              <CardDescription>
                Visualiser et gérer les projets de l'organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-600/90 transition">
                Gérer les projets
              </button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/organisation/${organisation?.id}/evenements`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Événements
              </CardTitle>
              <CardDescription>
                Planifier et gérer les événements de l'organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-600/90 transition">
                Voir le calendrier
              </button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/organisation/${organisation?.id}/chatbot`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                Chatbot
              </CardTitle>
              <CardDescription>
                Interface de chat pour l'organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-600/90 transition">
                Ouvrir le chat
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-aurentia-pink" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Dernières actions dans votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Activité en temps réel
                </h3>
                <p className="text-gray-600 mb-4">
                  Les activités récentes de votre organisation s'afficheront ici.
                </p>
                <p className="text-sm text-gray-500">
                  Les nouvelles inscriptions, projets complétés et autres actions importantes seront listées automatiquement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganisationDashboard;