import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Event, EventFormData } from "@/hooks/useEvents";
import { useAdherents } from "@/hooks/useOrganisationData";
import { Loader2 } from "lucide-react";

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
  const { adherents, loading: adherentsLoading } = useAdherents();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

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

    const success = await onCreateEvent(formData);

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