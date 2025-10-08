import { useState, useEffect, KeyboardEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  Users, 
  LogOut,
  Save,
  Linkedin,
  X,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";

interface MentorProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  linkedin_url: string;
  expertise: string[];
  status: string;
  total_entrepreneurs: number;
  success_rate: number;
  rating: number;
  joined_at: string;
  user_role: string;
  current_entrepreneurs: number;
  completed_assignments: number;
}

const OrganisationMentorProfile = () => {
  const { id: organisationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  
  // Editable fields
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [expertiseList, setExpertiseList] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [organisationId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Non authentifié");
        navigate('/login');
        return;
      }

      // Check if user is the owner
      const { data: orgData } = await (supabase as any)
        .from('organizations')
        .select('created_by')
        .eq('id', organisationId)
        .single();
      
      setIsOwner(orgData?.created_by === user.id);

      // Fetch mentor profile
      const { data: mentorData, error: mentorError } = await (supabase as any)
        .from('mentors')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', organisationId)
        .single();

      if (mentorError) {
        console.error('Mentor fetch error:', mentorError);
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        toast.error("Erreur lors du chargement du profil");
        return;
      }

      // Handle expertise - ensure it's always an array
      let expertiseArray: string[] = [];
      if (mentorData?.expertise) {
        if (Array.isArray(mentorData.expertise)) {
          expertiseArray = mentorData.expertise;
        } else if (typeof mentorData.expertise === 'string') {
          // Handle legacy comma-separated format
          expertiseArray = mentorData.expertise.split(',').map(e => e.trim()).filter(e => e);
        }
      }

      const combinedProfile: MentorProfile = {
        id: mentorData?.id || '',
        user_id: user.id,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        bio: mentorData?.bio || '',
        linkedin_url: mentorData?.linkedin_url || '',
        expertise: expertiseArray,
        status: mentorData?.status || 'active',
        total_entrepreneurs: mentorData?.total_entrepreneurs || 0,
        success_rate: mentorData?.success_rate || 0,
        rating: mentorData?.rating || 0,
        joined_at: profileData.created_at || '',
        user_role: profileData.user_role || 'staff',
        current_entrepreneurs: 0, // Will be calculated from assignments
        completed_assignments: 0  // Will be calculated from assignments
      };

      setProfile(combinedProfile);
      setBio(combinedProfile.bio);
      setLinkedinUrl(combinedProfile.linkedin_url);
      setPhone(combinedProfile.phone);
      setExpertiseList(combinedProfile.expertise);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpertise = () => {
    const trimmedInput = expertiseInput.trim();
    if (trimmedInput && !expertiseList.includes(trimmedInput)) {
      setExpertiseList([...expertiseList, trimmedInput]);
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (expertiseToRemove: string) => {
    setExpertiseList(expertiseList.filter(e => e !== expertiseToRemove));
  };

  const handleExpertiseKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddExpertise();
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update mentor table
      if (profile?.id) {
        const { error: mentorError } = await (supabase as any)
          .from('mentors')
          .update({
            bio,
            linkedin_url: linkedinUrl,
            expertise: expertiseList,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (mentorError) throw mentorError;
      }

      // Update profiles table
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          phone
        })
        .eq('id', profile?.user_id);

      if (profileError) throw profileError;

      toast.success("Profil mis à jour avec succès");
      await fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveOrganization = async () => {
    try {
      if (!profile?.user_id || !organisationId) return;

      // Remove from user_organizations
      const { error: removeError } = await (supabase as any)
        .from('user_organizations')
        .delete()
        .eq('user_id', profile.user_id)
        .eq('organization_id', organisationId);

      if (removeError) throw removeError;

      // Deactivate mentor entry
      const { error: mentorError } = await (supabase as any)
        .from('mentors')
        .update({ status: 'inactive' })
        .eq('user_id', profile.user_id)
        .eq('organization_id', organisationId);

      if (mentorError) console.warn('Mentor deactivation error:', mentorError);

      toast.success("Vous avez quitté l'organisation avec succès");
      setLeaveDialogOpen(false);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving organization:', error);
      toast.error("Erreur lors de la sortie de l'organisation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-pink mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Profil non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mon Profil Mentor
          </h1>
          <p className="text-gray-600">
            Gérez vos informations et votre profil de mentor
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isOwner && (
            <Button 
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => setLeaveDialogOpen(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Quitter l'organisation
            </Button>
          )}
          
          <Button 
            style={{ backgroundColor: '#ff5932' }}
            className="hover:opacity-90 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorés Actuels</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.current_entrepreneurs}/{profile.total_entrepreneurs}</div>
            <p className="text-xs text-muted-foreground">En cours / Capacité max</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accompagnements Terminés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.completed_assignments}</div>
            <p className="text-xs text-muted-foreground">Total complétés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.success_rate}%</div>
            <p className="text-xs text-muted-foreground">Projets réussis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.rating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">Évaluation globale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.current_entrepreneurs < profile.total_entrepreneurs ? (
                <span className="text-green-600">Disponible</span>
              ) : (
                <span className="text-orange-600">Complet</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile.total_entrepreneurs - profile.current_entrepreneurs} place{profile.total_entrepreneurs - profile.current_entrepreneurs !== 1 ? 's' : ''} restante{profile.total_entrepreneurs - profile.current_entrepreneurs !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>
              Ces informations ne peuvent pas être modifiées ici
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom complet
              </Label>
              <Input 
                value={`${profile.first_name} ${profile.last_name}`}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input 
                value={profile.email}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Votre numéro de téléphone"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label>Rôle:</Label>
              <Badge className="bg-aurentia-pink text-white px-3 py-1.5">
                {profile.user_role === 'organisation' ? 'Propriétaire' : 'Mentor'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Label>Statut:</Label>
              <Badge className={`${profile.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'} px-3 py-1.5`}>
                {profile.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information (Editable) */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Professionnelles</CardTitle>
            <CardDescription>
              Modifiez vos informations de mentor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Biographie
              </Label>
              <Textarea 
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Décrivez votre expérience et votre approche de mentorat..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Expertises
              </Label>
              {expertiseList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {expertiseList.map((tag, index) => (
                    <Badge 
                      key={index} 
                      className="bg-aurentia-pink text-white px-3 py-1.5 flex items-center gap-2"
                    >
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-gray-200" 
                        onClick={() => handleRemoveExpertise(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <Input 
                id="expertise"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={handleExpertiseKeyDown}
                placeholder="Tapez une expertise et appuyez sur Entrée..."
              />
              <p className="text-xs text-gray-500">
                Appuyez sur Entrée pour ajouter une expertise
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Label>
              <Input 
                id="linkedin"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/votre-profil"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Membre depuis:</strong>{' '}
                {new Date(profile.joined_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Expertise Tags */}
      {profile.expertise.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mes Expertises Actuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((exp, index) => (
                <Badge key={index} variant="outline" className="bg-aurentia-pink/10 text-aurentia-pink border-aurentia-pink">
                  {exp}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Organization Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitter l'organisation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir quitter cette organisation ? Vous perdrez l'accès à tous les projets et ressources.
              Cette action peut être inversée si vous êtes réinvité.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleLeaveOrganization}>
              <LogOut className="w-4 h-4 mr-2" />
              Quitter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganisationMentorProfile;
