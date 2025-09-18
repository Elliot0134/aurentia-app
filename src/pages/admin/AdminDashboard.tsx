import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Star,
  Plus,
  Zap,
  FileText,
  Users,
  TrendingUp,
  ChevronDown,
  SlidersHorizontal,
  BarChart3,
  Code,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserRole();
  const { organization } = userProfile || {};

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: ''
  });

  // Mock data - à remplacer par de vraies données
  const stats = {
    totalEntrepreneurs: 24,
    activeProjects: 18,
    invitationCodes: 5,
    thisMonthSignups: 8
  };

  const handleSubmitRequest = () => {
    // Logique pour soumettre la demande (à implémenter plus tard)
    console.log('Demande soumise:', formData);
    setDialogOpen(false);
    setFormData({ type: '', title: '', description: '' });
  };

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête avec titre, sous-titre et boutons */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Administrateur</h1>
              <p className="text-gray-600 text-base">
                Gérez votre incubateur {organization?.name}
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
              <CardTitle className="text-sm font-medium">
                Entrepreneurs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntrepreneurs}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisMonthSignups} ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Projets Actifs
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.activeProjects / stats.totalEntrepreneurs) * 100)}% taux d'activité
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Codes d'Invitation
              </CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.invitationCodes}</div>
              <p className="text-xs text-muted-foreground">
                codes actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Croissance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.thisMonthSignups}</div>
              <p className="text-xs text-muted-foreground">
                nouveaux membres ce mois
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-aurentia-pink" />
                Gérer les Entrepreneurs
              </CardTitle>
              <CardDescription>
                Voir et gérer les profils des entrepreneurs de votre incubateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-aurentia-pink text-white py-2 px-4 rounded-md hover:bg-aurentia-pink/90 transition">
                Accéder
              </button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
        </div>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-aurentia-pink" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Dernières actions dans votre incubateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nouvel entrepreneur inscrit", user: "Marie Dupont", time: "Il y a 2h", type: "signup" },
                { action: "Projet complété", user: "Jean Martin", time: "Il y a 4h", type: "project" },
                { action: "Code d'invitation utilisé", user: "Sophie Dubois", time: "Il y a 1j", type: "invitation" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div className={`h-2 w-2 rounded-full ${
                    item.type === 'signup' ? 'bg-green-500' :
                    item.type === 'project' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
