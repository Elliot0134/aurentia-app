import { useState, useEffect, KeyboardEvent, useCallback } from "react";
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
  Clock,
  Globe,
  Target,
  ExternalLink
} from "lucide-react";
import { useOrgPageTitle } from '@/hooks/usePageTitle';

interface Availability {
  days_per_week: number;
  hours_per_week: number;
  preferred_days: string[];
}

interface MentorProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  website: string;
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
  availability: Availability;
  max_projects: number;
  max_entrepreneurs: number;
}

const OrganisationMentorProfile = () => {
  useOrgPageTitle("Profil Mentor");
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
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [expertiseList, setExpertiseList] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState<number | "">(0);
  const [hoursPerWeek, setHoursPerWeek] = useState<number | "">(0);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [maxProjects, setMaxProjects] = useState<number | "">(5);
  const [maxEntrepreneurs, setMaxEntrepreneurs] = useState<number | "">(10);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      let { data: mentorData, error: mentorError } = await (supabase as any)
        .from('mentors')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', organisationId)
        .maybeSingle();

      // If mentor doesn't exist, create one
      if (!mentorData && mentorError?.code !== 'PGRST116') {
        console.error('Mentor fetch error:', mentorError);
      }

      if (!mentorData) {
        // Create mentor record
        const { data: newMentor, error: createError } = await (supabase as any)
          .from('mentors')
          .insert({
            user_id: user.id,
            organization_id: organisationId,
            bio: '',
            linkedin_url: '',
            expertise: [],
            status: 'active',
            availability: {
              days_per_week: 0,
              hours_per_week: 0,
              preferred_days: []
            },
            max_projects: 5,
            max_entrepreneurs: 10
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating mentor:', createError);
          toast.error("Erreur lors de la création du profil mentor");
          return;
        }

        mentorData = newMentor;
        toast.success("Profil mentor créé avec succès");
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

      // Fetch mentor assignments to get real statistics (only if mentor exists)
      let assignmentsData: any[] = [];
      if (mentorData?.id) {
        const { data } = await (supabase as any)
          .from('mentor_assignments')
          .select('*')
          .eq('mentor_id', mentorData.id)
          .eq('organization_id', organisationId);
        assignmentsData = data || [];
      }

      // Calculate real statistics
      const activeAssignments = assignmentsData?.filter((a: any) => a.status === 'active') || [];
      const completedAssignments = assignmentsData?.filter((a: any) => a.status === 'completed') || [];
      const totalAssignments = assignmentsData?.length || 0;
      const currentEntrepreneurs = new Set(activeAssignments.map((a: any) => a.entrepreneur_id)).size;
      const currentProjects = new Set(activeAssignments.map((a: any) => a.project_id)).size;

      // Calculate success rate (completed / total if any assignments exist)
      const calculatedSuccessRate = totalAssignments > 0
        ? Math.round((completedAssignments.length / totalAssignments) * 100)
        : mentorData?.success_rate || 0;

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

      // Handle availability - ensure it has proper structure
      const availabilityData: Availability = mentorData?.availability || {
        days_per_week: 0,
        hours_per_week: 0,
        preferred_days: []
      };

      const combinedProfile: MentorProfile = {
        id: mentorData?.id || '',
        user_id: user.id,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        website: profileData.website || '',
        bio: mentorData?.bio || '',
        linkedin_url: mentorData?.linkedin_url || '',
        expertise: expertiseArray,
        status: mentorData?.status || 'active',
        total_entrepreneurs: mentorData?.max_entrepreneurs || 10,
        success_rate: calculatedSuccessRate,
        rating: mentorData?.rating || 0,
        joined_at: profileData.created_at || '',
        user_role: profileData.user_role || 'staff',
        current_entrepreneurs: currentEntrepreneurs,
        completed_assignments: completedAssignments.length,
        availability: availabilityData,
        max_projects: mentorData?.max_projects || 5,
        max_entrepreneurs: mentorData?.max_entrepreneurs || 10
      };

      setProfile(combinedProfile);
      setBio(combinedProfile.bio);
      setLinkedinUrl(combinedProfile.linkedin_url);
      setWebsite(combinedProfile.website);
      setPhone(combinedProfile.phone);
      setExpertiseList(combinedProfile.expertise);
      setDaysPerWeek(combinedProfile.availability.days_per_week);
      setHoursPerWeek(combinedProfile.availability.hours_per_week);
      setPreferredDays(combinedProfile.availability.preferred_days);
      setMaxProjects(combinedProfile.max_projects);
      setMaxEntrepreneurs(combinedProfile.max_entrepreneurs);
      setHasUnsavedChanges(false);
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
      setHasUnsavedChanges(true);
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

  const togglePreferredDay = (day: string) => {
    setPreferredDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
    setHasUnsavedChanges(true);
  };

  const WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Warn about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    // Convert empty strings to numbers for validation
    const daysNum = daysPerWeek === "" ? 0 : Number(daysPerWeek);
    const hoursNum = hoursPerWeek === "" ? 0 : Number(hoursPerWeek);
    const projectsNum = maxProjects === "" ? 1 : Number(maxProjects);
    const entrepreneursNum = maxEntrepreneurs === "" ? 1 : Number(maxEntrepreneurs);

    // Validate URLs - auto-add https:// if missing
    let finalLinkedinUrl = linkedinUrl.trim();
    let finalWebsite = website.trim();

    if (finalLinkedinUrl && !finalLinkedinUrl.match(/^https?:\/\//i)) {
      finalLinkedinUrl = 'https://' + finalLinkedinUrl;
    }
    if (finalWebsite && !finalWebsite.match(/^https?:\/\//i)) {
      finalWebsite = 'https://' + finalWebsite;
    }

    if (finalLinkedinUrl && !isValidUrl(finalLinkedinUrl)) {
      toast.error("L'URL LinkedIn n'est pas valide");
      return;
    }
    if (finalWebsite && !isValidUrl(finalWebsite)) {
      toast.error("L'URL du site web n'est pas valide");
      return;
    }

    // Validate capacity limits
    if (projectsNum < 1 || projectsNum > 50) {
      toast.error("Le nombre de projets doit être entre 1 et 50");
      return;
    }
    if (entrepreneursNum < 1 || entrepreneursNum > 100) {
      toast.error("Le nombre d'entrepreneurs doit être entre 1 et 100");
      return;
    }
    if (daysNum < 0 || daysNum > 7) {
      toast.error("Les jours par semaine doivent être entre 0 et 7");
      return;
    }
    if (hoursNum < 0 || hoursNum > 168) {
      toast.error("Les heures par semaine doivent être entre 0 et 168");
      return;
    }
    try {
      setSaving(true);

      // Update mentor table with all fields
      if (profile?.id) {
        const { error: mentorError } = await (supabase as any)
          .from('mentors')
          .update({
            bio,
            linkedin_url: finalLinkedinUrl,
            expertise: expertiseList,
            availability: {
              days_per_week: daysNum,
              hours_per_week: hoursNum,
              preferred_days: preferredDays
            },
            max_projects: projectsNum,
            max_entrepreneurs: entrepreneursNum,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (mentorError) throw mentorError;
      }

      // Update profiles table
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          phone,
          website: finalWebsite
        })
        .eq('id', profile?.user_id);

      if (profileError) throw profileError;

      // Update local state with final URLs
      setLinkedinUrl(finalLinkedinUrl);
      setWebsite(finalWebsite);

      toast.success("Profil mis à jour avec succès");
      setHasUnsavedChanges(false);
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
          {hasUnsavedChanges && (
            <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
              Modifications non sauvegardées
            </p>
          )}
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
            className="btn-white-label hover:opacity-90"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrepreneurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-aurentia-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.current_entrepreneurs}</div>
            <p className="text-xs text-muted-foreground">
              Sur {profile.total_entrepreneurs} max
            </p>
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
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.success_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {profile.completed_assignments > 0 ? 'Basé sur les données' : 'Aucune donnée'}
            </p>
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
                onChange={(e) => {
                  setPhone(e.target.value);
                  setHasUnsavedChanges(true);
                }}
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
                onChange={(e) => {
                  setBio(e.target.value);
                  setHasUnsavedChanges(true);
                }}
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
                        onClick={() => {
                          handleRemoveExpertise(tag);
                          setHasUnsavedChanges(true);
                        }}
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
                onChange={(e) => {
                  setLinkedinUrl(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="linkedin.com/in/votre-profil ou URL complète"
              />
              {linkedinUrl && linkedinUrl.match(/^https?:\/\//i) && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-aurentia-pink hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Ouvrir le profil LinkedIn
                </a>
              )}
              {linkedinUrl && !linkedinUrl.match(/^https?:\/\//i) && (
                <p className="text-xs text-gray-500">
                  💡 L'URL sera automatiquement complétée avec https:// lors de la sauvegarde
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Site Web
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="votresite.com ou URL complète"
              />
              {website && website.match(/^https?:\/\//i) && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-aurentia-pink hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visiter le site web
                </a>
              )}
              {website && !website.match(/^https?:\/\//i) && (
                <p className="text-xs text-gray-500">
                  💡 L'URL sera automatiquement complétée avec https:// lors de la sauvegarde
                </p>
              )}
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

      {/* Availability & Capacity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Disponibilité & Capacité
          </CardTitle>
          <CardDescription>
            Configurez votre disponibilité et vos limites d'accompagnement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Availability Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">Disponibilité</h3>

              <div className="space-y-2">
                <Label htmlFor="daysPerWeek" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Jours par semaine
                </Label>
                <Input
                  id="daysPerWeek"
                  type="text"
                  inputMode="numeric"
                  value={daysPerWeek}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setDaysPerWeek("");
                    } else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num <= 7) {
                        setDaysPerWeek(num);
                      }
                    }
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">Maximum 7 jours par semaine</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Heures par semaine
                </Label>
                <Input
                  id="hoursPerWeek"
                  type="text"
                  inputMode="numeric"
                  value={hoursPerWeek}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setHoursPerWeek("");
                    } else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setHoursPerWeek(num);
                      }
                    }
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Jours préférés
                </Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <Badge
                      key={day}
                      className={`cursor-pointer transition-colors ${
                        preferredDays.includes(day)
                          ? 'bg-aurentia-pink text-white hover:bg-aurentia-pink/80'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => togglePreferredDay(day)}
                    >
                      {day.substring(0, 3)}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Cliquez pour sélectionner vos jours de disponibilité
                </p>
              </div>
            </div>

            {/* Capacity Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">Capacité d'accompagnement</h3>

              <div className="space-y-2">
                <Label htmlFor="maxProjects" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Projets maximum
                </Label>
                <Input
                  id="maxProjects"
                  type="text"
                  inputMode="numeric"
                  value={maxProjects}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setMaxProjects("");
                    } else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setMaxProjects(num);
                      }
                    }
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="5"
                />
                <p className="text-xs text-gray-500">
                  Nombre maximum de projets que vous pouvez suivre simultanément
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxEntrepreneurs" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Entrepreneurs maximum
                </Label>
                <Input
                  id="maxEntrepreneurs"
                  type="text"
                  inputMode="numeric"
                  value={maxEntrepreneurs}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setMaxEntrepreneurs("");
                    } else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setMaxEntrepreneurs(num);
                      }
                    }
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="10"
                />
                <p className="text-xs text-gray-500">
                  Nombre maximum d'entrepreneurs que vous pouvez accompagner
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Capacité actuelle:</strong> {profile.current_entrepreneurs} / {maxEntrepreneurs === "" ? 0 : maxEntrepreneurs} entrepreneurs
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Places disponibles: {(maxEntrepreneurs === "" ? 0 : maxEntrepreneurs) - profile.current_entrepreneurs}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
