import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DialogFooter } from "@/components/ui/dialog"; // Import DialogFooter
import { Button } from "@/components/ui/button"; // Import Button

const Ressources = () => {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="bg-gradient-primary text-transparent bg-clip-text text-3xl">Fonctionnalité à venir</DialogTitle>
            <Separator className="my-4" />
            <DialogDescription className="text-black">
              Découvrez une mine d'or de ressources pour booster votre productivité !
              <br /><br />
              ✅ <b>Templates Notion</b> - Pour une organisation impeccable de vos projets.
              <br /><br />
              ✅ <b>Templates Airtable</b> - Pour gérer vos bases de données avec efficacité.
              <br /><br />
              ✅ <b>Packs de Prompts</b> - Des prompts optimisés pour vos outils IA préférés.
              <br /><br />
              ✅ <b>Templates Canva</b> - Pour des designs percutants sans effort.
              <br /><br />
              ✅ <b>Bouts de code</b> - Des extraits prêts à l'emploi pour vos sites internet et applications.
              <br /><br />
              Avec Aurentia, accédez à des outils concrets pour concrétiser vos idées.
              <br />
              Soyez les premiers informés du lancement !
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild className="w-full">
              <a href="https://aurentia-ressource.fr" target="_blank" rel="noopener noreferrer">
                Accéder à Aurentia ressource
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Ressources Page</h1>
        <p>This is a placeholder for the Ressources content.</p>
      </div>
    </div>
  );
};

export default Ressources;
