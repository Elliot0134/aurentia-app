import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Event, EventFormData } from "@/hooks/useEvents";
import { useOrganisationMembers } from "@/hooks/useOrganisationMembers";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventConstants";
import { Loader2, Users, Crown, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisationId: string;
  selectedRange?: { start: Date; end: Date } | null;
  onCreateEvent: (eventData: EventFormData) => Promise<boolean>;
}

export function EventCreationModal({
  open,
  onOpenChange,
  organisationId,
  selectedRange,
  onCreateEvent
}: EventCreationModalProps) {
  const { members, loading: membersLoading, getRoleLabel, getRoleColor } = useOrganisationMembers();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    owners: true,
    staff: true,
    members: true
  });

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: selectedRange ? selectedRange.start.toISOString().slice(0, 16) : '',
    end_date: selectedRange ? selectedRange.end.toISOString().slice(0, 16) : '',
    type: 'other',
    location: '',
    organizer_id: '',
    is_recurring: false,
    max_participants: undefined,
    organization_id: organisationId
  });

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.start_date || !formData.end_date) return;

    // Ajouter les participants sélectionnés aux données de l'événement
    const eventDataWithParticipants = {
      ...formData,
      participants: selectedMembers
    };

    const success = await onCreateEvent(eventDataWithParticipants);

    if (success) {
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
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
    setSelectedMembers([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouvel événement</DialogTitle>
          <DialogDescription>
            {selectedRange
              ? `Planifiez un événement pour la période sélectionnée: ${selectedRange.start.toLocaleDateString('fr-FR')} ${selectedRange.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${selectedRange.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Planifiez un événement pour votre organisation.'
            }
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

          {/* Sélection des membres */}
          <div className="md:col-span-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Inviter les participants
            </Label>
            <div className="mt-2 border rounded-md">
              {membersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Chargement des membres...</span>
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Aucun membre trouvé</p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
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
                          <Badge variant="secondary" className="text-xs">
                            {members.filter(m => m.user_role === 'organisation').length}
                          </Badge>
                        </div>
                        <div className={`transform transition-transform ${expandedSections.owners ? 'rotate-90' : ''}`}>
                          ▶
                        </div>
                      </button>
                      {expandedSections.owners && (
                        <div className="px-3 pb-2">
                          {members.filter(m => m.user_role === 'organisation').map((member) => (
                            <div key={member.id} className="flex items-center space-x-3 py-2">
                              <input
                                type="checkbox"
                                id={`member-${member.id}`}
                                checked={selectedMembers.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMembers(prev => [...prev, member.id]);
                                  } else {
                                    setSelectedMembers(prev => prev.filter(id => id !== member.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={`member-${member.id}`} className="flex-1 text-sm cursor-pointer flex items-center justify-between">
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
                          <Badge variant="secondary" className="text-xs">
                            {members.filter(m => m.user_role === 'staff').length}
                          </Badge>
                        </div>
                        <div className={`transform transition-transform ${expandedSections.staff ? 'rotate-90' : ''}`}>
                          ▶
                        </div>
                      </button>
                      {expandedSections.staff && (
                        <div className="px-3 pb-2">
                          {members.filter(m => m.user_role === 'staff').map((member) => (
                            <div key={member.id} className="flex items-center space-x-3 py-2">
                              <input
                                type="checkbox"
                                id={`member-${member.id}`}
                                checked={selectedMembers.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMembers(prev => [...prev, member.id]);
                                  } else {
                                    setSelectedMembers(prev => prev.filter(id => id !== member.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={`member-${member.id}`} className="flex-1 text-sm cursor-pointer flex items-center justify-between">
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
                          <User className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-sm">Adhérents</span>
                          <Badge variant="secondary" className="text-xs">
                            {members.filter(m => m.user_role === 'member').length}
                          </Badge>
                        </div>
                        <div className={`transform transition-transform ${expandedSections.members ? 'rotate-90' : ''}`}>
                          ▶
                        </div>
                      </button>
                      {expandedSections.members && (
                        <div className="px-3 pb-2">
                          {members.filter(m => m.user_role === 'member').map((member) => (
                            <div key={member.id} className="flex items-center space-x-3 py-2">
                              <input
                                type="checkbox"
                                id={`member-${member.id}`}
                                checked={selectedMembers.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMembers(prev => [...prev, member.id]);
                                  } else {
                                    setSelectedMembers(prev => prev.filter(id => id !== member.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={`member-${member.id}`} className="flex-1 text-sm cursor-pointer flex items-center justify-between">
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
            {selectedMembers.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">
                  {selectedMembers.length} participant{selectedMembers.length > 1 ? 's' : ''} sélectionné{selectedMembers.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
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
  );
}