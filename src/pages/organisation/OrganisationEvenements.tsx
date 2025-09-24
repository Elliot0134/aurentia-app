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
import { useEventTypeColors } from "@/hooks/useEventTypeColors";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getEventTypeColor, getEventTypeLabel, EVENT_TYPE_OPTIONS } from "@/lib/eventConstants";
import { EnhancedEventCalendar } from "@/components/ui/enhanced-event-calendar";
import { EventDetailsModal } from "@/components/ui/event-details-modal";
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
  const { eventTypeColors, loading: colorsLoading } = useEventTypeColors(organisationId);
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  
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
      organizer_id: userProfile?.id || null,
      is_recurring: false,
      max_participants: formData.max_participants,
      organization_id: organisationId
    });
    
    if (success) {
      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès.",
      });
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
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'événement.",
        variant: "destructive",
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
      organizer_id: userProfile?.id || null,
      is_recurring: false,
      max_participants: formData.max_participants,
      organization_id: organisationId
    });
    
    if (success) {
      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès.",
      });
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
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'événement.",
        variant: "destructive",
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

    const success = await editEvent(eventId, {
      start_date: format(newStart, "yyyy-MM-dd'T'HH:mm"),
      end_date: format(newEnd, "yyyy-MM-dd'T'HH:mm")
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
                        {EVENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                      min="0"
                      placeholder="Ex: 50"
                      value={formData.max_participants || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        // Empêcher les valeurs négatives
                        if (value === undefined || value >= 0) {
                          setFormData(prev => ({ ...prev, max_participants: value }));
                        }
                      }}
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
                    {EVENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
                  min="0"
                  placeholder="Ex: 50"
                  value={formData.max_participants || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    // Empêcher les valeurs négatives
                    if (value === undefined || value >= 0) {
                      setFormData(prev => ({ ...prev, max_participants: value }));
                    }
                  }}
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
      </>
    );
  };

export default OrganisationEvenements;
