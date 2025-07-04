import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const Roadmap = () => {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Plan d'action</h1>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="bg-gradient-primary text-transparent bg-clip-text text-3xl">Fonctionnalité à venir</DialogTitle>
            <Separator className="my-4" />
            <DialogDescription className="text-black">
              Cette page présentera la feuille de route d'Aurentia, incluant les fonctionnalités à venir et les étapes de développement.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Content for the roadmap page will go here */}
      <p>Contenu de la page Plan d'action.</p>
    </div>
  );
};

export default Roadmap;
