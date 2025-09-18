import { useUserRole } from '@/hooks/useUserRole';
import { BarChart3, Users, FileText, Code, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const { userProfile } = useUserRole();
  const { organization } = userProfile || {};

  // Mock data - à remplacer par de vraies données
  const stats = {
    totalEntrepreneurs: 24,
    activeProjects: 18,
    invitationCodes: 5,
    thisMonthSignups: 8
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Administrateur
        </h1>
        <p className="text-gray-600">
          Gérez votre incubateur {organization?.name}
        </p>
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
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    item.type === 'signup' ? 'bg-green-500' :
                    item.type === 'project' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;