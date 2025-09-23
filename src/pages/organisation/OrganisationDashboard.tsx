import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganisationData, useOrganisationStats, useInvitationCodes } from '@/hooks/useOrganisationData';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarWithEvents } from "@/components/ui/calendar-with-events";
import { EventCreationModal } from "@/components/ui/event-creation-modal";
import { useEvents, EventFormData } from "@/hooks/useEvents";
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
  Clock
} from "lucide-react";

const OrganisationDashboard = () => {
  const navigate = useNavigate();
  const { organisation, loading: orgLoading } = useOrganisationData();
  const { stats, loading: statsLoading } = useOrganisationStats();
  const { codes: invitationCodes, loading: codesLoading, generateCode } = useInvitationCodes();
  const { events, addEvent } = useEvents(organisation?.id || '');
  const { toast } = useToast();

  const [eventModalOpen, setEventModalOpen] = useState(false);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement du dashboard...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
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

        {/* Calendrier des événements */}
        <div className="mb-8">
          <div className="flex gap-6">
            {/* Calendar Card - 75% */}
            <Card className="flex-[3]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-aurentia-pink" />
                  Calendrier des Événements
                </CardTitle>
                <CardDescription>
                  Consultez les événements planifiés pour votre organisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  {/* Calendar on the left */}
                  <div className="flex-1">
                    <CalendarWithEvents 
                      onAddEvent={handleAddEvent} 
                      events={events.map(event => ({
                        title: event.title,
                        from: event.start_date,
                        to: event.end_date
                      }))} 
                    />
                  </div>
                  {/* Event details placeholder on the right */}
                  <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Cliquez sur un événement pour afficher les détails
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invitations Card - 25% */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-aurentia-pink" />
                    Invitations récentes
                  </CardTitle>
                  <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white h-7 px-2">
                        <Plus className="w-3 h-3 mr-1" />
                        Créer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
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
                              <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                              <SelectItem value="mentor">Mentor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setInvitationDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button
                          onClick={handleCreateInvitation}
                          style={{ backgroundColor: '#ff5932' }}
                          className="hover:opacity-90 text-white"
                        >
                          Créer l'invitation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {codesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-aurentia-pink mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">Chargement...</p>
                  </div>
                ) : invitationCodes.length === 0 ? (
                  <div className="text-center py-6">
                    <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Aucune invitation</p>
                    <p className="text-xs text-gray-500">Créez votre première invitation</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {invitationCodes.slice(0, 5).map((code) => (
                      <div key={code.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-medium text-gray-900 truncate">
                              {code.code}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              code.role === 'entrepreneur'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {code.role === 'entrepreneur' ? 'Ent.' : 'Ment.'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            {new Date(code.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(code.code);
                            toast({
                              title: "Copié",
                              description: "Le code a été copié dans le presse-papiers.",
                            });
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {invitationCodes.length > 5 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-xs text-aurentia-pink hover:text-aurentia-pink/80"
                          onClick={() => navigate('/organisation/invitations')}
                        >
                          Voir toutes les invitations ({invitationCodes.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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
            <div className="space-y-4">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Activité en temps réel
                </h3>
                <p className="text-gray-600 mb-4">
                  Les activités récentes de votre organisation s'afficheront ici.
                </p>
                <p className="text-sm text-gray-500">
                  Les nouvelles inscriptions, projets complétés et autres actions importantes seront listées automatiquement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EventCreationModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        organisationId={organisation?.id || ''}
        selectedRange={selectedRange}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
};

export default OrganisationDashboard;