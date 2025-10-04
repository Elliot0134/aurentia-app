import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCollaborators } from '@/hooks/useCollaborators';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { acceptInvitation } = useCollaborators();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token d\'invitation manquant');
      return;
    }
    
    handleAcceptInvitation(token);
  }, [searchParams]);
  
  const handleAcceptInvitation = async (token: string) => {
    const result = await acceptInvitation(token);
    
    if (result.success) {
      setStatus('success');
      setMessage('Invitation acceptée avec succès !');
      setTimeout(() => {
        navigate('/individual/collaborateurs');
      }, 2000);
    } else {
      setStatus('error');
      setMessage(result.error || 'Erreur lors de l\'acceptation de l\'invitation');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Acceptation d'invitation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p>Traitement de votre invitation...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
              <p className="text-green-600">{message}</p>
              <p className="text-sm text-gray-500">
                Redirection en cours...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-600" />
              <p className="text-red-600">{message}</p>
              <Button onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;