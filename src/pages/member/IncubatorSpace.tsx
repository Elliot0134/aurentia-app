import { useUserRole } from '@/hooks/useUserRole';
import { Building, Users, BookOpen, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const IncubatorSpace = () => {
  const { userProfile } = useUserRole();
  const { organization } = userProfile || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mon incubateur : {organization?.name || 'Votre Incubateur'}
        </h1>
        <p className="text-gray-600">
          Découvrez les ressources et services de votre incubateur
        </p>
      </div>
      
      {/* Message d'accueil */}
      {organization?.welcome_message && (
        <Card className="mb-6 border-l-4 border-l-aurentia-pink">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-aurentia-pink" />
              Message de bienvenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{organization.welcome_message}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Informations de l'incubateur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-aurentia-pink" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Type :</span>
              <Badge variant="secondary" className="ml-2 capitalize">
                {organization?.type || 'incubator'}
              </Badge>
            </div>
            {organization?.domain && (
              <div>
                <span className="text-sm font-medium text-gray-500">Domaine :</span>
                <p className="text-sm text-gray-900">{organization.domain}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-aurentia-pink" />
              Réseau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Connectez-vous avec d'autres entrepreneurs de votre incubateur
            </p>
            <button className="w-full bg-aurentia-pink text-white py-2 px-4 rounded-md hover:bg-aurentia-pink/90 transition">
              Voir les entrepreneurs
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-aurentia-pink" />
              Ressources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Accédez aux ressources spécifiques de votre incubateur
            </p>
            <button className="w-full bg-aurentia-orange text-white py-2 px-4 rounded-md hover:bg-aurentia-orange/90 transition">
              Parcourir les ressources
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter */}
      {organization?.newsletter_enabled && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-aurentia-pink" />
              Newsletter de l'incubateur
            </CardTitle>
            <CardDescription>
              Restez informé des actualités et événements de {organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30"
              />
              <button className="bg-aurentia-pink text-white px-6 py-2 rounded-md hover:bg-aurentia-pink/90 transition">
                S'abonner
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prochaines étapes */}
      <Card>
        <CardHeader>
          <CardTitle>Prochaines étapes recommandées</CardTitle>
          <CardDescription>
            Maximisez votre expérience dans l'incubateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
              <div className="h-2 w-2 bg-aurentia-pink rounded-full"></div>
              <span className="text-sm">Complétez votre profil entrepreneur</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
              <div className="h-2 w-2 bg-aurentia-orange rounded-full"></div>
              <span className="text-sm">Explorez les outils disponibles</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
              <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
              <span className="text-sm">Connectez-vous avec d'autres entrepreneurs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncubatorSpace;