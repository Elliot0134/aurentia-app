
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // In a real application, you would fetch the full user profile from your database
        // Fetch display_name from user_metadata
        const displayName = session.user.user_metadata?.display_name || "";

        setUser(prevUser => ({
          ...prevUser,
          email: session.user.email || "",
          full_name: displayName, // Use display_name for full_name
          id: session.user.id,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at,
        }));
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Profil Utilisateur</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 col-span-1 md:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Informations du compte</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom d'affichage</label>
                <p className="mt-1">{user.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Entreprise</label>
                <p className="mt-1">{user.company}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Téléphone</label>
                <p className="mt-1">{user.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Localisation</label>
                <p className="mt-1">{user.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Membre depuis</label>
                <p className="mt-1">{new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
