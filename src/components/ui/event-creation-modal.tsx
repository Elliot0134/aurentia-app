import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Event, EventFormData } from "@/hooks/useEvents";
import { useOrganisationMembers } from "@/hooks/useOrganisationMembers";
import { useMentors } from "@/hooks/useOrganisationData";
import { useUserProfile } from "@/hooks/useUserProfile";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventConstants";
import { Loader2, Users, Crown, Shield, User, Search, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimePicker } from "@/components/ui/time-picker";
import { formatDateForDatetimeLocal, convertDatetimeLocalToISO, extractDateFromDatetimeLocal, extractTimeFromDatetimeLocal, combineDateAndTime } from "@/utils/dateTimeUtils";

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
  const { mentors, loading: mentorsLoading } = useMentors();
  const { userProfile } = useUserProfile();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [willAttend, setWillAttend] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState({
    owners: true,
    staff: true,
    members: true,
    mentors: true
  });

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    type: 'other',
    location: '',
    meet_link: '',
    organizer_id: '',
    is_recurring: false,
    max_participants: undefined,
    organization_id: organisationId
  });

  // Split date/time state for better UX with French format
  const [splitDateTime, setSplitDateTime] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });

  // Update form dates when selectedRange changes (calendar drag)
  useEffect(() => {
    if (selectedRange && open) {
      // Use formatDateForDatetimeLocal to preserve local timezone
      // This prevents the bug where dragging 10:30 AM shows as 8:30 AM
      const startDatetimeLocal = formatDateForDatetimeLocal(selectedRange.start);
      const endDatetimeLocal = formatDateForDatetimeLocal(selectedRange.end);

      setFormData(prev => ({
        ...prev,
        start_date: startDatetimeLocal,
        end_date: endDatetimeLocal
      }));

      // Also populate split date/time for the UI
      setSplitDateTime({
        startDate: extractDateFromDatetimeLocal(startDatetimeLocal),
        startTime: extractTimeFromDatetimeLocal(startDatetimeLocal),
        endDate: extractDateFromDatetimeLocal(endDatetimeLocal),
        endTime: extractTimeFromDatetimeLocal(endDatetimeLocal)
      });
    }
  }, [selectedRange, open]);

  const handleCreateEvent = async () => {
    // Combine split date/time inputs before validation
    const combinedStartDate = combineDateAndTime(splitDateTime.startDate, splitDateTime.startTime);
    const combinedEndDate = combineDateAndTime(splitDateTime.endDate, splitDateTime.endTime);

    if (!formData.title.trim() || !combinedStartDate || !combinedEndDate) return;

    // Ajouter les participants sélectionnés aux données de l'événement
    // Si willAttend est true et que l'utilisateur n'est pas déjà dans la liste, l'ajouter
    const participants = [...selectedMembers];
    if (willAttend && userProfile?.id && !participants.includes(userProfile.id)) {
      participants.push(userProfile.id);
    }

    // Convert datetime-local strings to ISO format for database storage
    const eventDataWithParticipants = {
      ...formData,
      participants,
      start_date: convertDatetimeLocalToISO(combinedStartDate),
      end_date: convertDatetimeLocalToISO(combinedEndDate)
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
      meet_link: '',
      organizer_id: '',
      is_recurring: false,
      max_participants: undefined,
      organization_id: organisationId
    });
    setSplitDateTime({
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: ''
    });
    setSelectedMembers([]);
    setWillAttend(false);
    setSearchQuery('');
  };

  // Filter function for search
  const filterBySearch = (item: { first_name?: string; last_name?: string; email: string; id: string }) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const firstName = (item.first_name || '').toLowerCase();
    const lastName = (item.last_name || '').toLowerCase();
    const email = (item.email || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();

    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      fullName.includes(query) ||
      email.includes(query)
    );
  };

  // Apply search filter to members and mentors
  const filteredMembers = members.filter(m => m.id !== userProfile?.id && filterBySearch(m));
  const filteredMentors = mentors.filter(m => m.user_id !== userProfile?.id && filterBySearch({ ...m, id: m.user_id }));

  // Filter by role
  const filteredOwners = filteredMembers.filter(m => m.user_role === 'organisation');
  const filteredStaff = filteredMembers.filter(m => m.user_role === 'staff');
  const filteredAdherents = filteredMembers.filter(m => m.user_role === 'member');

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
            <Label htmlFor="start_date">Date de début (JJ/MM/AAAA) *</Label>
            <Input
              id="start_date"
              type="date"
              value={splitDateTime.startDate}
              onChange={(e) => setSplitDateTime(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="13/10/2025"
              lang="fr-FR"
            />
          </div>

          <div>
            <Label htmlFor="start_time">Heure de début (24h) *</Label>
            <TimePicker
              value={splitDateTime.startTime}
              onChange={(time) => setSplitDateTime(prev => ({ ...prev, startTime: time }))}
              placeholder="Sélectionner l'heure"
            />
          </div>

          <div>
            <Label htmlFor="end_date">Date de fin (JJ/MM/AAAA) *</Label>
            <Input
              id="end_date"
              type="date"
              value={splitDateTime.endDate}
              onChange={(e) => setSplitDateTime(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder="13/10/2025"
              lang="fr-FR"
            />
          </div>

          <div>
            <Label htmlFor="end_time">Heure de fin (24h) *</Label>
            <TimePicker
              value={splitDateTime.endTime}
              onChange={(time) => setSplitDateTime(prev => ({ ...prev, endTime: time }))}
              placeholder="Sélectionner l'heure"
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
            <Label htmlFor="meet_link">Lien de réunion</Label>
            <Input
              id="meet_link"
              type="url"
              placeholder="Ex: https://meet.google.com/abc-defg-hij"
              value={formData.meet_link}
              onChange={(e) => setFormData(prev => ({ ...prev, meet_link: e.target.value }))}
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
                const value = e.target.value;
                // Only allow numbers (including empty string for clearing)
                if (value === '' || /^\d+$/.test(value)) {
                  const numValue = value ? parseInt(value) : undefined;
                  if (numValue === undefined || numValue >= 0) {
                    setFormData(prev => ({ ...prev, max_participants: numValue }));
                  }
                }
              }}
              onKeyDown={(e) => {
                // Prevent non-numeric characters (except backspace, delete, arrow keys, etc.)
                if (
                  e.key !== 'Backspace' &&
                  e.key !== 'Delete' &&
                  e.key !== 'ArrowLeft' &&
                  e.key !== 'ArrowRight' &&
                  e.key !== 'Tab' &&
                  !/^\d$/.test(e.key)
                ) {
                  e.preventDefault();
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

            {/* Checkbox pour auto-participation */}
            <div className="flex items-center space-x-2 mt-2 mb-3 p-3 bg-gray-50 rounded-md">
              <Checkbox
                id="will-attend"
                checked={willAttend}
                onCheckedChange={(checked) => setWillAttend(checked === true)}
              />
              <label
                htmlFor="will-attend"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Je ferais partie de l'événement
              </label>
            </div>

            {/* Search bar */}
            <div className="relative mt-2 mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="mt-2 border rounded-md">
              {membersLoading || mentorsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Chargement des membres...</span>
                </div>
              ) : members.length === 0 && mentors.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Aucun membre à inviter</p>
              ) : filteredOwners.length === 0 && filteredStaff.length === 0 && filteredAdherents.length === 0 && filteredMentors.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  {searchQuery.trim() ? `Aucun résultat pour "${searchQuery}"` : 'Aucun membre à inviter'}
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {/* Propriétaires */}
                  {filteredOwners.length > 0 && (
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
                            {filteredOwners.length}
                          </Badge>
                        </div>
                        <div className={`transform transition-transform ${expandedSections.owners ? 'rotate-90' : ''}`}>
                          ▶
                        </div>
                      </button>
                      {expandedSections.owners && (
                        <div className="px-3 pb-2">
                          {filteredOwners.map((member) => (
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
                  {filteredStaff.length > 0 && (
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
                            {filteredStaff.length}
                          </Badge>
                        </div>
                        <div className={`transform transition-transform ${expandedSections.staff ? 'rotate-90' : ''}`}>
                          ▶
                        </div>
                      </button>
                      {expandedSections.staff && (
                        <div className="px-3 pb-2">
                          {filteredStaff.map((member) => (
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
                  {filteredAdherents.length > 0 && (
                    <div className="border-b">
                      <button
                        type="button"
                        onClick={() => setExpandedSections(prev => ({ ...prev, members: !prev.members }))}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-sm">Adhérents</span>
                          <Badge variant="secondary" className="text-xs">
                            {filteredAdherents.length}
                          </Badge>
                        </div>
                        <div className={`transform transition-transform ${expandedSections.members ? 'rotate-90' : ''}`}>
                          ▶
                        </div>
                      </button>
                      {expandedSections.members && (
                        <div className="px-3 pb-2">
                          {filteredAdherents.map((member) => (
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

                  {/* Mentors */}
                  {filteredMentors.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedSections(prev => ({ ...prev, mentors: !prev.mentors }))}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-sm">Mentors</span>
                          <Badge variant="secondary" className="text-xs">
                            {filteredMentors.length}
                          </Badge>
                        </div>
                        <div className={`transform transition-transform ${expandedSections.mentors ? 'rotate-90' : ''}`}>
                          ▶
                        </div>
                      </button>
                      {expandedSections.mentors && (
                        <div className="px-3 pb-2">
                          {filteredMentors.map((mentor) => (
                            <div key={mentor.user_id} className="flex items-center space-x-3 py-2">
                              <input
                                type="checkbox"
                                id={`mentor-${mentor.user_id}`}
                                checked={selectedMembers.includes(mentor.user_id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMembers(prev => [...prev, mentor.user_id]);
                                  } else {
                                    setSelectedMembers(prev => prev.filter(id => id !== mentor.user_id));
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={`mentor-${mentor.user_id}`} className="flex-1 text-sm cursor-pointer flex items-center justify-between">
                                <span>{mentor.first_name} {mentor.last_name}</span>
                                <Badge className="bg-orange-100 text-orange-800" variant="secondary">
                                  Mentor
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
            className="btn-white-label hover:opacity-90"
            onClick={handleCreateEvent}
            disabled={!formData.title.trim() || !splitDateTime.startDate || !splitDateTime.startTime || !splitDateTime.endDate || !splitDateTime.endTime}
          >
            Créer l'événement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}