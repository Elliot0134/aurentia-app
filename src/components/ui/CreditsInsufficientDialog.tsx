import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'; // Assurez-vous que le chemin est correct pour votre bibliothèque de composants UI

interface CreditsInsufficientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creditsNeeded?: string;
}

export const CreditsInsufficientDialog: React.FC<CreditsInsufficientDialogProps> = ({ isOpen, onClose, creditsNeeded }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="w-[90vw] rounded-xl sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Crédits Insuffisants</AlertDialogTitle>
          <AlertDialogDescription>
            Il semble que vous n'ayez pas suffisamment de crédits pour effectuer cette action.
            {creditsNeeded && (
              <> Il vous manque environ <span className="font-bold text-red-600">{creditsNeeded}</span> crédits.</>
            )}
            Veuillez recharger vos crédits pour continuer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Compris</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
