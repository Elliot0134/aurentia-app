import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';
import { EmailConfirmationSection } from '@/components/auth/EmailConfirmationSection';

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  company: string;
  phone: string;
  location: string;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<ProfileData>({
    id: "",
    email: "",
    full_name: "",
    company: "",
    phone: "",
    location: "",
    created_at: "",
    updated_at: ""
  });
  
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableFields, setEditableFields] = useState({
    full_name: "",
    company: "",
    phone: "",
    location: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Stocker l'utilisateur auth pour la confirmation d'email
        setAuthUser(session.user);
        
        // In a real application, you would fetch the full user profile from your database
        // Fetch first_name from user_metadata
        const firstName = session.user.user_metadata?.first_name || "";

        const userData = {
          email: session.user.email || "",
          full_name: firstName, // Use first_name for full_name
          id: session.user.id,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at,
          company: session.user.user_metadata?.company || "",
          phone: session.user.user_metadata?.phone || "",
          location: session.user.user_metadata?.location || ""
        };

        setUser(userData);
        setEditableFields({
          full_name: userData.full_name,
          company: userData.company,
          phone: userData.phone,
          location: userData.location
        });
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
      full_name: user.full_name,
      company: user.company,
      phone: user.phone,
      location: user.location
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableFields({
      full_name: user.full_name,
      company: user.company,
      phone: user.phone,
      location: user.location
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: editableFields.full_name,
          company: editableFields.company,
          phone: editableFields.phone,
          location: editableFields.location
        }
      });

      if (error) throw error;

      // Update local state
      setUser(prev => ({
        ...prev,
        full_name: editableFields.full_name,
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

  const displayValue = (value: string) => {
    return value.trim() || "Non renseigné";
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Profil Utilisateur</h1>
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2">
              <Edit2 size={16} />
              Modifier
            </Button>
          ) : (
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

        {/* Section de confirmation d'email */}
        {authUser && (
          <EmailConfirmationSection user={authUser} />
        )}
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Informations du profil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations personnelles</h3>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="mt-1 text-gray-900">{user.email || "Non renseigné"}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Prénom</Label>
                {isEditing ? (
                  <Input
                    value={editableFields.full_name}
                    onChange={(e) => handleFieldChange('full_name', e.target.value)}
                    placeholder="Entrez votre prénom"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{displayValue(user.full_name)}</p>
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations professionnelles</h3>
              
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
                  <Input
                    value={editableFields.location}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    placeholder="Entrez votre localisation"
                    className="mt-1"
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
        </Card>
      </div>
    </div>
  );
};

export default Profile;
