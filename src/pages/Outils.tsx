import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
