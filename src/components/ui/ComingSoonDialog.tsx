import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'; // Changed from alert-dialog to dialog
import { Separator } from './separator'; // Added Separator
import { Button } from './button'; // Added Button

interface ComingSoonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  description: string | React.ReactNode; // Added description prop
}

const ComingSoonDialog: React.FC<ComingSoonDialogProps> = ({ isOpen, onClose, description }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full mx-auto rounded-lg"> {/* Petit et centré */}
        <DialogHeader className="text-center">
          <DialogTitle className="bg-gradient-primary text-transparent bg-clip-text text-xl">Fonctionnalité à venir</DialogTitle> {/* Plus petit */}
          <DialogDescription className="text-black text-sm mt-2"> {/* Plus petit */}
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonDialog;
