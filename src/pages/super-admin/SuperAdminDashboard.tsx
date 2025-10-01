import { useUserRole } from '@/hooks/useUserRole';
import { Building, Users, BarChart3, Globe, Shield, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SuperAdminDashboard = () => {
  const { userProfile } = useUserRole();

  // Mock data - à remplacer par de vraies données
  const globalStats = {
    totalOrganizations: 12,
    totalUsers: 487,
    activeProjects: 234,
    monthlyGrowth: 23
  };

  const recentOrganizations = [
    { name: "Station F", type: "incubator", users: 45, status: "active" },
    { name: "TheFamily", type: "accelerator", users: 32, status: "active" },
    { name: "ESCP Incubator", type: "school", users: 28, status: "pending" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Super Administrateur
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble globale de la plateforme Aurentia
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Organisations
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              incubateurs et accélérateurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs Totaux
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{globalStats.monthlyGrowth} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projets Actifs
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((globalStats.activeProjects / globalStats.totalUsers) * 100)}% engagement
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
            <div className="text-2xl font-bold">+{globalStats.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              croissance mensuelle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-aurentia-pink" />
              Organisations
            </CardTitle>
            <CardDescription>
              Gérer les incubateurs et accélérateurs partenaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button className="w-full bg-aurentia-pink text-white py-2 px-4 rounded-md hover:bg-aurentia-pink/90 transition">
              Gérer les organisations
            </button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-aurentia-orange" />
              Utilisateurs Globaux
            </CardTitle>
            <CardDescription>
              Superviser tous les utilisateurs de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button className="w-full bg-aurentia-orange text-white py-2 px-4 rounded-md hover:bg-aurentia-orange/90 transition">
              Voir les utilisateurs
            </button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Codes Super Admin
            </CardTitle>
            <CardDescription>
              Créer des codes d'invitation pour nouveaux super admins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-600/90 transition">
              Gérer les codes
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Organisations récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-aurentia-pink" />
            Organisations Récentes
          </CardTitle>
          <CardDescription>
            Dernières organisations ajoutées à la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrganizations.map((org, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-aurentia-pink to-aurentia-orange rounded-md flex items-center justify-center text-white font-bold">
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{org.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {org.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{org.users} utilisateurs</span>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={org.status === 'active' ? 'default' : 'secondary'}
                  className={org.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {org.status === 'active' ? 'Actif' : 'En attente'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;