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
      <DialogContent className="w-[90vw] rounded-lg max-h-[80vh] overflow-y-auto"> {/* Added max-h and overflow-y-auto */}
        <DialogHeader>
          <DialogTitle className="bg-gradient-primary text-transparent bg-clip-text text-3xl">Fonctionnalité à venir</DialogTitle> {/* Added styling from Ressources.tsx */}
          <Separator className="my-4" /> {/* Added Separator */}
          <DialogDescription className="text-black"> {/* Added styling from Ressources.tsx */}
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">Fermer</Button> {/* Added styling from Ressources.tsx */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonDialog;
