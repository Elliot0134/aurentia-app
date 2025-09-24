import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentActivity } from '@/services/recentActivityService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, Mail, Link, Copy } from 'lucide-react';

interface RecentActivitiesListProps {
  activities: RecentActivity[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error?: string | null;
}

const getActivityColor = (type: RecentActivity['type']): string => {
  const colors = {
    user_joined: 'bg-green-100 text-green-800 border-green-200',
    project_created: 'bg-blue-100 text-blue-800 border-blue-200',
    project_completed: 'bg-purple-100 text-purple-800 border-purple-200',
    deliverable_completed: 'bg-orange-100 text-orange-800 border-orange-200',
    event_created: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    event_updated: 'bg-amber-100 text-amber-800 border-amber-200',
    event_participant_added: 'bg-lime-100 text-lime-800 border-lime-200',
    event_participant_removed: 'bg-rose-100 text-rose-800 border-rose-200',
    event_moved: 'bg-violet-100 text-violet-800 border-violet-200',
    mentor_assigned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    invitation_created: 'bg-pink-100 text-pink-800 border-pink-200',
    form_created: 'bg-teal-100 text-teal-800 border-teal-200',
    form_submitted: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    organization_created: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getActivityBadgeText = (type: RecentActivity['type']): string => {
  const labels = {
    user_joined: 'Nouveau membre',
    project_created: 'Projet créé',
    project_completed: 'Projet terminé',
    deliverable_completed: 'Livrable',
    event_created: 'Événement',
    event_updated: 'Événement modifié',
    event_participant_added: 'Participant ajouté',
    event_participant_removed: 'Participant retiré',
    event_moved: 'Événement déplacé',
    mentor_assigned: 'Mentor assigné',
    invitation_created: 'Invitation',
    form_created: 'Formulaire',
    form_submitted: 'Réponse',
    organization_created: 'Organisation'
  };
  return labels[type] || 'Activité';
};

// Fonctions utilitaires pour les invitations (inspiré d'OrganisationInvitations)
const getInvitationStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
    case 'expired': return 'bg-red-100 text-red-800 border-red-200';
    case 'revoked': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getInvitationStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'accepted': return 'Acceptée';
    case 'expired': return 'Expirée';
    case 'revoked': return 'Révoquée';
    default: return 'Inconnue';
  }
};

const getInvitationRoleLabel = (role: string) => {
  switch (role) {
    case 'entrepreneur': return 'Entrepreneur';
    case 'mentor': return 'Mentor';
    case 'observer': return 'Observateur';
    default: return role;
  }
};

const getUserInitials = (userName?: string, userEmail?: string): string => {
  if (userName && userName !== 'Utilisateur inconnu' && userName !== 'Entrepreneur' && userName !== 'Administrateur') {
    const parts = userName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  }
  
  if (userEmail) {
    return userEmail.slice(0, 2).toUpperCase();
  }
  
  return 'NA';
};

// Fonction pour copier dans le presse-papiers
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Ici on pourrait ajouter un toast de succès, mais pour l'instant on ne fait rien
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
  }
};

// Fonction spéciale pour rendre la création d'organisation
const renderOrganizationCreatedActivity = (activity: RecentActivity) => {
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { 
    locale: fr, 
    addSuffix: true 
  });

  return (
    <Card key={activity.id} className="border-l-4 border-l-emerald-500 bg-emerald-50/30">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">
                  🏢
                </div>
                <div>
                  <span className="font-medium text-emerald-900">Création de l'organisation</span>
                  <p className="text-emerald-700 text-sm">
                    {activity.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-emerald-600">
              <span>Créée {timeAgo}</span>
              {activity.user_name && activity.user_name !== 'Créateur inconnu' && (
                <span>par {activity.user_name}</span>
              )}
            </div>
          </div>

          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            Événement fondateur
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Fonction spéciale pour rendre les invitations avec le style d'OrganisationInvitations
const renderInvitationActivity = (activity: RecentActivity) => {
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { 
    locale: fr, 
    addSuffix: true 
  });

  return (
    <Card key={activity.id} className="border-l-4 border-l-aurentia-pink">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-aurentia-pink" />
                <span className="font-medium font-mono">{activity.entity_name || 'CODE-INV'}</span>
              </div>
              <Badge className={getInvitationStatusColor('pending')}>
                {getInvitationStatusLabel('pending')}
              </Badge>
              <Badge variant="outline">
                {getInvitationRoleLabel(activity.metadata?.invitation_type === 'organisation_member' ? 'entrepreneur' : 'mentor')}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Créée {timeAgo}</span>
              {activity.user_name && activity.user_name !== 'Utilisateur inconnu' && (
                <span>par {activity.user_name}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(activity.entity_name || 'CODE-INV')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier le code
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActivitiesList: FC<RecentActivitiesListProps> = ({
  activities,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  error
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4 p-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">Erreur lors du chargement</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune activité récente
        </h3>
        <p className="text-gray-600">
          Les activités de votre organisation apparaîtront ici au fur et à mesure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        // Rendu spécial pour la création d'organisation
        if (activity.type === 'organization_created') {
          return renderOrganizationCreatedActivity(activity);
        }

        // Rendu spécial pour les invitations
        if (activity.type === 'invitation_created') {
          return renderInvitationActivity(activity);
        }

        const userInitials = getUserInitials(activity.user_name, activity.user_email);
        const timeAgo = formatDistanceToNow(new Date(activity.created_at), { 
          locale: fr, 
          addSuffix: true 
        });

        return (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
          >
            {/* Avatar de l'utilisateur ou icône de l'activité */}
            <div className="flex-shrink-0">
              {activity.user_name && activity.user_name !== 'Utilisateur inconnu' && activity.user_name !== 'Entrepreneur' && activity.user_name !== 'Administrateur' ? (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-aurentia-pink text-white font-semibold text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                  {activity.icon}
                </div>
              )}
            </div>

            {/* Contenu de l'activité */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  {activity.title}
                </h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getActivityColor(activity.type)}`}
                >
                  {getActivityBadgeText(activity.type)}
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {activity.description}
              </p>

              {/* Métadonnées supplémentaires */}
              {activity.metadata && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {activity.metadata.project_name && (
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      📋 {activity.metadata.project_name}
                    </span>
                  )}
                  {activity.metadata.event_type && (
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      🏷️ {activity.metadata.event_type}
                    </span>
                  )}
                  {activity.metadata.invitation_type && (
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      👤 {activity.metadata.invitation_type === 'organisation_member' ? 'Entrepreneur' : 'Équipe'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0 text-right">
              <time className="text-xs text-gray-500" dateTime={activity.created_at}>
                {timeAgo}
              </time>
            </div>
          </div>
        );
      })}

      {/* Bouton "Charger plus" */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="hover:bg-aurentia-pink hover:text-white hover:border-aurentia-pink transition-colors"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              'Charger plus d\'activités'
            )}
          </Button>
        </div>
      )}

      {/* Message si plus rien à charger */}
      {!hasMore && activities.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Toutes les activités ont été chargées
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesList;