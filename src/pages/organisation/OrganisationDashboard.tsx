import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganisationData, useOrganisationStats, useInvitationCodes } from '@/hooks/useOrganisationData';
import { useRecentActivities } from '@/hooks/useRecentActivities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarWithEvents } from "@/components/ui/calendar-with-events";
import { EventCreationModal } from "@/components/ui/event-creation-modal";
import { EventDetailsModal } from "@/components/ui/event-details-modal";
import RecentActivitiesList from "@/components/ui/recent-activities-list";
import { useEvents, EventFormData } from "@/hooks/useEvents";
import { getInvitationStatusColor, getInvitationStatusLabel, getInvitationRoleLabel, INVITATION_ROLE_OPTIONS } from "@/lib/invitationConstants";
import { getEventTypeColor } from "@/lib/eventConstants";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Users,
  FileText,
  TrendingUp,
  Code,
  Activity,
  BarChart3,
  Calendar,
  MessageSquare,
  Mail,
  Copy,
  Plus,
  Clock,
  MapPin
} from "lucide-react";

const OrganisationDashboard = () => {
  const navigate = useNavigate();
  const { organisation, loading: orgLoading } = useOrganisationData();
  const { stats, loading: statsLoading } = useOrganisationStats();
  const { codes: invitationCodes, loading: codesLoading, generateCode } = useInvitationCodes();
  const { events, addEvent, editEvent } = useEvents(organisation?.id || '');
  const { activities, loading: activitiesLoading, loadingMore, hasMore, loadMore, error: activitiesError, refresh: refreshActivities } = useRecentActivities(15);
  const { toast } = useToast();

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventDetailsModalOpen, setEventDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
  const [invitationFormData, setInvitationFormData] = useState({
    role: 'entrepreneur' as 'entrepreneur' | 'mentor',
    email: ''
  });

  const handleCreateEvent = async (eventData: EventFormData) => {
    const success = await addEvent(eventData);
    if (success) {
      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès.",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'événement.",
        variant: "destructive",
      });
    }
    return success;
  };

  const handleAddEvent = () => {
    setSelectedRange(null);
    setEventModalOpen(true);
  };

  const handleEventClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setEventDetailsModalOpen(true);
    }
  };

  // Filtrer les événements pour le jour sélectionné
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      const selectedDateStart = new Date(date);
      selectedDateStart.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(date);
      selectedDateEnd.setHours(23, 59, 59, 999);
      
      return (eventStart <= selectedDateEnd && eventEnd >= selectedDateStart);
    });
  };

  const eventsForSelectedDate = getEventsForDate(selectedDate);

  const handleCreateInvitation = async () => {
    if (!invitationFormData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email.",
        variant: "destructive",
      });
      return;
    }

    try {
      const code = 'INV-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const newCode = await generateCode({
        code,
        role: invitationFormData.role,
        created_by: '', // Will be set by the hook
        expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
        max_uses: 1,
        is_active: true
      });

      if (newCode) {
        toast({
          title: "Invitation créée",
          description: `Code d'invitation ${code} créé pour ${invitationFormData.email}`,
        });
        setInvitationDialogOpen(false);
        setInvitationFormData({ role: 'entrepreneur', email: '' });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'invitation.",
        variant: "destructive",
      });
    }
  };

  if (orgLoading || statsLoading) {
    return <LoadingSpinner message="Chargement du dashboard..." fullScreen />;
  }

  return (
    <>
      {/* En-tête avec titre, sous-titre et boutons */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Organisation</h1>
            <p className="text-gray-600 text-base">
              Gérez votre organisation {organisation?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Section principale avec 2 colonnes : Calendrier étendu | Invitations */}
      <div className="mb-16">
        <div className="grid grid-cols-12 gap-6 h-[600px]">
          {/* Calendrier étendu - 8 colonnes */}
          <div className="col-span-8">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-aurentia-pink" />
                  Calendrier & Événements
                </CardTitle>
                <CardDescription className="mt-1">
                  Événements planifiés et détails du jour sélectionné
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] p-6">
                <div className="grid grid-cols-12 gap-8 h-full">
                  {/* Calendrier */}
                  <div className="col-span-5">
                    <CalendarWithEvents 
                      onAddEvent={handleAddEvent}
                      onEventClick={handleEventClick}
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      events={eventsForSelectedDate.map(event => ({
                        id: event.id,
                        title: event.title,
                        from: event.start_date,
                        to: event.end_date,
                        type: event.type
                      }))} 
                    />
                  </div>
                  
                  {/* Liste des événements du jour sélectionné */}
                  <div className="col-span-7">
                    <div className="h-full border rounded-lg p-4 bg-gray-50/30">
                      <h3 className="font-medium text-base mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-aurentia-pink" />
                        Événements du {selectedDate.toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </h3>
                      
                      <div className="space-y-3 overflow-y-auto max-h-[450px]">
                        {eventsForSelectedDate.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">Aucun événement prévu</p>
                            <p className="text-sm">Cette journée est libre</p>
                          </div>
                        ) : (
                          eventsForSelectedDate.map((event) => {
                            const eventTypeColor = getEventTypeColor(event.type);
                            const startDate = new Date(event.start_date);
                            const endDate = new Date(event.end_date);
                            
                            return (
                              <div
                                key={event.id}
                                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:border-aurentia-pink/30"
                                onClick={() => handleEventClick(event.id)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-3 h-3 rounded-full flex-shrink-0" 
                                      style={{ backgroundColor: eventTypeColor }}
                                    />
                                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {startDate.toLocaleTimeString('fr-FR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })} - {endDate.toLocaleTimeString('fr-FR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                
                                {event.location && (
                                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </p>
                                )}
                                
                                {event.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users className="w-3 h-3" />
                                    {event.participants?.length || 0} participants
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-xs h-6 px-2 text-aurentia-pink hover:text-aurentia-pink hover:bg-aurentia-pink/10"
                                  >
                                    Voir détails
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section invitations - 4 colonnes */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Mail className="h-5 w-5 text-aurentia-pink" />
                    Invitations
                  </CardTitle>
                  <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                        <Plus className="w-3 h-3 mr-1" />
                        Créer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer une invitation</DialogTitle>
                        <DialogDescription>
                          Invitez de nouveaux membres à rejoindre votre organisation.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email</label>
                          <Input 
                            placeholder="email@exemple.com" 
                            value={invitationFormData.email}
                            onChange={(e) => setInvitationFormData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Rôle</label>
                          <Select 
                            value={invitationFormData.role} 
                            onValueChange={(value: 'entrepreneur' | 'mentor') => setInvitationFormData(prev => ({ ...prev, role: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INVITATION_ROLE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setInvitationDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button 
                          style={{ backgroundColor: '#ff5932' }} 
                          className="hover:opacity-90 text-white"
                          onClick={handleCreateInvitation}
                        >
                          Créer l'invitation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0 h-[calc(100%-80px)] overflow-y-auto">
                {codesLoading ? (
                  <div className="text-center py-6">
                    <LoadingSpinner size="sm" message="Chargement..." />
                  </div>
                ) : (() => {
                  // Filtrer les invitations récentes (30 derniers jours)
                  const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
                  const recentInvitations = invitationCodes
                    .filter(code => new Date(code.created_at) >= thirtyDaysAgo)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10); // Afficher max 10 invitations récentes pour utiliser l'espace vertical

                  return recentInvitations.length === 0 ? (
                    <div className="text-center py-6">
                      <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucune invitation récente</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentInvitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-medium truncate">{invitation.code}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getInvitationStatusColor(invitation.is_active ? 'pending' : 'expired')}`}>
                                {getInvitationStatusLabel(invitation.is_active ? 'pending' : 'expired')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(invitation.created_at).toLocaleDateString('fr-FR')} • {getInvitationRoleLabel(invitation.role)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(invitation.code);
                              toast({
                                title: "Copié",
                                description: "Le code d'invitation a été copié.",
                              });
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      {invitationCodes.filter(code => new Date(code.created_at) >= thirtyDaysAgo).length > 10 && (
                        <div className="text-center pt-2 border-t">
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate('/organisation/invitations')}
                            className="text-aurentia-pink hover:text-aurentia-pink/80 text-xs"
                          >
                            Voir toutes les invitations
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
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
            <RecentActivitiesList
              activities={activities}
              loading={activitiesLoading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
              error={activitiesError}
            />
          </CardContent>
        </Card>

        {/* Modale création d'événement */}
        <EventCreationModal
          open={eventModalOpen}
          onOpenChange={setEventModalOpen}
          organisationId={organisation?.id || ''}
          selectedRange={selectedRange}
          onCreateEvent={handleCreateEvent}
        />

        {/* Modale détails d'événement */}
        <EventDetailsModal
          event={selectedEvent}
          open={eventDetailsModalOpen}
          onOpenChange={setEventDetailsModalOpen}
          editEvent={editEvent}
          onEventUpdate={(updatedEvent) => {
            // Mettre à jour l'événement dans la liste
            const updatedEvents = events.map(event => 
              event.id === updatedEvent.id ? updatedEvent : event
            );
            // Rafraîchir les activités récentes pour voir les changements
            refreshActivities();
          }}
          onEventDelete={async (eventId) => {
            // Pour le dashboard, on pourrait ajouter la logique de suppression ici
            // ou rediriger vers la page des événements
            console.log('Suppression depuis le dashboard:', eventId);
            // Pour l'instant, on affiche juste un message
            toast({
              title: "Action requise",
              description: "Veuillez supprimer l'événement depuis la page Événements.",
              variant: "default",
            });
          }}
        />

      </>
    );
  };

export default OrganisationDashboard;