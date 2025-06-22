import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const WarningPage: React.FC = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate('/form-business-idea');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white w-[95%] md:w-4/5 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
        <AlertTriangle size={48} className="text-aurentia-pink mb-4" />
        <h1 className="text-3xl font-bold mb-2">Regardez la vidéo avant de commencer</h1>
        <div className="relative w-full mt-4" style={{ paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src="https://www.youtube.com/embed/3XM_FKYTNmU"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
          ></iframe>
        </div>
        <button
          onClick={handleProceed}
          className="mt-4 px-4 py-2 rounded btn-primary text-base"
        >
          Continuer vers le formulaire
        </button>
      </div>
    </div>
  );
};

export default WarningPage;
