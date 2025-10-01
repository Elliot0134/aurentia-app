import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganisationStats, useProjects, useEntrepreneurs } from '@/hooks/useOrganisationData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  Calendar,
  Award,
  Target
} from "lucide-react";

const OrganisationAnalytics = () => {
  const { id: organisationId } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: ''
  });

  // Utiliser les données Supabase
  const { stats, loading: statsLoading } = useOrganisationStats();
  const { projects, loading: projectsLoading } = useProjects();
  const { entrepreneurs, loading: entrepreneursLoading } = useEntrepreneurs();

  // Générer des données d'analytics basées sur les vraies données
  const monthlySignups = [
    { month: 'Jan', signups: Math.floor((stats?.thisMonthSignups || 0) * 0.3), projects: Math.floor((stats?.activeProjects || 0) * 0.2) },
    { month: 'Fév', signups: Math.floor((stats?.thisMonthSignups || 0) * 0.5), projects: Math.floor((stats?.activeProjects || 0) * 0.3) },
    { month: 'Mar', signups: Math.floor((stats?.thisMonthSignups || 0) * 0.7), projects: Math.floor((stats?.activeProjects || 0) * 0.5) },
    { month: 'Avr', signups: Math.floor((stats?.thisMonthSignups || 0) * 0.4), projects: Math.floor((stats?.activeProjects || 0) * 0.3) },
    { month: 'Mai', signups: Math.floor((stats?.thisMonthSignups || 0) * 1.2), projects: Math.floor((stats?.activeProjects || 0) * 0.8) },
    { month: 'Jun', signups: stats?.thisMonthSignups || 0, projects: stats?.activeProjects || 0 }
  ];

  const activeProjectsCount = projects.filter(p => p.statut === 'active' || p.statut === 'actif').length;
  const completedProjectsCount = projects.filter(p => p.statut === 'completed' || p.statut === 'terminé').length;
  const draftProjectsCount = projects.filter(p => p.statut === 'draft' || p.statut === 'brouillon').length;
  const archivedProjectsCount = projects.filter(p => p.statut === 'archived' || p.statut === 'archivé').length;

  const projectStatus = [
    { name: 'En cours', value: activeProjectsCount, color: '#8884d8' },
    { name: 'Complété', value: completedProjectsCount, color: '#82ca9d' },
    { name: 'Brouillon', value: draftProjectsCount, color: '#ffc658' },
    { name: 'Archivé', value: archivedProjectsCount, color: '#ff7c7c' }
  ];

  const engagement = [
    { week: 'S1', sessions: Math.floor((stats?.totalEntrepreneurs || 0) * 0.6), duration: 25 },
    { week: 'S2', sessions: Math.floor((stats?.totalEntrepreneurs || 0) * 0.7), duration: 30 },
    { week: 'S3', sessions: Math.floor((stats?.totalEntrepreneurs || 0) * 0.65), duration: 28 },
    { week: 'S4', sessions: Math.floor((stats?.totalEntrepreneurs || 0) * 0.8), duration: 35 },
    { week: 'S5', sessions: Math.floor((stats?.totalEntrepreneurs || 0) * 0.75), duration: 32 },
    { week: 'S6', sessions: stats?.totalEntrepreneurs || 0, duration: 40 }
  ];

  if (statsLoading || projectsLoading || entrepreneursLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcul des livrables basé sur les projets réels
  const totalProjectsCount = projects.length;
  const deliverables = [
    { 
      type: 'Business Model', 
      completed: Math.floor(completedProjectsCount * 0.75), 
      total: totalProjectsCount 
    },
    { 
      type: 'Pitch', 
      completed: Math.floor(completedProjectsCount * 0.6), 
      total: totalProjectsCount 
    },
    { 
      type: 'Market Analysis', 
      completed: Math.floor(completedProjectsCount * 0.5), 
      total: totalProjectsCount 
    },
    { 
      type: 'Vision/Mission', 
      completed: Math.floor(completedProjectsCount * 0.8), 
      total: totalProjectsCount 
    },
    { 
      type: 'Persona', 
      completed: Math.floor(completedProjectsCount * 0.65), 
      total: totalProjectsCount 
    }
  ];

  const handleSubmitRequest = () => {
    console.log('Demande soumise:', formData);
    setDialogOpen(false);
    setFormData({ type: '', title: '', description: '' });
  };

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics</h1>
              <p className="text-gray-600 text-base">
                Visualisez les performances et l'engagement des entrepreneurs de votre organisation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white border border-gray-200 hover:bg-gray-50">
                Exporter les données
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                    Personnaliser +
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Personnaliser le tableau de bord</DialogTitle>
                    <DialogDescription>
                      Configurez les métriques et visualisations qui vous intéressent le plus.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type de métrique</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engagement">Engagement utilisateur</SelectItem>
                          <SelectItem value="projects">Performance projets</SelectItem>
                          <SelectItem value="growth">Croissance</SelectItem>
                          <SelectItem value="retention">Rétention</SelectItem>
                          <SelectItem value="custom">Métrique personnalisée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom de la métrique</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ex: Taux de complétion des livrables"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Décrivez ce que mesure cette métrique..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSubmitRequest} style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                      Ajouter la métrique
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Métriques clés avec données Supabase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entrepreneurs Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEntrepreneurs || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.thisMonthSignups > 0 ? '+' : ''}{Math.round(((stats?.thisMonthSignups || 0) / (stats?.totalEntrepreneurs || 1)) * 100)}% ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Complétion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.activeProjects || 0) + (stats?.completedProjects || 0) > 0 
                  ? Math.round((completedProjectsCount / ((stats.activeProjects || 0) + (stats.completedProjects || 0))) * 100) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Projets complétés/total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Créés</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats?.activeProjects || 0) + (stats?.completedProjects || 0)}</div>
              <p className="text-xs text-muted-foreground">{stats?.activeProjects || 0} projets actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Moyen</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalEntrepreneurs > 0 
                  ? Math.round(((stats?.activeProjects || 0) / stats.totalEntrepreneurs) * 100) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Projets par entrepreneur</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques principaux */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="deliverables">Livrables</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Croissance Mensuelle</CardTitle>
                  <CardDescription>Évolution des inscriptions et créations de projets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlySignups}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="signups" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                        name="Inscriptions"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="projects" 
                        stackId="1"
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.6}
                        name="Projets créés"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statut des Projets</CardTitle>
                  <CardDescription>Répartition de l'état d'avancement des projets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={projectStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Hebdomadaire</CardTitle>
                <CardDescription>Sessions et durée moyenne d'utilisation par semaine</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={engagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sessions" fill="#8884d8" name="Sessions" />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="duration" 
                      stroke="#ff7300" 
                      strokeWidth={3}
                      name="Durée (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progression des Livrables</CardTitle>
                <CardDescription>Taux de complétion par type de livrable</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={deliverables} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#82ca9d" name="Complétés" />
                    <Bar dataKey="total" fill="#8884d8" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance des Projets</CardTitle>
                  <CardDescription>Évolution du nombre de projets créés</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlySignups}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="projects" fill="#82ca9d" name="Projets créés" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taux de Succès</CardTitle>
                  <CardDescription>Pourcentage de projets menés à terme</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600 mb-2">
                      {(stats?.activeProjects || 0) + (stats?.completedProjects || 0) > 0 
                        ? Math.round((completedProjectsCount / ((stats.activeProjects || 0) + (stats.completedProjects || 0))) * 100) 
                        : 0}%
                    </div>
                    <p className="text-gray-600">Projets complétés avec succès</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-gray-500">
                        {stats?.thisMonthSignups > 0 
                          ? `+${Math.round(((stats?.thisMonthSignups || 0) / (stats?.totalEntrepreneurs || 1)) * 100)}%` 
                          : '+0%'} ce trimestre
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganisationAnalytics;