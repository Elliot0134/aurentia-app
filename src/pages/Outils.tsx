import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const toolsData = [
  { id: 1, name: "Rédaction mail de prospection", description: "Génère des e-mails de prospection personnalisés." },
  { id: 2, name: "Rédaction post marketing", description: "Crée des posts engageants pour les réseaux sociaux." },
  { id: 3, name: "Générateur d'idées de contenu", description: "Trouve des sujets pertinents pour votre audience." },
  { id: 4, name: "Analyse de sentiment client", description: "Évalue le sentiment des retours clients." },
];

const ToolCard = ({ tool }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold mb-2">{tool.name}</h2>
    <p className="text-gray-600">{tool.description}</p>
  </div>
);

const Outils = () => {
  const [filterText, setFilterText] = useState('');
  const [sortCriteria, setSortCriteria] = useState('name'); // Default sort by name
  const [showPopup, setShowPopup] = useState(true);

  const filteredTools = toolsData.filter(tool =>
    tool.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const sortedTools = filteredTools.sort((a, b) => {
    if (sortCriteria === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Add other sorting criteria here if needed
    return 0;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Outils</h1>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="bg-gradient-primary text-transparent bg-clip-text text-3xl">Fonctionnalité à venir</DialogTitle>
            <Separator className="my-4" />
            <DialogDescription className="text-black">

              Imaginez pouvoir en un clic, générer tout votre contenu marketing, analyser les risques liés à votre projet par rapport à une décision, analyser le sentiment des retours de vos utilisateurs, rédiger vos emails de prospection, et bien plus encore.
              <br /><br />
              C'est la vision d'Aurentia. Un écosystème 360° propulsé par l'IA, connecté à votre projet.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Card grid with filters and sorting will go here */}
      <div>
        {/* Placeholder for filters and sorting */}
        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="Filtrer les outils..."
            className="border rounded-md px-3 py-2 w-full md:w-1/3"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <Select value={sortCriteria} onValueChange={setSortCriteria}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Trier par nom</SelectItem>
              {/* Add other sorting options here if needed */}
            </SelectContent>
          </Select>
        </div>
        {/* Placeholder for the grid of cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Outils;
