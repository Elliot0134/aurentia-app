import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ChatDialogsProps {
  isRenameDialogOpen: boolean;
  setIsRenameDialogOpen: (open: boolean) => void;
  tempConversationName: string;
  setTempConversationName: (name: string) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export const ChatDialogs: React.FC<ChatDialogsProps> = ({
  isRenameDialogOpen,
  setIsRenameDialogOpen,
  tempConversationName,
  setTempConversationName,
  onSaveRename,
  onCancelRename,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onConfirmDelete,
  onCancelDelete,
}) => {
  return (
    <>
      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="w-[90vw] rounded-xl max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Renommer la conversation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="conversationName"
              value={tempConversationName}
              onChange={(e) => setTempConversationName(e.target.value)}
              className="rounded-lg"
              placeholder="Nom de la conversation"
            />
          </div>
          <DialogFooter className="flex-row justify-end space-x-2">
            <Button variant="outline" onClick={onCancelRename} className="rounded-lg">
              Annuler
            </Button>
            <Button onClick={onSaveRename} className="rounded-lg bg-gradient-primary">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[90vw] rounded-xl max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la conversation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.
            </p>
          </div>
          <DialogFooter className="flex-row justify-end space-x-2">
            <Button variant="outline" onClick={onCancelDelete} className="rounded-lg">
              Annuler
            </Button>
            <Button onClick={onConfirmDelete} variant="destructive" className="rounded-lg">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 