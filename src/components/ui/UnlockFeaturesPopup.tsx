import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PlanCard from '@/components/ui/PlanCard';
import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStripePayment } from '@/hooks/useStripePayment';
import { toast } from '@/components/ui/use-toast';

interface UnlockFeaturesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
  projectId?: string;
}

const UnlockFeaturesPopup: React.FC<UnlockFeaturesPopupProps> = ({ 
  isOpen, 
  onClose, 
  projectTitle = "Votre projet",
  projectId
}) => {
  const { initiateSubscription } = useStripePayment();

  const handlePayment = async (planId: string) => {
    if (!projectId) {
      toast({
        title: "Erreur",
        description: "ID du projet manquant",
        variant: "destructive",
      });
      return;
    }
    
    await initiateSubscription(projectId);
  };

  const commonDeliverables = [
    "Analyse concurrentielle",
    <>Analyse du marché <span className="text-gray-500 italic text-lg">(PESTEL)</span></>,
    "Proposition de valeur",
    "Business model",
    <>Analyse des ressources requises <span className="text-gray-500 italic text-lg">(Impréssionant)</span></>,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:w-[70vw] max-w-none overflow-y-auto max-h-[90vh] md:h-[90vh] rounded-lg md:flex md:flex-col md:justify-center md:items-center">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#2D2D2D]">
            Obtenez votre plan d'action personnalisé en quelques clics !
          </DialogTitle>
          <div className="mt-4">
          </div>
          <div>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mt-8">
              <PlanCard
                title="Pack Entrepreneur"
                price={
                  <>
                    12,90€<span className="text-sm">/mois</span>
                  </>
                }
                oldPrice=""
                deliverables={[
                  "Plan d'action personnalisé",
                  "Livrables premium",
                  "3 000 crédits",
                  "Exportation PDF",
                  "Accès à toutes les fonctionnalités",
                  "Collaboration utilisateurs",
                  "Support prioritaire",
                ]}
                buttonText="Let's go !"
                creditsSection={
                  <div className="bg-gray-100 p-3 rounded-lg text-gray-800 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold">3 000 crédits Aurentia IA</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Popover>
                              <PopoverTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer" />
                              </PopoverTrigger>
                              <PopoverContent className="sm:fixed sm:inset-0 sm:flex sm:items-center sm:justify-center sm:transform-none md:static md:translate-x-0 md:translate-y-0">
                                <p>1 crédit = un message avec notre Agent IA connecté à votre projet</p>
                              </PopoverContent>
                            </Popover>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>1 crédit = un message avec notre Agent IA connecté à votre projet</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                }
                className="flex-1"
                onButtonClick={() => handlePayment('plan1')}
              />
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockFeaturesPopup;