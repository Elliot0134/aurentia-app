
import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const Automatisations = () => {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="bg-gradient-primary text-transparent bg-clip-text text-3xl">Fonctionnalité à venir</DialogTitle>
            <Separator className="my-4" />
            <DialogDescription className="text-black">
              Imaginez...
              <br /><br />
              ✅ <b>Votre veille stratégique automatisée</b> - Concurrence, réglementation et opportunités détectées en temps réel
              <br /><br />
              ✅ <b>Votre marketing en pilote automatique</b> - Articles de blog hebdomadaires, contenu social et campagnes email personnalisées
              <br /><br />
              ✅ <b>Votre gestion simplifiée</b> - Facturation, synchronisation CRM/comptabilité et reporting automatiques
              <br /><br />
              ✅ <b>Votre assistant entrepreneurial IA</b> - Recommandations stratégiques et optimisations basées sur vos données
              <br /><br />
              Avec Aurentia, pendant que l'IA gère le quotidien, vous développez votre vision.
              <br />
              Soyez les premiers informés du lancement !
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Automatisations</h1>
        
        <div className="mb-8">
          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <AlertCircle size={20} className="text-blue-500" />
            <p className="text-blue-700 text-sm">Les automatisations vous permettent de connecter vos outils préférés à Aurentia et d'automatiser vos flux de travail.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Automatisations disponibles</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-4">
              <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
                <FileText size={24} className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">Synchronisation de documents</h3>
                <p className="text-sm text-gray-600">Synchronisez automatiquement vos documents avec votre stockage préféré</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">À venir</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-4">
              <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
                <FileText size={24} className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">Notifications intelligentes</h3>
                <p className="text-sm text-gray-600">Recevez des notifications personnalisées sur vos projets</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">À venir</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
                <FileText size={24} className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">Export de données</h3>
                <p className="text-sm text-gray-600">Exportez vos données vers des formats standards</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">À venir</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-primary rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Augmentez votre productivité</h2>
            <p className="mb-6">
              Les automatisations Aurentia vous permettent de gagner du temps et de vous concentrer sur ce qui compte.
            </p>
            
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-1">Planifiez vos analyses</h3>
              <p className="text-sm opacity-80">Programmez des analyses automatiques de vos projets</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-1">Intégrez vos outils</h3>
              <p className="text-sm opacity-80">Connectez Aurentia à vos applications préférées</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-medium mb-1">Personnalisez vos workflows</h3>
              <p className="text-sm opacity-80">Créez des workflows sur mesure pour votre entreprise</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium">Cette fonctionnalité sera bientôt disponible</h3>
            <p className="text-gray-600 mt-1 mb-4 max-w-md mx-auto">
              Nos équipes travaillent actuellement sur le développement des automatisations. Restez informés des nouveautés à venir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automatisations;
