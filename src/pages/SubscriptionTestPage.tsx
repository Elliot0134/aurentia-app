import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const SubscriptionTestPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      
      // Récupérer un projet de test (le plus récent)
      const { data: projects } = await supabase
        .from('project_summary')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (projects && projects.length > 0) {
        setCurrentProject(projects[0]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p>Veuillez vous connecter pour accéder à cette page.</p>
            <Button onClick={() => navigate('/auth')} className="mt-4">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test de l'intégration Stripe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p><strong>Utilisateur :</strong> {user.email}</p>
                <p><strong>ID :</strong> {user.id}</p>
              </div>
              
              {currentProject ? (
                <div>
                  <p><strong>Projet de test :</strong> {currentProject.project_name}</p>
                  <p><strong>ID Projet :</strong> {currentProject.project_id}</p>
                </div>
              ) : (
                <div>
                  <p className="text-orange-600">Aucun projet trouvé. Créez un projet d'abord.</p>
                  <Button onClick={() => navigate('/dashboard')} className="mt-2">
                    Aller au dashboard
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <SubscriptionManager 
          userId={user.id}
          projectId={currentProject?.project_id}
          onSubscriptionUpdate={(hasSubscription) => {
            console.log('Statut abonnement:', hasSubscription);
          }}
        />
      </div>
    </div>
  );
};

export default SubscriptionTestPage;
