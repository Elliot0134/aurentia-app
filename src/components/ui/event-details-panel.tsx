import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/services/organisationService";
import { getEventTypeLabel, getEventTypeColor, EVENT_TYPE_OPTIONS } from "@/lib/eventConstants";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useOrganisationMembers } from "@/hooks/useOrganisationMembers";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  User,
  Edit,
  Save,
  X,
  Trash2,
  Crown,
  Shield,
  UserCheck,
  Loader2,
  ChevronRight
} from "lucide-react";

interface EventDetailsPanelProps {
  event: Event | null;
  onEventUpdate?: (updatedEvent: Event) => void;
  onEventDelete?: (eventId: string) => Promise<void>;
  editEvent?: (eventId: string, updates: Partial<Event>) => Promise<Event | null>;
}

export function EventDetailsPanel({ event, onEventUpdate, onEventDelete, editEvent }: EventDetailsPanelProps) {
  const { userProfile } = useUserProfile();
  const { canManageOrganization } = useUserRole();
  const { members, loading: membersLoading, getRoleLabel, getRoleColor } = useOrganisationMembers();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    owners: true,
    staff: true,
    members: true
  });

  if (!event) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Aucun événement sélectionné</h3>
            <p className="text-sm">Cliquez sur un événement dans le calendrier pour voir ses détails</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCreator = userProfile && event.organizer_id === userProfile.id;
  const canEdit = isCreator || canManageOrganization();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const eventTypeColor = getEventTypeColor(event.type);

  const handleEdit = () => {
    setEditedEvent({
      title: event.title,
      description: event.description,
      type: event.type,
      location: event.location,
      max_participants: event.max_participants,
      status: event.status
    });
    setSelectedParticipants(event.participants || []);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEvent({});
    setSelectedParticipants([]);
  };

  const handleSave = async () => {
    if (!event) return;

    setSaving(true);
    try {
      const updatedEventData = {
        ...editedEvent,
        participants: selectedParticipants
      };

      let updatedEvent: Event;

      if (editEvent) {
        const result = await editEvent(event.id, updatedEventData);
        if (!result) throw new Error('Failed to update event');
        updatedEvent = result;
      } else {
        throw new Error('Edit function not provided');
      }

      toast({
        title: "Événement modifié",
        description: "Les modifications ont été sauvegardées avec succès.",
      });
      setIsEditing(false);
      setEditedEvent({});
      setSelectedParticipants([]);
      onEventUpdate?.(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    setDeleting(true);
    try {
      await onEventDelete?.(event.id);
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: eventTypeColor }}
            />
            {isEditing ? "Modifier l'événement" : event.title}
          </CardTitle>
          {canEdit && !isEditing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {isEditing ? (
            // Mode édition
            <>
              {/* Titre */}
              <div>
                <label className="text-sm font-medium mb-1 block">Titre</label>
                <Input
                  value={editedEvent.title || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de l'événement"
                />
              </div>

              {/* Type d'événement */}
              <div>
                <label className="text-sm font-medium mb-1 block">Type d'événement</label>
                <Select
                  value={editedEvent.type || event.type}
                  onValueChange={(value) => setEditedEvent(prev => ({ ...prev, type: value as Event['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lieu */}
              <div>
                <label className="text-sm font-medium mb-1 block">Lieu</label>
                <Input
                  value={editedEvent.location || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Lieu de l'événement"
                />
              </div>

              {/* Nombre maximum de participants */}
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre maximum de participants</label>
                <Input
                  type="number"
                  min="0"
                  value={editedEvent.max_participants || ''}
                  onChange={(e) => setEditedEvent(prev => ({ 
                    ...prev, 
                    max_participants: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Nombre maximum"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={editedEvent.description || ''}
                  onChange={(e) => setEditedEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'événement"
                  rows={3}
                />
              </div>

              {/* Statut */}
              <div>
                <label className="text-sm font-medium mb-1 block">Statut</label>
                <Select
                  value={editedEvent.status || event.status}
                  onValueChange={(value) => setEditedEvent(prev => ({ ...prev, status: value as Event['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planifié</SelectItem>
                    <SelectItem value="ongoing">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gestion des participants */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participants invités
                </label>
                <div className="border rounded-md">
                  {membersLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="ml-2 text-sm text-gray-500">Chargement...</span>
                    </div>
                  ) : members.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Aucun membre trouvé</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {/* Propriétaires */}
                      {members.filter(m => m.user_role === 'organisation').length > 0 && (
                        <div className="border-b">
                          <button
                            type="button"
                            onClick={() => setExpandedSections(prev => ({ ...prev, owners: !prev.owners }))}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-purple-500" />
                              <span className="font-medium text-sm">Propriétaires</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transform transition-transform ${expandedSections.owners ? 'rotate-90' : ''}`} />
                          </button>
                          {expandedSections.owners && (
                            <div className="px-3 pb-2">
                              {members.filter(m => m.user_role === 'organisation').map((member) => (
                                <div key={member.id} className="flex items-center space-x-3 py-1">
                                  <input
                                    type="checkbox"
                                    id={`edit-member-${member.id}`}
                                    checked={selectedParticipants.includes(member.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedParticipants(prev => [...prev, member.id]);
                                      } else {
                                        setSelectedParticipants(prev => prev.filter(id => id !== member.id));
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <label htmlFor={`edit-member-${member.id}`} className="flex-1 text-sm cursor-pointer flex items-center justify-between">
                                    <span>{member.first_name} {member.last_name}</span>
                                    <Badge className={getRoleColor(member.user_role)} variant="secondary">
                                      {getRoleLabel(member.user_role)}
                                    </Badge>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Staff */}
                      {members.filter(m => m.user_role === 'staff').length > 0 && (
                        <div className="border-b">
                          <button
                            type="button"
                            onClick={() => setExpandedSections(prev => ({ ...prev, staff: !prev.staff }))}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-sm">Staff</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transform transition-transform ${expandedSections.staff ? 'rotate-90' : ''}`} />
                          </button>
                          {expandedSections.staff && (
                            <div className="px-3 pb-2">
                              {members.filter(m => m.user_role === 'staff').map((member) => (
                                <div key={member.id} className="flex items-center space-x-3 py-1">
                                  <input
                                    type="checkbox"
                                    id={`edit-member-${member.id}`}
                                    checked={selectedParticipants.includes(member.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedParticipants(prev => [...prev, member.id]);
                                      } else {
                                        setSelectedParticipants(prev => prev.filter(id => id !== member.id));
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <label htmlFor={`edit-member-${member.id}`} className="flex-1 text-sm cursor-pointer flex items-center justify-between">
                                    <span>{member.first_name} {member.last_name}</span>
                                    <Badge className={getRoleColor(member.user_role)} variant="secondary">
                                      {getRoleLabel(member.user_role)}
                                    </Badge>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Adhérents */}
                      {members.filter(m => m.user_role === 'member').length > 0 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setExpandedSections(prev => ({ ...prev, members: !prev.members }))}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-sm">Adhérents</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transform transition-transform ${expandedSections.members ? 'rotate-90' : ''}`} />
                          </button>
                          {expandedSections.members && (
                            <div className="px-3 pb-2">
                              {members.filter(m => m.user_role === 'member').map((member) => (
                                <div key={member.id} className="flex items-center space-x-3 py-1">
                                  <input
                                    type="checkbox"
                                    id={`edit-member-${member.id}`}
                                    checked={selectedParticipants.includes(member.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedParticipants(prev => [...prev, member.id]);
                                      } else {
                                        setSelectedParticipants(prev => prev.filter(id => id !== member.id));
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <label htmlFor={`edit-member-${member.id}`} className="flex-1 text-sm cursor-pointer flex items-center justify-between">
                                    <span>{member.first_name} {member.last_name}</span>
                                    <Badge className={getRoleColor(member.user_role)} variant="secondary">
                                      {getRoleLabel(member.user_role)}
                                    </Badge>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedParticipants.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      {selectedParticipants.length} participant{selectedParticipants.length > 1 ? 's' : ''} sélectionné{selectedParticipants.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Mode lecture
            <>
              {/* Type d'événement */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <Badge 
                  variant="secondary" 
                  style={{ 
                    backgroundColor: eventTypeColor + '20', 
                    color: eventTypeColor,
                    border: `1px solid ${eventTypeColor}30`
                  }}
                >
                  {getEventTypeLabel(event.type)}
                </Badge>
              </div>

              {/* Date et heure */}
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">
                    {format(startDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </div>
                  <div className="text-gray-600 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {format(startDate, 'HH:mm', { locale: fr })} - {format(endDate, 'HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>

              {/* Lieu */}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{event.location}</span>
                </div>
              )}

              {/* Participants */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {event.participants.length}
                    {event.max_participants && ` / ${event.max_participants}`} participants
                  </span>
                </div>
                {event.participants.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {event.participants.map((participantId) => {
                      const participant = members.find(m => m.id === participantId);
                      if (!participant) return null;
                      return (
                        <div key={participantId} className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            {participant.user_role === 'organisation' && <Crown className="w-3 h-3 text-purple-500" />}
                            {participant.user_role === 'staff' && <Shield className="w-3 h-3 text-blue-500" />}
                            {participant.user_role === 'member' && <UserCheck className="w-3 h-3 text-green-500" />}
                            <span>{participant.first_name} {participant.last_name}</span>
                          </div>
                          <Badge className={`${getRoleColor(participant.user_role)} text-xs`} variant="secondary">
                            {getRoleLabel(participant.user_role)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Organisateur */}
              {event.organizer_id && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Organisé par l'équipe</span>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Statut */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Statut: <span className="font-medium capitalize">{event.status}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Boutons d'action en mode édition */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}