import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aurentiaStripeService, AURENTIA_CONFIG, type UserSubscriptionInfo } from '@/services/aurentiaStripeService';

interface SubscriptionManagerProps {
  userId: string;
  projectId?: string;
  onSubscriptionUpdate?: (hasSubscription: boolean) => void;
}

export const SubscriptionManager = ({ 
  userId, 
  projectId, 
  onSubscriptionUpdate 
}: SubscriptionManagerProps) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<UserSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Charger les informations d'abonnement
  const loadSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const info = await aurentiaStripeService.getUserSubscriptionStatus(userId);
      setSubscriptionInfo(info);
      onSubscriptionUpdate?.(info.has_active_subscription);
    } catch (error) {
      console.error('❌ Erreur chargement abonnement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations d\'abonnement',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Créer un abonnement
  const handleCreateSubscription = async () => {
    if (!projectId) {
      toast({
        title: 'Erreur',
        description: 'Aucun projet sélectionné',
        variant: 'destructive'
      });
      return;
    }

    try {
      setActionLoading(true);
      const result = await aurentiaStripeService.createSubscriptionPaymentLink(userId, projectId);
      
      if (result.success && result.data?.payment_url) {
        // Ouvrir le lien de paiement dans un nouvel onglet
        window.open(result.data.payment_url, '_blank');
        toast({
          title: 'Redirection vers Stripe',
          description: 'Vous allez être redirigé vers la page de paiement',
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Erreur lors de la création de l\'abonnement',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Erreur création abonnement:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de l\'abonnement',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Annuler un abonnement
  const handleCancelSubscription = async (immediately: boolean = false) => {
    try {
      setActionLoading(true);
      const result = await aurentiaStripeService.cancelSubscription(userId, immediately);
      
      if (result.success) {
        toast({
          title: 'Abonnement annulé',
          description: result.message,
        });
        await loadSubscriptionInfo();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Erreur lors de l\'annulation',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Erreur annulation abonnement:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'annulation de l\'abonnement',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Réactiver un abonnement
  const handleReactivateSubscription = async () => {
    try {
      setActionLoading(true);
      const result = await aurentiaStripeService.reactivateSubscription(userId);
      
      if (result.success) {
        toast({
          title: 'Abonnement réactivé',
          description: result.message,
        });
        await loadSubscriptionInfo();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Erreur lors de la réactivation',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Erreur réactivation abonnement:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la réactivation de l\'abonnement',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtenir le statut de l'abonnement avec couleur
  const getSubscriptionStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (status === 'active' && cancelAtPeriodEnd) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Sera annulé</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>;
      case 'canceled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Annulé</Badge>;
      case 'past_due':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En retard</Badge>;
      case 'incomplete':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Incomplet</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    loadSubscriptionInfo();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Chargement des informations d'abonnement...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Informations sur l'offre */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {AURENTIA_CONFIG.SUBSCRIPTION.NAME}
          </CardTitle>
          <CardDescription>
            {(AURENTIA_CONFIG.SUBSCRIPTION.AMOUNT / 100).toFixed(2)}€/mois • {AURENTIA_CONFIG.SUBSCRIPTION.CREDITS} crédits mensuels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptionInfo?.has_active_subscription ? (
              // Utilisateur abonné
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Vous êtes abonné</span>
                  </div>
                  {subscriptionInfo.subscription && getSubscriptionStatusBadge(
                    subscriptionInfo.subscription.status,
                    subscriptionInfo.subscription.cancel_at_period_end
                  )}
                </div>

                {subscriptionInfo.subscription && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Début: {formatDate(subscriptionInfo.subscription.current_period_start)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Fin: {formatDate(subscriptionInfo.subscription.current_period_end)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {subscriptionInfo.subscription?.cancel_at_period_end ? (
                    <Button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Réactiver l'abonnement
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleCancelSubscription(false)}
                        disabled={actionLoading}
                        className="flex-1"
                      >
                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Annuler à la fin du cycle
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelSubscription(true)}
                        disabled={actionLoading}
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Utilisateur non abonné
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Aucun abonnement actif</span>
                </div>

                <div className="text-sm text-gray-600">
                  <p>L'abonnement Entrepreneur vous donne accès à :</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>{AURENTIA_CONFIG.SUBSCRIPTION.CREDITS} crédits par mois</li>
                    <li>Génération des livrables premium</li>
                    <li>Accès à tous les outils Aurentia</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCreateSubscription}
                  disabled={actionLoading || !projectId}
                  className="w-full"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  S'abonner maintenant
                </Button>

                {!projectId && (
                  <p className="text-sm text-gray-500 text-center">
                    Veuillez d'abord créer un projet pour vous abonner
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bouton de rafraîchissement */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={loadSubscriptionInfo}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <span>Actualiser</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionManager;
