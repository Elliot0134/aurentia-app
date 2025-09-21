import React, { useState } from 'react';
import { Coins, Plus, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCredits } from '@/hooks/useCreditsSimple';

const CreditBalance = ({ credits: propCredits }) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // Utiliser le nouveau système de crédits
  const {
    monthlyRemaining,
    isLoading,
    error,
    addPurchasedCredits
  } = useCredits();

  // Si pas de crédits du nouveau système, utiliser les props (fallback)
  const credits = monthlyRemaining || propCredits || 0;
  const isLowCredits = credits <= 20; // Seuil fixe temporaire
  
  // Stats temporaires pour ne pas casser l'interface
  const stats = {
    currentBalance: credits,
    totalPurchased: 0,
    totalSpent: 0,
    thisMonthSpent: 0
  };
  // Packs temporaires (à remplacer par la vraie logique d'achat plus tard)
  const creditPacks = [
    { id: 'basic', name: 'Pack Basic', credits: 100, price: 10, bonus: 0, popular: false, description: 'Pack de base' }
  ];
  const bestValuePack = creditPacks[0];

  const handlePurchaseCredits = async (pack) => {
    try {
      // Utiliser la nouvelle fonction d'ajout de crédits
      const success = await addPurchasedCredits(pack.credits + pack.bonus);
      if (success) {
        console.log('Crédits ajoutés avec succès:', pack);
        setShowPurchaseModal(false);
      } else {
        console.error('Erreur lors de l\'ajout des crédits');
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
    }
  };

  const getPackValue = (pack) => (pack.price / (pack.credits + pack.bonus)).toFixed(3);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {/* Balance principale */}
        <Card className={`
          ${isLowCredits ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}
          transition-colors duration-200
        `}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isLowCredits ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}
              `}>
                <Coins className="w-5 h-5" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {credits}
                  </span>
                  <span className="text-sm text-gray-500">crédits</span>
                  
                  {isLowCredits && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Solde faible - Rechargez vos crédits</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  {stats.thisMonthSpent} utilisés ce mois
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton d'achat */}
        <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
          <DialogTrigger asChild>
            <Button 
              variant={isLowCredits ? "default" : "outline"}
              size="sm"
              className={isLowCredits ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              <Plus className="w-4 h-4 mr-1" />
              Recharger
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-600" />
                Recharger vos crédits
              </DialogTitle>
              <DialogDescription>
                Choisissez le pack qui correspond à vos besoins. Plus vous achetez, plus vous économisez !
              </DialogDescription>
            </DialogHeader>

            {/* Statistiques utilisateur */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.currentBalance}</div>
                <div className="text-xs text-gray-600">Crédits actuels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalPurchased}</div>
                <div className="text-xs text-gray-600">Total acheté</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalSpent}</div>
                <div className="text-xs text-gray-600">Total utilisé</div>
              </div>
            </div>

            {/* Packs de crédits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditPacks.map((pack) => {
                const isBestValue = pack.id === bestValuePack.id;
                const totalCredits = pack.credits + pack.bonus;
                
                return (
                  <Card 
                    key={pack.id}
                    className={`
                      relative cursor-pointer transition-all duration-200 hover:shadow-lg
                      ${pack.popular ? 'border-blue-500 shadow-md' : 'border-gray-200'}
                      ${isBestValue ? 'ring-2 ring-green-500' : ''}
                    `}
                  >
                    {/* Badges */}
                    {pack.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white">
                          Le plus populaire
                        </Badge>
                      </div>
                    )}
                    
                    {isBestValue && (
                      <div className="absolute -top-2 right-2">
                        <Badge className="bg-green-600 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Meilleure valeur
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg mb-2">{pack.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{pack.description}</p>
                        
                        {/* Prix */}
                        <div className="mb-4">
                          <div className="text-3xl font-bold text-gray-900">
                            {pack.price}€
                          </div>
                          <div className="text-sm text-gray-500">
                            {getPackValue(pack)}€ par crédit
                          </div>
                        </div>

                        {/* Crédits */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span>Crédits de base:</span>
                            <span className="font-medium">{pack.credits}</span>
                          </div>
                          {pack.bonus > 0 && (
                            <div className="flex items-center justify-between text-sm text-green-600">
                              <span>Bonus:</span>
                              <span className="font-medium">+{pack.bonus}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 mt-2 pt-2">
                            <div className="flex items-center justify-between font-semibold">
                              <span>Total:</span>
                              <span className="text-blue-600">{totalCredits} crédits</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => handlePurchaseCredits(pack)}
                          disabled={isLoading}
                          variant={pack.popular ? "default" : "outline"}
                        >
                          {isLoading ? "Traitement..." : "Acheter maintenant"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Informations importantes :</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Les crédits n'expirent jamais</li>
                    <li>• Paiement sécurisé via Stripe</li>
                    <li>• Remboursement possible sous 30 jours</li>
                    <li>• Support client disponible 24/7</li>
                  </ul>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Indicateur de statut */}
        {isLowCredits && (
          <Badge variant="outline" className="border-orange-200 text-orange-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Solde faible
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CreditBalance;