import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './fullcalendar-custom.css';
import { useEvents, Event, EventFormData } from "@/hooks/useEvents";
import { useEventTypeColors } from "@/hooks/useEventTypeColors";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getEventTypeColor, getEventTypeLabel, EVENT_TYPE_OPTIONS } from "@/lib/eventConstants";
import { EnhancedEventCalendar } from "@/components/ui/enhanced-event-calendar";
import { EventDetailsModal } from "@/components/ui/event-details-modal";
import { EventCreationModal } from "@/components/ui/event-creation-modal";
import { formatDateForDatabase } from "@/utils/dateTimeUtils";
import {
  Calendar as CalendarIcon,
  Plus,
  Users,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";

const OrganisationEvenements = () => {
  const { id: organisationId } = useParams();
  const { events, loading, error, addEvent, editEvent, removeEvent } = useEvents(organisationId);
  const { eventTypeColors, loading: colorsLoading } = useEventTypeColors(organisationId);
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);

  const handleCreateEvent = async (eventData: EventFormData): Promise<boolean> => {
    if (!organisationId) return false;

    const success = await addEvent({
      ...eventData,
      organizer_id: userProfile?.id || null,
      organization_id: organisationId
    });

    if (success) {
      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès.",
      });
      return true;
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'événement.",
        variant: "destructive",
      });
      return false;
    }
  };


  const handleEventResize = async (resizeInfo: any) => {
    const eventId = resizeInfo.event.id;
    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end;

    // Convert Date objects to ISO format for database
    const success = await editEvent(eventId, {
      start_date: formatDateForDatabase(newStart),
      end_date: formatDateForDatabase(newEnd)
    });

    if (!success) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la durée de l'événement.",
        variant: "destructive",
      });
      // Annuler le changement si la mise à jour échoue
      resizeInfo.revert();
    }
  };

  const handleEventDrop = async (dropInfo: any) => {
    const eventId = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;

    // Convert Date objects to ISO format for database
    const success = await editEvent(eventId, {
      start_date: formatDateForDatabase(newStart),
      end_date: formatDateForDatabase(newEnd)
    });

    if (!success) {
      toast({
        title: "Erreur",
        description: "Impossible de déplacer l'événement.",
        variant: "destructive",
      });
      // Annuler le changement si la mise à jour échoue
      dropInfo.revert();
    }
  };

  const handleSelectEvent = (event: any) => {
    const fullEvent = events.find(e => e.id === event.id);
    if (fullEvent) {
      setSelectedEvent(fullEvent);
      setEditDialogOpen(true);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const success = await removeEvent(eventId);
    if (success) {
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès.",
      });
      setEditDialogOpen(false);
      setSelectedEvent(null);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement.",
        variant: "destructive",
      });
    }
  };



  const stats = {
    total: events.length,
    thisMonth: events.filter(event => {
      const eventDate = new Date(event.start_date);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).length,
    upcoming: events.filter(event => new Date(event.start_date) > new Date()).length,
    totalParticipants: events.reduce((sum, event) => sum + event.participants.length, 0)
  };

  return (
    <>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Événements</h1>
            <p className="text-gray-600 text-base">
              Planifiez et gérez vos événements d'organisation.
            </p>
          </div>
            <Button
              style={{ backgroundColor: '#ff5932' }}
              className="hover:opacity-90 text-white"
              onClick={() => {
                setSelectedRange(null);
                setCreateEventModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel événement
            </Button>
          </div>
        </div>

        {/* Modal unifiée de création d'événement */}
        <EventCreationModal
          open={createEventModalOpen}
          onOpenChange={setCreateEventModalOpen}
          organisationId={organisationId || ''}
          selectedRange={selectedRange}
          onCreateEvent={handleCreateEvent}
        />

        {/* Message d'erreur */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À Venir</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcoming}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!loading && !colorsLoading && (
          <>
            {/* Calendrier amélioré */}
            <EnhancedEventCalendar
              events={events}
              eventTypeColors={eventTypeColors}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setEditDialogOpen(true);
              }}
              onSelect={(selectInfo) => {
                setSelectedRange({
                  start: selectInfo.start,
                  end: selectInfo.end
                });
                setCreateEventModalOpen(true);
              }}
              onEventResize={handleEventResize}
              onEventDrop={handleEventDrop}
              loading={loading}
            />

            {/* Dialog de détails de l'événement */}
            <EventDetailsModal
              event={selectedEvent}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              editEvent={editEvent}
              onEventUpdate={(updatedEvent) => {
                // Mettre à jour l'événement dans la liste
                const updatedEvents = events.map(event => 
                  event.id === updatedEvent.id ? updatedEvent : event
                );
                // Ici on pourrait mettre à jour le state des événements si nécessaire
                // Pour l'instant, on peut juste fermer la modale
              }}
              onEventDelete={async (eventId) => {
                const success = await removeEvent(eventId);
                if (success) {
                  toast({
                    title: "Événement supprimé",
                    description: "L'événement a été supprimé avec succès.",
                  });
                  setEditDialogOpen(false);
                  setSelectedEvent(null);
                } else {
                  throw new Error("Impossible de supprimer l'événement.");
                }
              }}
            />

            {/* Message si aucun événement */}
            {events.length === 0 && !loading && (
              <Card className="text-center py-12 mt-6">
                <CardContent>
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun événement planifié</h3>
                  <p className="text-gray-600 mb-4">
                    Commencez par créer votre premier événement.
                  </p>
                  <Button 
                    style={{ backgroundColor: '#ff5932' }} 
                    className="hover:opacity-90 text-white"
                    onClick={() => setCreateEventModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un événement
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </>
    );
  };

export default OrganisationEvenements;
