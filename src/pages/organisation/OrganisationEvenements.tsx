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
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './fullcalendar-custom.css';
import { useEvents, Event, EventFormData } from "@/hooks/useEvents";
import { useAdherents } from "@/hooks/useOrganisationData";
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

const OrganisationEvenements = () => {
  const { id: organisationId } = useParams();
  const { events, loading, error, addEvent, editEvent, removeEvent } = useEvents(organisationId);
  const { adherents, loading: adherentsLoading } = useAdherents();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
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
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      type: formData.type,
      location: formData.location,
      organizer_id: '',
      is_recurring: false,
      max_participants: formData.max_participants,
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

  const handleCreateEventFromRange = async () => {
    if (!selectedRange || !formData.title.trim() || !organisationId) return;
    
    const success = await addEvent({
      title: formData.title,
      description: formData.description,
      start_date: format(selectedRange.start, "yyyy-MM-dd'T'HH:mm"),
      end_date: format(selectedRange.end, "yyyy-MM-dd'T'HH:mm"),
      type: formData.type,
      location: formData.location,
      organizer_id: '',
      is_recurring: false,
      max_participants: formData.max_participants,
      organization_id: organisationId
    });
    
    if (success) {
      setCreateEventModalOpen(false);
      setSelectedRange(null);
      setSelectedMembers([]);
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

  const handleEventResize = async (resizeInfo: any) => {
    const eventId = resizeInfo.event.id;
    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end;

    const success = await editEvent(eventId, {
      start_date: format(newStart, "yyyy-MM-dd'T'HH:mm"),
      end_date: format(newEnd, "yyyy-MM-dd'T'HH:mm")
    });

    if (!success) {
      // Annuler le changement si la mise à jour échoue
      resizeInfo.revert();
    }
  };

  const handleEventDrop = async (dropInfo: any) => {
    const eventId = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;

    const success = await editEvent(eventId, {
      start_date: format(newStart, "yyyy-MM-dd'T'HH:mm"),
      end_date: format(newEnd, "yyyy-MM-dd'T'HH:mm")
    });

    if (!success) {
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
      setEditDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  // Convertir les événements Supabase pour FullCalendar
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    extendedProps: {
      ...event
    }
  }));

  const getEventTypeColor = (type: Event['type']) => {
    const colors = {
      workshop: '#ff5932', // Couleur principale Aurentia
      meeting: '#6366f1', // Indigo
      webinar: '#8b5cf6', // Violet
      networking: '#06b6d4', // Cyan
      other: '#64748b' // Slate
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

  // Configuration des événements pour FullCalendar
  const eventContent = (eventInfo: any) => {
    const eventType = eventInfo.event.extendedProps.type;
    const backgroundColor = getEventTypeColor(eventType);

    return (
      <div
        className="fc-event-content"
        style={{
          backgroundColor,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="fc-event-title" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {eventInfo.event.title}
        </div>
      </div>
    );
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

        {/* Modal de création d'événement avec drag-and-drop */}
        <Dialog open={createEventModalOpen} onOpenChange={setCreateEventModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un événement</DialogTitle>
              <DialogDescription>
                Créez un événement pour la période sélectionnée: {selectedRange && format(selectedRange.start, 'dd/MM/yyyy HH:mm', { locale: fr })} - {selectedRange && format(selectedRange.end, 'dd/MM/yyyy HH:mm', { locale: fr })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="drag-title">Titre de l'événement *</Label>
                <Input
                  id="drag-title"
                  placeholder="Ex: Workshop Business Model"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="drag-type">Type d'événement</Label>
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
                <Label htmlFor="drag-description">Description</Label>
                <Textarea
                  id="drag-description"
                  placeholder="Description de l'événement"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="drag-location">Lieu</Label>
                <Input
                  id="drag-location"
                  placeholder="Ex: Salle de conférence A"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="drag-max_participants">Participants max</Label>
                <Input
                  id="drag-max_participants"
                  type="number"
                  placeholder="Ex: 50"
                  value={formData.max_participants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>

              {/* Sélection des membres */}
              <div className="md:col-span-2">
                <Label>Sélectionner les participants</Label>
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {adherentsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : adherents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Aucun membre trouvé</p>
                  ) : (
                    adherents.map((adherent) => (
                      <div key={adherent.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={`member-${adherent.id}`}
                          checked={selectedMembers.includes(adherent.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers(prev => [...prev, adherent.id]);
                            } else {
                              setSelectedMembers(prev => prev.filter(id => id !== adherent.id));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`member-${adherent.id}`} className="text-sm cursor-pointer">
                          {adherent.first_name} {adherent.last_name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedMembers.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedMembers.length} membre{selectedMembers.length > 1 ? 's' : ''} sélectionné{selectedMembers.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateEventModalOpen(false);
                setSelectedRange(null);
                setSelectedMembers([]);
              }}>
                Annuler
              </Button>
              <Button 
                style={{ backgroundColor: '#ff5932' }} 
                className="hover:opacity-90 text-white"
                onClick={handleCreateEventFromRange}
                disabled={!formData.title.trim()}
              >
                Créer l'événement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
            {/* Calendrier */}
            <Card>
              <CardContent className="p-6">
                <div style={{ height: '600px' }}>
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    locale={frLocale}
                    events={calendarEvents}
                    eventContent={eventContent}
                    eventClick={(info) => {
                      const event = events.find(e => e.id === info.event.id);
                      if (event) {
                        setSelectedEvent(event);
                        setEditDialogOpen(true);
                      }
                    }}
                    selectable={true}
                    selectMirror={true}
                    select={(selectInfo) => {
                      setSelectedRange({
                        start: selectInfo.start,
                        end: selectInfo.end
                      });
                      setCreateEventModalOpen(true);
                    }}
                    editable={true}
                    eventStartEditable={true}
                    eventDurationEditable={true}
                    eventResize={handleEventResize}
                    eventDrop={handleEventDrop}
                    height="100%"
                    dayMaxEvents={3}
                    moreLinkClick="popover"
                    buttonText={{
                      today: "Aujourd'hui",
                      month: 'Mois',
                      week: 'Semaine',
                      day: 'Jour'
                    }}
                    slotLabelFormat={{
                      hour: 'numeric',
                      minute: '2-digit',
                      omitZeroMinute: false,
                      meridiem: false
                    }}
                    eventTimeFormat={{
                      hour: 'numeric',
                      minute: '2-digit',
                      meridiem: false
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
                          {format(new Date(selectedEvent.start_date), 'dd/MM/yyyy HH:mm', { locale: fr })} - {format(new Date(selectedEvent.end_date), 'HH:mm', { locale: fr })}
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
