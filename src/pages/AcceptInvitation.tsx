import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Mail, Users, Building } from 'lucide-react';

export const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'form' | 'accepting' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [invitationData, setInvitationData] = useState<any>(null);
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token d\'invitation manquant dans l\'URL');
      return;
    }
    
    loadInvitationInfo(token);
  }, [searchParams]);

  const loadInvitationInfo = async (token: string) => {
    try {
      // Récupérer les informations de l'invitation (sans authentification)
      const { data: invitation, error } = await supabase
        .from('project_invitations')
        .select(`
          id,
          email,
          role,
          project_id,
          project_name,
          expires_at,
          status,
          invited_at
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !invitation) {
        console.error('Erreur lors du chargement de l\'invitation:', error);
        setStatus('error');
        setMessage('Cette invitation est invalide, a expiré ou a déjà été utilisée.');
        return;
      }

      setInvitationData(invitation);
      setEmail(invitation.email); // Pré-remplir avec l'email de l'invitation
      setStatus('form');
      
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      setStatus('error');
      setMessage(`Erreur lors du chargement: ${error.message}`);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!email.trim()) {
      setMessage('Veuillez entrer votre adresse email');
      return;
    }

    if (!invitationData) {
      setMessage('Données d\'invitation manquantes');
      return;
    }

    // Vérifier que l'email correspond (insensible à la casse)
    if (invitationData.email.toLowerCase() !== email.trim().toLowerCase()) {
      setMessage('L\'adresse email ne correspond pas à cette invitation. Veuillez utiliser l\'adresse email qui a reçu l\'invitation.');
      return;
    }

    setStatus('accepting');
    setMessage('');

    try {
      const token = searchParams.get('token');
      
      // Marquer l'invitation comme acceptée directement
      const { error: updateError } = await supabase
        .from('project_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_email: email.trim().toLowerCase()
        })
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (updateError) {
        throw updateError;
      }

      setStatus('success');
      setMessage('🎉 Invitation acceptée avec succès ! Vous pourrez accéder au projet après votre inscription/connexion.');
      
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/login?message=' + encodeURIComponent('Connectez-vous pour accéder à vos projets'));
      }, 3000);
      
    } catch (error: any) {
      setStatus('error');
      setMessage(`Erreur: ${error.message}`);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner': return 'Propriétaire';
      case 'admin': return 'Administrateur';
      case 'editor': return 'Éditeur';
      case 'viewer': return 'Observateur';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {status === 'form' ? '✉️ Invitation à collaborer' : 
             status === 'success' ? '🎉 Invitation acceptée' :
             status === 'accepting' ? '⏳ Acceptation en cours' : 
             '❌ Erreur d\'invitation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Chargement de votre invitation...</p>
            </div>
          )}

          {status === 'form' && invitationData && (
            <div className="space-y-6">
              {/* Informations du projet */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Building className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-lg">
                      {invitationData.project_name || 'Projet sans nom'}
                    </h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Vous êtes invité(e) à collaborer sur ce projet
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails de l'invitation */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Rôle proposé :</span>
                  <span className="font-medium text-gray-800">
                    {getRoleDisplayName(invitationData.role)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Invité le :</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(invitationData.invited_at)}
                  </span>
                </div>
              </div>

              {/* Formulaire d'acceptation */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Confirmez votre adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Entrez l'adresse email qui a reçu cette invitation
                  </p>
                </div>

                {message && status === 'form' && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {message}
                  </div>
                )}

                <Button 
                  onClick={handleAcceptInvitation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  ✅ Accepter l'invitation
                </Button>
              </div>

              <div className="text-center text-xs text-gray-500">
                En acceptant cette invitation, vous pourrez collaborer sur ce projet
              </div>
            </div>
          )}

          {status === 'accepting' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Acceptation de votre invitation en cours...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
              <div className="space-y-2">
                <p className="text-green-700 font-medium">{message}</p>
                <p className="text-sm text-gray-600">
                  Redirection vers la page de connexion...
                </p>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 mx-auto text-red-600" />
              <div className="space-y-3">
                <p className="text-red-600">{message}</p>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;