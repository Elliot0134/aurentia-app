import React from 'react';
import { Database, FileText, Globe, Type } from 'lucide-react';

const KnowledgeBaseEmpty: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-aurentia-pink/10 to-aurentia-orange/10 flex items-center justify-center border-2 border-gray-200 shadow-lg">
          <Database className="w-12 h-12 text-aurentia-pink" />
        </div>
        {/* Floating icons */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center border border-gray-200 animate-bounce" style={{ animationDelay: '0.1s' }}>
          <FileText className="w-4 h-4 text-blue-500" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center border border-gray-200 animate-bounce" style={{ animationDelay: '0.2s' }}>
          <Globe className="w-4 h-4 text-green-500" />
        </div>
        <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center border border-gray-200 animate-bounce" style={{ animationDelay: '0.3s' }}>
          <Type className="w-4 h-4 text-purple-500" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Votre base de connaissance est vide
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6 leading-relaxed">
        Enrichissez votre projet en ajoutant des documents, du texte ou des liens web.
        Ces ressources aideront l'IA à mieux comprendre votre contexte.
      </p>

      {/* Quick action hints */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-4">
        <div className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-aurentia-pink/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aurentia-pink to-aurentia-orange flex items-center justify-center mb-2">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Ajoutez des URLs</span>
          <span className="text-xs text-gray-500 mt-1">Articles, docs web</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-aurentia-pink/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aurentia-pink to-aurentia-orange flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Importez des fichiers</span>
          <span className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-aurentia-pink/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aurentia-pink to-aurentia-orange flex items-center justify-center mb-2">
            <Type className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Créez du texte</span>
          <span className="text-xs text-gray-500 mt-1">Notes, contexte</span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseEmpty;
