import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, ArrowRight } from "lucide-react";

interface OrganizationSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSetup: () => void;
}

const OrganizationSetupGuideModal = ({ isOpen, onClose, onStartSetup }: OrganizationSetupGuideModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-aurentia-orange to-yellow-500 flex items-center justify-center">
            <Building className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Créez votre organisation !
          </DialogTitle>
          <DialogDescription className="text-center">
            Vous avez sélectionné le profil "Structure d'accompagnement". 
            <br/><br/>
            Pour commencer à accompagner des entrepreneurs, configurez votre organisation en quelques étapes simples.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-aurentia-pink/10 flex items-center justify-center text-aurentia-pink font-semibold text-xs">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Informations de base</p>
                <p className="text-gray-600">Nom, logo et description de votre structure</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-aurentia-pink/10 flex items-center justify-center text-aurentia-pink font-semibold text-xs">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Coordonnées et localisation</p>
                <p className="text-gray-600">Permettez aux entrepreneurs de vous trouver</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-aurentia-pink/10 flex items-center justify-center text-aurentia-pink font-semibold text-xs">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Visibilité et préférences</p>
                <p className="text-gray-600">Choisissez si votre organisation est publique</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Plus tard
          </Button>
          <Button
            onClick={onStartSetup}
            className="w-full sm:w-auto bg-aurentia-pink hover:bg-aurentia-pink/90"
          >
            Créer mon organisation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationSetupGuideModal;
