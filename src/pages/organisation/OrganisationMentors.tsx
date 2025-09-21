import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMentors, useInvitationCodes } from '@/hooks/useOrganisationData';
import type { Mentor, InvitationCode } from '@/types/organisationTypes';
import {
  Users,
  Plus,
  Copy,
  QrCode,
  Mail,
  Calendar,
  Shield,
  UserPlus,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  RotateCcw
} from "lucide-react";

const OrganisationMentors = () => {
  const { id: organisationId } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});
  
  const [codeForm, setCodeForm] = useState({
    type: 'incubator_member',
    maxUses: '1',
    expirationDays: '30',
    description: ''
  });

  const [mentorForm, setMentorForm] = useState({
    name: '',
    email: '',
    role: 'mentor',
    expertise: '',
    message: ''
  });

  // Utiliser les données Supabase
  const { mentors, loading: mentorsLoading } = useMentors();
  const { codes: invitationCodes, loading: codesLoading } = useInvitationCodes();

  const getCodeTypeLabel = (role: string) => {
    return role === 'mentor' ? 'Mentor' : 'Entrepreneur';
  };

  const getCodeTypeColor = (role: string) => {
    return role === 'mentor' ? 'destructive' : 'default';
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateCode = () => {
    if (!codeForm.maxUses || parseInt(codeForm.maxUses) < 1) {
      toast.error("Le nombre d'utilisations doit être supérieur à 0");
      return;
    }

    // TODO: Implémenter la création de code avec Supabase
    toast.success("Code d'invitation créé avec succès");
    setDialogOpen(false);
    setCodeForm({
      type: 'incubator_member',
      maxUses: '1',
      expirationDays: '30',
      description: ''
    });
  };

  const handleInviteMentor = () => {
    if (!mentorForm.name || !mentorForm.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // TODO: Implémenter l'invitation de mentor avec Supabase
    toast.success(`Invitation envoyée à ${mentorForm.email}`);
    setMentorDialogOpen(false);
    setMentorForm({
      name: '',
      email: '',
      role: 'mentor',
      expertise: '',
      message: ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copié dans le presse-papiers");
  };

  const toggleCodeVisibility = (codeId: string) => {
    setShowCodes(prev => ({
      ...prev,
      [codeId]: !prev[codeId]
    }));
  };

  const deactivateCode = (codeId: string) => {
    // TODO: Implémenter la désactivation avec Supabase
    toast.success("Code désactivé");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      active: 'Actif',
      pending: 'En attente',
      inactive: 'Inactif'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-blue-100 text-blue-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (mentorsLoading || codesLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des mentors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mentors & Invitations</h1>
              <p className="text-gray-600 text-base">
                Gérez les mentors et les codes d'invitation de votre organisation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Inviter un mentor
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Code d'invitation
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistiques avec données Supabase */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentors Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mentors.filter(m => m.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Codes Actifs</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invitationCodes.filter(c => c.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invitations Utilisées</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invitationCodes.reduce((sum, code) => sum + code.current_uses, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentors Inactifs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mentors.filter(m => m.status === 'inactive').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Mentors de l'organisation
            </CardTitle>
            <CardDescription>
              Liste des mentors et administrateurs de votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold">
                      {`${mentor.first_name} ${mentor.last_name}`.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{mentor.first_name} {mentor.last_name}</h3>
                        {getStatusBadge(mentor.status)}
                      </div>
                      <p className="text-sm text-gray-600">{mentor.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mentor.expertise.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{mentor.total_entrepreneurs} entrepreneurs</div>
                    <div className="text-xs text-gray-500">
                      Rejoint le {new Date(mentor.joined_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Codes d'invitation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Codes d'invitation
            </CardTitle>
            <CardDescription>
              Gérez les codes d'invitation pour votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitationCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getCodeTypeColor(code.role)}>
                          {getCodeTypeLabel(code.role)}
                        </Badge>
                        {code.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {showCodes[code.id] ? code.code : '••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCodeVisibility(code.id)}
                        >
                          {showCodes[code.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {code.current_uses} / {code.max_uses || '∞'} utilisations
                    </div>
                    <div className="text-xs text-gray-500">
                      {code.expires_at ? `Expire le ${new Date(code.expires_at).toLocaleDateString('fr-FR')}` : 'Pas d\'expiration'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Créé le {new Date(code.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    {code.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deactivateCode(code.id)}
                        className="mt-1 text-red-600 hover:text-red-700"
                      >
                        Désactiver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dialog création de code */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un code d'invitation</DialogTitle>
              <DialogDescription>
                Générez un nouveau code d'invitation pour votre organisation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Type de compte</Label>
                <Select value={codeForm.type} onValueChange={(value) => setCodeForm({...codeForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incubator_member">Membre/Mentor</SelectItem>
                    <SelectItem value="incubator_main_admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUses">Nombre d'utilisations</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={codeForm.maxUses}
                    onChange={(e) => setCodeForm({...codeForm, maxUses: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDays">Expiration (jours)</Label>
                  <Input
                    id="expirationDays"
                    type="number"
                    min="1"
                    value={codeForm.expirationDays}
                    onChange={(e) => setCodeForm({...codeForm, expirationDays: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={codeForm.description}
                  onChange={(e) => setCodeForm({...codeForm, description: e.target.value})}
                  placeholder="Notes sur ce code d'invitation..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateCode} style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                Créer le code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog invitation mentor */}
        <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Inviter un mentor</DialogTitle>
              <DialogDescription>
                Envoyez une invitation par email à un nouveau mentor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mentorName">Nom complet *</Label>
                <Input
                  id="mentorName"
                  value={mentorForm.name}
                  onChange={(e) => setMentorForm({...mentorForm, name: e.target.value})}
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <Label htmlFor="mentorEmail">Email *</Label>
                <Input
                  id="mentorEmail"
                  type="email"
                  value={mentorForm.email}
                  onChange={(e) => setMentorForm({...mentorForm, email: e.target.value})}
                  placeholder="jean.dupont@example.com"
                />
              </div>

              <div>
                <Label htmlFor="mentorRole">Rôle</Label>
                <Select value={mentorForm.role} onValueChange={(value) => setMentorForm({...mentorForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mentorExpertise">Domaines d'expertise</Label>
                <Input
                  id="mentorExpertise"
                  value={mentorForm.expertise}
                  onChange={(e) => setMentorForm({...mentorForm, expertise: e.target.value})}
                  placeholder="Ex: Marketing, Tech, Finance (séparés par des virgules)"
                />
              </div>

              <div>
                <Label htmlFor="mentorMessage">Message personnel (optionnel)</Label>
                <Textarea
                  id="mentorMessage"
                  value={mentorForm.message}
                  onChange={(e) => setMentorForm({...mentorForm, message: e.target.value})}
                  placeholder="Message d'accompagnement pour l'invitation..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMentorDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleInviteMentor} style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                <Mail className="w-4 h-4 mr-2" />
                Envoyer l'invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrganisationMentors;