import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Garder le bouton Shadcn UI
import usePageTitle from '@/hooks/usePageTitle';

const WarningPage: React.FC = () => {
  usePageTitle("Avertissement");
  const navigate = useNavigate();

  const handleNewForm = () => {
    navigate('/individual/create-project-form');
  };

  const handleOldForm = () => {
    navigate('/individual/form-business-idea');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen animate-popup-appear">
      <div className="bg-white w-[95%] md:w-3/4 lg:w-2/3 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
        <AlertTriangle size={48} className="text-aurentia-pink mb-4" />
        <h1 className="text-3xl font-bold mb-2">Regardez la vidéo avant de commencer</h1>
        <div className="relative w-full mt-4 mx-auto" style={{ paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src="https://www.youtube.com/embed/IFsykJwBl7M?si=w6BErOIaedinIyvj"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
          ></iframe>
        </div>

        {/* Two button options */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          <Button
            onClick={handleNewForm}
            className="flex-1 px-6 py-4 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FF8A5B] hover:from-[#FF5722] hover:to-[#FF6B35] text-white text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Nouveau formulaire
          </Button>

          <Button
            onClick={handleOldForm}
            variant="outline"
            className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-lg font-semibold transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Formulaire classique
          </Button>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Recommandé : Essayez le nouveau formulaire avec sauvegarde automatique et design amélioré
        </p>
      </div>
    </div>
  );
};

export default WarningPage;
