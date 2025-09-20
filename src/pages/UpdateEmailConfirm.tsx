import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface ConfirmationResponse {
  message: string;
  status: 'completed' | 'partial';
  both_confirmed: boolean;
  confirmed_type?: 'old' | 'new';
  waiting_for?: string;
}

const UpdateEmailConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'partial' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [confirmationData, setConfirmationData] = useState<ConfirmationResponse | null>(null);

  useEffect(() => {
    const confirmEmailUpdate = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || !type || !['old', 'new'].includes(type)) {
        setStatus('error');
        setMessage('Paramètres de confirmation manquants ou invalides.');
        return;
      }

      try {
        // Appeler l'Edge Function pour confirmer le changement d'email
        const { data, error } = await supabase.functions.invoke('confirm-email-update', {
          body: { token, type },
        });

        if (error) throw error;

        const response: ConfirmationResponse = data;
        setConfirmationData(response);

        if (response.status === 'completed') {
          setStatus('success');
          setMessage(response.message);
          
          toast({
            title: "Email mis à jour !",
            description: "Votre nouvelle adresse e-mail est maintenant active.",
          });

          // Rediriger vers le profil après 5 secondes
          setTimeout(() => {
            navigate('/individual/profile');
          }, 5000);

        } else if (response.status === 'partial') {
          setStatus('partial');
          setMessage(response.message);
          
          toast({
            title: "Confirmation reçue",
            description: `En attente de la validation de l'${response.waiting_for}.`,
          });
        }

      } catch (error: any) {
        console.error('Error confirming email update:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue lors de la confirmation.');
        
        toast({
          title: "Erreur de confirmation",
          description: error.message || 'Impossible de confirmer le changement d\'email.',
          variant: "destructive",
        });
      }
    };

    confirmEmailUpdate();
  }, [searchParams, navigate]);

  const handleReturnToProfile = () => {
    navigate('/individual/profile');
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-aurentia-orange-aurentia animate-spin mb-4" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 mb-4" />;
      case 'partial':
        return <Clock className="h-16 w-16 text-blue-500 mb-4" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500 mb-4" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirmation en cours...';
      case 'success':
        return 'Email confirmé !';
      case 'partial':
        return 'Confirmation reçue !';
      case 'error':
        return 'Erreur de confirmation';
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'loading':
        return 'Nous vérifions votre demande de changement d\'email.';
      case 'success':
        return 'Vous serez redirigé automatiquement vers votre profil dans quelques secondes.';
      case 'partial':
        return confirmationData?.waiting_for 
          ? `En attente de la confirmation depuis votre ${confirmationData.waiting_for}.` 
          : 'En attente de la seconde confirmation.';
      case 'error':
        return 'Le lien peut avoir expiré ou être invalide. Veuillez réessayer depuis votre profil.';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="flex flex-col items-center">
            {getIcon()}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              {getDescription()}
            </p>

            {status === 'partial' && confirmationData && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  📧 Double confirmation requise
                </h3>
                <p className="text-sm text-blue-700">
                  {confirmationData.confirmed_type === 'old' 
                    ? "✅ Ancienne adresse confirmée" 
                    : "✅ Nouvelle adresse confirmée"}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  ⏳ En attente : {confirmationData.waiting_for}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Vérifiez votre boîte mail pour finaliser le changement.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  🎉 Les deux confirmations ont été effectuées avec succès !
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Vous pouvez maintenant vous connecter avec votre nouvelle adresse email.
                </p>
              </div>
            )}
          </div>
        </div>

        {(status === 'success' || status === 'error' || status === 'partial') && (
          <Button 
            onClick={handleReturnToProfile}
            className="w-full"
            variant={status === 'error' ? 'outline' : 'default'}
          >
            Retourner au profil
          </Button>
        )}
      </Card>
    </div>
  );
};

export default UpdateEmailConfirm;
