import { useState } from "react";
import { useInvitationCodes } from '@/hooks/useOrganisationData';
import { OrganisationPageLayout } from '@/components/organisation/OrganisationLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { InvitationCode } from '@/types/organisationTypes';
import {
  Mail,
  Link,
  Copy,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Send,
  Plus
} from "lucide-react";

interface CreateInvitationForm {
  role: 'entrepreneur' | 'mentor';
  email?: string;
  maxUses?: number;
}

interface Invitation {
  id: string;
  code: string;
  email?: string;
  type: 'email' | 'link';
  role: 'entrepreneur' | 'mentor' | 'observer';
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string;
  createdBy: string;
  maxUses: number;
  currentUses: number;
}

const OrganisationInvitations = () => {
  const { codes, loading, generateCode } = useInvitationCodes();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invitationType, setInvitationType] = useState<'email' | 'link'>('email');

  // Dynamic form defaults based on invitation type
  const getFormDefaults = (type: 'email' | 'link'): CreateInvitationForm => ({
    role: 'entrepreneur',
    email: type === 'email' ? '' : undefined,
    maxUses: type === 'link' ? 5 : 1
  });

  const [formData, setFormData] = useState<CreateInvitationForm>(getFormDefaults('email'));

  // Adapter les codes d'invitation aux types UI
  const invitations: Invitation[] = codes.map(code => ({
    id: code.id,
    code: code.code,
    type: 'link', // Pour l'instant, tous les codes sont des liens
    role: code.role,
    status: code.is_active ? 'pending' : 'expired',
    createdAt: new Date(code.created_at),
    expiresAt: code.expires_at ? new Date(code.expires_at) : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
    createdBy: 'Admin',
    maxUses: code.max_uses || 1,
    currentUses: code.current_uses
  }));

  const generateInvitationCode = () => {
    return 'INV-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  // Handle invitation type change with form reset
  const handleInvitationTypeChange = (type: 'email' | 'link') => {
    setInvitationType(type);
    setFormData(getFormDefaults(type));
  };

  // Reset form when dialog opens
  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      setFormData(getFormDefaults(invitationType));
    }
  };

  const handleCreateInvitation = async (formData: CreateInvitationForm) => {
    try {
      const newCode = await generateCode({
        code: generateInvitationCode(),
        role: formData.role,
        created_by: '', // Will be set by the hook with actual user ID
        expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
        max_uses: invitationType === 'link' ? (formData.maxUses || 5) : 1,
        is_active: true
      });

      if (newCode) {
        setDialogOpen(false);
        
        toast({
          title: "Code d'invitation créé",
          description: "Le code d'invitation a été généré avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du code d'invitation.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des invitations...</p>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le code a été copié dans le presse-papiers.",
    });
  };

  const getStatusColor = (status: Invitation['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Invitation['status']) => {
    const labels = {
      pending: 'En attente',
      accepted: 'Acceptée',
      expired: 'Expirée',
      revoked: 'Révoquée'
    };
    return labels[status];
  };

  const getRoleLabel = (role: Invitation['role']) => {
    const labels = {
      entrepreneur: 'Entrepreneur',
      mentor: 'Mentor',
      observer: 'Observateur'
    };
    return labels[role];
  };

  const filteredInvitations = invitations.filter(invitation => {
    if (activeTab === 'all') return true;
    return invitation.status === activeTab;
  });

  const stats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired').length
  };

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invitations</h1>
              <p className="text-gray-600 text-base">
                Gérez les invitations pour rejoindre votre organisation.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une invitation
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
                    <label className="text-sm font-medium mb-2 block">Type d'invitation</label>
                    <Select value={invitationType} onValueChange={handleInvitationTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Invitation par email</SelectItem>
                        <SelectItem value="link">Lien d'invitation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {invitationType === 'email' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input 
                        placeholder="email@exemple.com" 
                        value={formData.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rôle</label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: 'entrepreneur' | 'mentor') => setFormData(prev => ({ ...prev, role: value }))}
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

                  {invitationType === 'link' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nombre max d'utilisations</label>
                      <Input 
                        type="number" 
                        value={formData.maxUses || 5} 
                        onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
                        min="1" 
                        max="100" 
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    style={{ backgroundColor: '#ff5932' }} 
                    className="hover:opacity-90 text-white"
                    onClick={() => handleCreateInvitation(formData)}
                  >
                    Créer l'invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expirées</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expired}</div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets et liste des invitations */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
                <TabsTrigger value="accepted">Acceptées ({stats.accepted})</TabsTrigger>
                <TabsTrigger value="expired">Expirées ({stats.expired})</TabsTrigger>
                <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {filteredInvitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune invitation</h3>
                    <p className="text-gray-600">
                      Aucune invitation ne correspond à ce statut.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInvitations.map((invitation) => (
                      <Card key={invitation.id} className="border-l-4 border-l-aurentia-pink">
                        <CardContent className="pt-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {invitation.type === 'email' ? (
                                    <Mail className="w-4 h-4 text-aurentia-pink" />
                                  ) : (
                                    <Link className="w-4 h-4 text-aurentia-pink" />
                                  )}
                                  <span className="font-medium font-mono">{invitation.code}</span>
                                </div>
                                <Badge className={getStatusColor(invitation.status)}>
                                  {getStatusLabel(invitation.status)}
                                </Badge>
                                <Badge variant="outline">
                                  {getRoleLabel(invitation.role)}
                                </Badge>
                              </div>

                              {invitation.email && (
                                <p className="text-sm text-gray-600">
                                  Destinataire: {invitation.email}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span>Créée le {invitation.createdAt.toLocaleDateString('fr-FR')}</span>
                                <span>Expire le {invitation.expiresAt.toLocaleDateString('fr-FR')}</span>
                                {invitation.type === 'link' && (
                                  <span>Utilisations: {invitation.currentUses}/{invitation.maxUses}</span>
                                )}
                                {invitation.usedAt && (
                                  <span>Utilisée le {invitation.usedAt.toLocaleDateString('fr-FR')}</span>
                                )}
                                {invitation.usedBy && (
                                  <span>par {invitation.usedBy}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {invitation.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(invitation.code)}
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copier le code
                                  </Button>
                                  
                                  {invitation.type === 'email' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Renvoyer
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganisationInvitations;