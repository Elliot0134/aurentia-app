import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents, Event, EventFormData } from "@/hooks/useEvents";
import {
  Calendar as CalendarIcon,
  Plus,
  Users,
  MapPin,
  Clock,
  Tag,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle
} from "lucide-react";

// Configuration de moment en français
moment.locale('fr');
const localizer = momentLocalizer(moment);

const OrganisationEvenements = () => {
  const { id: organisationId } = useParams();
  const { events, loading, error, addEvent, editEvent, removeEvent } = useEvents(organisationId);
  
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [date, setDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Formulaire pour ajouter un événement
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    type: 'other',
    location: '',
    organizer_id: '',
    is_recurring: false,
    max_participants: undefined,
    organization_id: organisationId || ''
  });

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.start_date || !formData.end_date || !organisationId) return;
    
    const success = await addEvent({
      ...formData,
      organization_id: organisationId
    });
    
    if (success) {
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        type: 'other',
        location: '',
        organizer_id: '',
        is_recurring: false,
        max_participants: undefined,
        organization_id: organisationId
      });
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
      setEditDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  // Convertir les événements Supabase pour react-big-calendar
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    resource: event
  }));

  const getEventTypeColor = (type: Event['type']) => {
    const colors = {
      workshop: '#8884d8',
      meeting: '#82ca9d',
      webinar: '#ffc658',
      networking: '#ff7c7c',
      other: '#8dd1e1'
    };
    return colors[type];
  };

  const getEventTypeLabel = (type: Event['type']) => {
    const labels = {
      workshop: 'Atelier',
      meeting: 'Réunion',
      webinar: 'Webinaire',
      networking: 'Networking',
      other: 'Autre'
    };
    return labels[type];
  };

  const eventStyleGetter = (event: any) => {
    const eventData = event.resource as Event;
    return {
      style: {
        backgroundColor: getEventTypeColor(eventData.type),
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
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
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Événements</h1>
              <p className="text-gray-600 text-base">
                Planifiez et gérez vos événements d'organisation.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel événement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel événement</DialogTitle>
                  <DialogDescription>
                    Planifiez un événement pour votre organisation.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre de l'événement *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Workshop Business Model"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type d'événement</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Event['type'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Atelier</SelectItem>
                        <SelectItem value="meeting">Réunion</SelectItem>
                        <SelectItem value="webinar">Webinaire</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Description de l'événement"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="start_date">Date et heure de début *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">Date et heure de fin *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Salle de conférence A"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_participants">Participants max</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      placeholder="Ex: 50"
                      value={formData.max_participants || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    style={{ backgroundColor: '#ff5932' }} 
                    className="hover:opacity-90 text-white"
                    onClick={handleCreateEvent}
                    disabled={!formData.title.trim() || !formData.start_date || !formData.end_date}
                  >
                    Créer l'événement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

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

        {!loading && (
          <>
            {/* Contrôles du calendrier */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="view">Vue:</Label>
                    <Select value={view} onValueChange={(value) => setView(value as any)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Mois</SelectItem>
                        <SelectItem value="week">Semaine</SelectItem>
                        <SelectItem value="day">Jour</SelectItem>
                        <SelectItem value="agenda">Agenda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setDate(new Date())}
                    >
                      Aujourd'hui
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendrier */}
            <Card>
              <CardContent className="p-6">
                <div style={{ height: '600px' }}>
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    view={view}
                    date={date}
                    onView={setView}
                    onNavigate={setDate}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    messages={{
                      next: "Suivant",
                      previous: "Précédent",
                      today: "Aujourd'hui",
                      month: "Mois",
                      week: "Semaine",
                      day: "Jour",
                      agenda: "Agenda",
                      date: "Date",
                      time: "Heure",
                      event: "Événement",
                      noEventsInRange: "Aucun événement dans cette période",
                      showMore: (total) => `+ ${total} événement(s) supplémentaire(s)`
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dialog de détails de l'événement */}
            {selectedEvent && (
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-aurentia-pink" />
                      {selectedEvent.title}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                      <p className="mt-1">{getEventTypeLabel(selectedEvent.type)}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date et heure</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {moment(selectedEvent.start_date).format('DD/MM/YYYY HH:mm')} - {moment(selectedEvent.end_date).format('HH:mm')}
                        </span>
                      </div>
                    </div>

                    {selectedEvent.location && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Lieu</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{selectedEvent.location}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Participants</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Users className="w-4 w-4 text-gray-400" />
                        <span>
                          {selectedEvent.participants.length} / {selectedEvent.max_participants || '∞'} participants
                        </span>
                      </div>
                    </div>

                    {selectedEvent.description && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Description</Label>
                        <p className="mt-1 text-sm text-gray-600">{selectedEvent.description}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Créé le: {new Date(selectedEvent.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                      Fermer
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

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
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un événement
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrganisationEvenements;
