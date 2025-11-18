import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Input } from "@/components/ui/input";
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import CreditsDisplay from '@/components/subscription/CreditsDisplay';
import { useProject } from '@/contexts/ProjectContext';
import { Label } from "@/components/ui/label";
import { Edit2, Save, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { userInitializationService } from '@/services/userInitializationService';
import { profileService, ProfileData } from '@/services/profileService';
import { AddressAutocompleteInput } from "@/components/ui/address-autocomplete-input";
import usePageTitle from '@/hooks/usePageTitle';

const Profile = () => {
  usePageTitle("Profil");
  const navigate = useNavigate();
  const { currentProjectId } = useProject();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newEmail, setNewEmail] = useState('');
  const [user, setUser] = useState<ProfileData>({
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    company: "",
    phone: "",
    location: "",
    avatar_url: "",
    created_at: ""
  });

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableFields, setEditableFields] = useState({
    first_name: "",
    last_name: "",
    company: "",
    phone: "",
    location: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);

  // Get activeTab from URL params, default to "Informations"
  const validTabs = ["Informations", "Facturation", "Sécurité"];
  const tabFromUrl = searchParams.get('tab') || "Informations";
  const activeTab = validTabs.includes(tabFromUrl) ? tabFromUrl : "Informations";

  const { subscriptionStatus, loading: subscriptionLoading } = useSubscriptionStatus();
  const { userProjectsLoading } = useProject();

  // Function to update tab and URL
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Stocker l'utilisateur auth pour la confirmation d'email
          setAuthUser(session.user);
          
          // S'assurer que l'utilisateur a des crédits initialisés
          await userInitializationService.ensureUserCreditsExist(session.user.id);
          
          // Fetch profile from profiles table
          const profile = await profileService.getProfile(session.user.id);
          
          if (profile) {
            setUser(profile);
            setEditableFields({
              first_name: profile.first_name || "",
              last_name: profile.last_name || "",
              company: profile.company || "",
              phone: profile.phone || "",
              location: profile.location || ""
            });
          } else {
            // Fallback to auth metadata if profile doesn't exist
            const userData: ProfileData = {
              id: session.user.id,
              email: session.user.email || "",
              first_name: session.user.user_metadata?.first_name || "",
              last_name: session.user.user_metadata?.last_name || "",
              company: session.user.user_metadata?.company || "",
              phone: session.user.user_metadata?.phone || "",
              location: session.user.user_metadata?.location || "",
              avatar_url: session.user.user_metadata?.avatar_url || "",
              created_at: session.user.created_at
            };

            setUser(userData);
            setEditableFields({
              first_name: userData.first_name,
              last_name: userData.last_name,
              company: userData.company,
              phone: userData.phone,
              location: userData.location
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditableFields({
      first_name: user.first_name,
      last_name: user.last_name,
      company: user.company,
      phone: user.phone,
      location: user.location
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableFields({
      first_name: user.first_name,
      last_name: user.last_name,
      company: user.company,
      phone: user.phone,
      location: user.location
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update profile in database
      const success = await profileService.updateProfile(user.id, editableFields);

      if (!success) {
        throw new Error('Failed to update profile');
      }

      // Update local state
      setUser(prev => ({
        ...prev,
        first_name: editableFields.first_name,
        last_name: editableFields.last_name,
        company: editableFields.company,
        phone: editableFields.phone,
        location: editableFields.location
      }));

      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof typeof editableFields, value: string) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = async (publicUrl: string) => {
    setIsLoading(true);
    try {
      const success = await profileService.updateProfile(user.id, { avatar_url: publicUrl });

      if (!success) {
        throw new Error('Failed to update avatar');
      }

      setUser(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));

      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre photo de profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    setIsLoading(true);
    try {
      const success = await profileService.updateProfile(user.id, { avatar_url: '' });

      if (!success) {
        throw new Error('Failed to delete avatar');
      }

      setUser(prev => ({
        ...prev,
        avatar_url: ''
      }));

      toast({
        title: "Photo de profil supprimée",
        description: "Votre photo de profil a été supprimée.",
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer votre photo de profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation côté client
    if (!newEmail) {
      toast({ title: "Erreur", description: "Le champ email est obligatoire.", variant: "destructive" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast({ title: "Erreur", description: "Le format de l'email est invalide.", variant: "destructive" });
      return;
    }
    if (newEmail === user.email) {
      toast({ title: "Erreur", description: "La nouvelle adresse e-mail doit être différente de l'actuelle.", variant: "destructive" });
      return;
    }
    // 2. Vérifier que l'utilisateur est connecté
    if (!authUser) {
      toast({ title: "Erreur", description: "Utilisateur non authentifié.", variant: "destructive" });
      return;
    }

    setEmailLoading(true);
    try {
      // 3. Appeler l'Edge Function dédiée
      const { error } = await supabase.functions.invoke('update-email-request', {
        body: { new_email: newEmail },
      });

      if (error) throw error;

      // 4. Gérer le succès
      toast({
        title: "Emails de confirmation envoyés",
        description: "Des e-mails de confirmation ont été envoyés à votre ancienne ET nouvelle adresse. Vous devez confirmer dans les DEUX emails pour finaliser le changement.",
      });
      setNewEmail('');

    } catch (error: any) {
      // 5. Gérer les erreurs
      console.error('Error invoking update-email-request function:', error);
      // Essayer d'extraire un message d'erreur plus précis de la réponse de la fonction
      const errorMessage = error.context?.json?.error || error.message || "Impossible de demander le changement d'e-mail.";
      toast({
        title: "Erreur de la fonction",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const displayValue = (value: string) => {
    if (value === null || value === undefined) return "Non renseigné";
    const str = String(value).trim();
    return str || "Non renseigné";
  };

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[90vw] md:w-11/12 mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Profil Utilisateur</h1>
        </div>

        <div className="md:border-b md:border-gray-200">
          <nav className="grid grid-cols-2 gap-2 md:flex md:flex-row md:-mb-px md:space-x-8" aria-label="Tabs">
            {validTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-2 px-4 font-medium text-base text-center rounded-md
                  ${
                    activeTab === tab
                      ? 'bg-aurentia-orange-aurentia text-white'
                      : 'bg-white border border-gray-200 text-gray-700'
                  }
                  md:whitespace-nowrap md:py-3 md:px-2 md:border-b-2 md:rounded-none md:bg-transparent md:text-center
                  ${
                    activeTab === tab
                      ? 'md:border-aurentia-orange-aurentia md:text-aurentia-orange-aurentia'
                      : 'md:border-transparent md:text-gray-500 md:hover:text-gray-700 md:hover:border-transparent'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 animate-popup-appear" key={activeTab}>
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-slate-500">Chargement de votre profil...</p>
            </div>
          ) : (
            <>
              {activeTab === "Informations" && (
                <div>
                  <div className="flex flex-col items-start md:flex-row md:justify-between md:items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Informations du profil</h2>
                    {!isEditing && (
                      <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2 mt-4 md:mt-0">
                        <Edit2 size={16} />
                        Modifier
                      </Button>
                    )}
                  </div>

                  {/* Profile Picture Section */}
                  <div className="mb-8 flex justify-center">
                    <div className="text-center">
                      <ImageUploader
                        bucket="avatars"
                        folder={user.id}
                        value={user.avatar_url}
                        onUpload={handleAvatarUpload}
                        onDelete={handleAvatarDelete}
                        mode="logo"
                        disabled={!isEditing}
                        fallbackText={user.first_name || user.email}
                        maxSizeMB={2}
                      />
                      <p className="text-sm text-gray-500 mt-2">Photo de profil</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:flex-row md:justify-between md:items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-700">Informations</h3>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Save size={16} />
                      {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <X size={16} />
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="p-6 rounded-lg bg-white shadow-md">
                  <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Informations personnelles</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="mt-1 text-gray-900">{user.email || "Non renseigné"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Prénom</Label>
                      {isEditing ? (
                        <Input
                          value={editableFields.first_name}
                          onChange={(e) => handleFieldChange('first_name', e.target.value)}
                          placeholder="Entrez votre prénom"
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{displayValue(user.first_name)}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Nom</Label>
                      {isEditing ? (
                        <Input
                          value={editableFields.last_name}
                          onChange={(e) => handleFieldChange('last_name', e.target.value)}
                          placeholder="Entrez votre nom"
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{displayValue(user.last_name)}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Téléphone</Label>
                      {isEditing ? (
                        <Input
                          value={editableFields.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          placeholder="Entrez votre numéro de téléphone"
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{displayValue(user.phone)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="p-6 rounded-lg bg-white shadow-md">
                  <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Informations professionnelles</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Entreprise</Label>
                      {isEditing ? (
                        <Input
                          value={editableFields.company}
                          onChange={(e) => handleFieldChange('company', e.target.value)}
                          placeholder="Entrez le nom de votre entreprise"
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{displayValue(user.company)}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Localisation</Label>
                      {isEditing ? (
                        <AddressAutocompleteInput
                          value={editableFields.location}
                          onChange={(value) => handleFieldChange('location', value)}
                          placeholder="Entrez votre localisation"
                          addressType="regions"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{displayValue(user.location)}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Membre depuis</Label>
                      <p className="mt-1 text-gray-900">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "Facturation" && (
            <div>
              <CreditsDisplay />
              <h2 className="text-2xl font-bold mb-6 text-slate-800 mt-8">Abonnements</h2>
              {isLoading || userProjectsLoading ? (
                <div className="flex justify-center items-center h-48">
                  <p className="text-slate-500">Chargement des informations...</p>
                </div>
              ) : user.id && currentProjectId ? (
                <SubscriptionManager userId={user.id} projectId={currentProjectId} />
              ) : user.id ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-slate-600">Vous n'avez pas encore de projet actif.</p>
                  <p className="text-slate-500 mt-2">Veuillez créer un projet pour gérer votre abonnement.</p>
                </div>
              ) : null}
            </div>
          )}
          {activeTab === "Sécurité" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Sécurité du compte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Changer le mot de passe */}
                <div className="p-6 rounded-lg bg-white shadow-md flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Changer le mot de passe</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600" htmlFor="current-password">
                          Mot de passe actuel
                        </Label>
                        <Input id="current-password" type="password" placeholder="••••••••" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600" htmlFor="new-password">
                          Nouveau mot de passe
                        </Label>
                        <Input id="new-password" type="password" placeholder="••••••••" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600" htmlFor="confirm-password">
                          Confirmer le nouveau mot de passe
                        </Label>
                        <Input id="confirm-password" type="password" placeholder="••••••••" className="mt-1" />
                      </div>
                    </div>
                  </div>
                  <Button className="mt-6 self-end">Sauvegarder le mot de passe</Button>
                </div>

                {/* Changer l'adresse e-mail */}
                <form onSubmit={handleChangeEmail} className="p-6 rounded-lg bg-white shadow-md flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Changer l'adresse e-mail</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Email actuel
                        </Label>
                        <div className="mt-1">
                          <div className="inline-block p-2 bg-gray-100 rounded-md">
                            <p className="text-gray-900">{user.email || "Non renseigné"}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600" htmlFor="new-email">
                          Nouvelle adresse e-mail
                        </Label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="nouvel.email@exemple.com"
                          className="mt-1"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          disabled={emailLoading}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="mt-6 self-end"
                    disabled={emailLoading}
                  >
                    {emailLoading ? "Mise à jour en cours..." : "Mettre à jour l'e-mail"}
                  </Button>
                </form>
              </div>
            </div>
          )}
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
