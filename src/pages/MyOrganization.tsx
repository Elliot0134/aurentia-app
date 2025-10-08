import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useEvents } from '@/hooks/useEvents';
import { useUserProjects } from '@/hooks/useUserProjects';
import { getOrganisation } from '@/services/organisationService';
import { Organisation } from '@/types/organisationTypes';
import { Building, Users, BookOpen, Calendar, MessageCircle, Globe, Mail, Phone, MapPin, Award, Clock, ArrowRight, TrendingUp, Lightbulb, ExternalLink, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ApplyProjectToOrganisation from '@/components/organisation/ApplyProjectToOrganisation';

const MyOrganization = () => {
  const { userProfile } = useUserRole();
  const navigate = useNavigate();
  const { organization } = userProfile || {};
  const organizationId = userProfile?.organization_id;
  
  // Récupérer les données de l'organisation, événements et projets
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const { events, loading: eventsLoading } = useEvents(organizationId || '');
  const { projects: userProjects, loading: projectsLoading } = useUserProjects(userProfile?.id);
  
  // États locaux
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  // Récupérer les données de l'organisation
  useEffect(() => {
    const fetchOrganisation = async () => {
      if (!organizationId) {
        setOrgLoading(false);
        return;
      }

      try {
        setOrgLoading(true);
        const data = await getOrganisation(organizationId);
        
        if (data) {
          // Adapter les données du service aux types de l'interface
          const adaptedOrganisation: Organisation = {
            id: data.id,
            name: data.name,
            description: data.description || 'Aucune description disponible',
            logo: data.logo || '',
            website: data.website || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            primary_color: data.primary_color,
            secondary_color: data.secondary_color,
            settings: data.settings || {
              branding: {
                primaryColor: data.primary_color || '#ff5932',
                secondaryColor: data.secondary_color || '#1a1a1a',
                whiteLabel: false
              },
              notifications: {
                emailNotifications: true,
                projectUpdates: true,
                mentorAssignments: true,
                weeklyReports: false,
                systemAlerts: true
              }
            },
            created_at: data.created_at,
            updated_at: data.updated_at || data.created_at
          };
          
          setOrganisation(adaptedOrganisation);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'organisation:', error);
      } finally {
        setOrgLoading(false);
      }
    };

    fetchOrganisation();
  }, [organizationId]);

  // Filtrer les événements
  useEffect(() => {
    if (events.length > 0) {
      const now = new Date();
      const upcoming = events
        .filter(event => new Date(event.start_date) > now)
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, 3);
      
      const recent = events
        .filter(event => new Date(event.start_date) <= now)
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        .slice(0, 3);
      
      setUpcomingEvents(upcoming);
      setRecentEvents(recent);
    }
  }, [events]);

  // Fonction pour obtenir la couleur du type d'organisation
  const getOrganizationType = (type: string) => {
    const types = {
      'incubator': { label: 'Incubateur', color: 'bg-blue-100 text-blue-800' },
      'accelerator': { label: 'Accélérateur', color: 'bg-purple-100 text-purple-800' },
      'school': { label: 'École', color: 'bg-orange-100 text-orange-800' },
      'other': { label: 'Organisation', color: 'bg-gray-100 text-gray-800' }
    };
    return types[type as keyof typeof types] || { label: 'Organisation', color: 'bg-gray-100 text-gray-800' };
  };

  const orgType = getOrganizationType(organization?.type || 'incubator');

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement de votre organisation...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête avec informations de l'organisation */}
      <div className="mb-8">
        <div className="flex items-start gap-6 mb-6">
          {/* Logo de l'organisation */}
          <div className="w-20 h-20 bg-gradient-to-br from-aurentia-pink to-aurentia-orange rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(organisation?.name || organization?.name || 'O').charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {organisation?.name || organization?.name || 'Votre Organisation'}
              </h1>
              <Badge className={orgType.color}>
                {orgType.label}
              </Badge>
            </div>
            <p className="text-gray-600 text-lg mb-4">
              {organisation?.description || 'Découvrez les ressources et services de votre organisation'}
            </p>
            
            {/* Informations de contact rapides */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {organisation?.website && (
                <a 
                  href={organisation.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-aurentia-pink transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Site web
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {organisation?.email && (
                <a 
                  href={`mailto:${organisation.email}`}
                  className="flex items-center gap-1 hover:text-aurentia-pink transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              )}
              {organisation?.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {organisation.address}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message d'accueil personnalisé */}
      {organization?.welcome_message && (
        <Card className="mb-8 border-l-4 border-l-aurentia-pink bg-gradient-to-r from-aurentia-pink/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-aurentia-pink" />
              Message de bienvenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {organization.welcome_message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Section principale avec 2 colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Colonne principale - Événements et activités */}
        <div className="xl:col-span-2 space-y-6">
          {/* Événements à venir */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-aurentia-pink" />
                Prochains événements
              </CardTitle>
              <CardDescription>
                Les événements organisés par votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-aurentia-pink"></div>
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-aurentia-pink/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-aurentia-pink" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(event.start_date), 'EEEE d MMMM à HH:mm', { locale: fr })}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun événement programmé pour le moment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mes projets liés à l'organisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-aurentia-pink" />
                Mes projets
              </CardTitle>
              <CardDescription>
                Vos projets et leur lien avec l'organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-aurentia-pink"></div>
                </div>
              ) : userProjects.length > 0 ? (
                <div className="space-y-4">
                  {userProjects.map((project) => (
                    <div key={project.project_id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-gradient-to-br from-aurentia-pink to-aurentia-orange rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{project.nom_projet}</h4>
                          {project.organization_id === organizationId ? (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Lié à {organisation?.name}
                            </Badge>
                          ) : project.organization_name ? (
                            <Badge variant="outline" className="text-xs">
                              Lié à {project.organization_name}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Projet individuel
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description_synthetique || 'Aucune description disponible'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Créé le {format(new Date(project.created_at), 'd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/individual/project/${project.project_id}`)}
                        className="shrink-0"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Vous n'avez pas encore de projet</p>
                  <Button 
                    onClick={() => navigate('/individual/form-business-idea')}
                    className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white"
                  >
                    Créer mon premier projet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ressources et outils */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-aurentia-pink" />
                Ressources disponibles
              </CardTitle>
              <CardDescription>
                Accédez aux outils et ressources de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Bibliothèque de ressources</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Guides, templates et documents utiles pour votre développement
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold">Communauté</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Connectez-vous avec d'autres entrepreneurs de votre cohorte
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold">Suivi de progression</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Consultez vos métriques et objectifs atteints
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="font-semibold">Formations</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Modules de formation et ateliers spécialisés
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale - Informations et actions rapides */}
        <div className="space-y-6">
          {/* Informations de l'organisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-aurentia-pink" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Secteurs d'activité :</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['Tech', 'Innovation', 'Startup']).map((sector) => (
                    <Badge key={sector} variant="secondary" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-sm font-medium text-gray-500">Votre statut :</span>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Membre actif</span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Membre depuis :</span>
                <p className="text-sm text-gray-900 mt-1">
                  {userProfile?.created_at ? 
                    format(new Date(userProfile.created_at), 'MMMM yyyy', { locale: fr }) : 
                    'Récemment'
                  }
                </p>
              </div>

              {organisation?.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Téléphone :</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {organisation.phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lier un projet à l'organisation */}
          {organisation && userProjects && userProjects.length > 0 && (
            <ApplyProjectToOrganisation
              userProjects={userProjects}
              organisationId={organisation.id}
              organisationName={organisation.name}
              onSuccess={() => {
                // Refresh projects data after successful application
                window.location.reload();
              }}
            />
          )}

          {/* Prochaines étapes */}
          <Card>
            <CardHeader>
              <CardTitle>Prochaines étapes</CardTitle>
              <CardDescription>
                Optimisez votre parcours entrepreneur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="h-2 w-2 bg-aurentia-pink rounded-full"></div>
                  <span className="text-sm">Complétez votre profil</span>
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="h-2 w-2 bg-aurentia-orange rounded-full"></div>
                  <span className="text-sm">Participez au prochain événement</span>
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">Explorez les ressources</span>
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Événements récents */}
          {recentEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-aurentia-pink" />
                  Événements récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(event.start_date), 'd MMM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrganization;
