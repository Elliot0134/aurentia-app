import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { useInvitationCodes } from '@/hooks/useOrganisationData';
import { OrganisationPageLayout } from '@/components/organisation/OrganisationLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import CustomTabs from "@/components/ui/CustomTabs";
import { useToast } from "@/hooks/use-toast";
import { InvitationCode } from '@/types/organisationTypes';
import { getInvitationStatusColor, getInvitationStatusLabel, getInvitationRoleLabel, INVITATION_ROLE_OPTIONS } from "@/lib/invitationConstants";
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
  useOrgPageTitle("Invitations");
  const { codes, loading, generateCode } = useInvitationCodes();
  const { toast } = useToast();

  // Get tab from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['all', 'pending', 'accepted', 'expired'];
  const tabFromUrl = searchParams.get('tab') || 'pending';
  const activeTab = validTabs.includes(tabFromUrl) ? tabFromUrl : 'pending';

  // Function to update tab and URL
  const setActiveTab = (tab: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (tab && tab !== 'pending') {
      newParams.set('tab', tab);
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams);
  };

  // Modal state from URL params
  const dialogOpen = searchParams.get('modal') === 'create';
  const setDialogOpen = (open: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (open) {
      newParams.set('modal', 'create');
    } else {
      newParams.delete('modal');
    }
    setSearchParams(newParams);
  };

  const [createdCode, setCreatedCode] = useState<string>('');
  const [createdEmail, setCreatedEmail] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  // Dynamic form defaults based on invitation type
  const getFormDefaults = (): CreateInvitationForm => ({
    role: 'entrepreneur',
    email: ''
  });

  const [formData, setFormData] = useState<CreateInvitationForm>(getFormDefaults());

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

  // Reset form when dialog opens
  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      setFormData(getFormDefaults());
      setCreatedCode('');
      setCreatedEmail('');
    }
  };

  const handleCreateInvitation = async (formData: CreateInvitationForm) => {
    setIsCreating(true);
    try {
      const newCode = await generateCode({
        code: generateInvitationCode(),
        role: formData.role,
        created_by: '', // Will be set by the hook with actual user ID
        expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
        max_uses: 1,
        is_active: true
      });

      if (newCode) {
        setCreatedCode(newCode.code);
        setCreatedEmail(formData.email || '');
        // Don't close the dialog, just show the code
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du code d'invitation.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-orange mx-auto mb-4"></div>
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
    return getInvitationStatusColor(status);
  };

  const getStatusLabel = (status: Invitation['status']) => {
    return getInvitationStatusLabel(status);
  };

  const getRoleLabel = (role: Invitation['role']) => {
    return getInvitationRoleLabel(role);
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
    <>
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
                <Button className="btn-white-label hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une invitation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {createdCode ? 'Code d\'invitation créé' : 'Créer une invitation'}
                  </DialogTitle>
                  <DialogDescription>
                    {createdCode 
                      ? (createdEmail ? `Le code d'invitation a été généré avec succès. Il sera envoyé à ${createdEmail} une fois la fonctionnalité d'email implémentée.` : 'Le code d\'invitation a été généré avec succès.')
                      : 'Invitez de nouveaux membres à rejoindre votre organisation.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                {createdCode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Code d'invitation</label>
                      <div className="flex gap-2">
                        <Input 
                          value={createdCode}
                          readOnly
                          className="font-mono text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(createdCode)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input 
                        placeholder="email@exemple.com" 
                        value={formData.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

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
                          {INVITATION_ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {createdCode ? (
                    <Button 
                      className="btn-white-label hover:opacity-90"
                      onClick={() => {
                        setDialogOpen(false);
                        setCreatedCode('');
                        setCreatedEmail('');
                      }}
                    >
                      Fermer
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button 
                        className="btn-white-label hover:opacity-90"
                        onClick={() => handleCreateInvitation(formData)}
                        disabled={isCreating}
                      >
                        {isCreating ? 'Création...' : 'Créer l\'invitation'}
                      </Button>
                    </>
                  )}
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
            <CustomTabs
              tabs={[
                { key: "all", label: `Toutes (${stats.total})`, icon: Mail },
                { key: "pending", label: `En attente (${stats.pending})`, icon: Clock },
                { key: "accepted", label: `Acceptées (${stats.accepted})`, icon: CheckCircle },
                { key: "expired", label: `Expirées (${stats.expired})`, icon: XCircle }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
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
            </CustomTabs>
          </CardContent>
        </Card>
      </>
    );
  };

export default OrganisationInvitations;