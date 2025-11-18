import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  iconSrc: string;
  label: string;
  onClick: () => void;
  className?: string;
}

const QuickActionButton = ({ iconSrc, label, onClick, className }: QuickActionButtonProps) => {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center h-24 bg-[#f4f4f5] dark:bg-[#585a60] rounded-lg hover:bg-[#e8e8e9] dark:hover:bg-[#6a6d72] transition-all duration-200 cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <div className="mb-2 transition-transform duration-200 group-hover:scale-110">
        <img
          src={iconSrc}
          alt={label}
          className="h-10 w-10 object-contain"
        />
      </div>
      <span className="text-sm font-semibold text-[#2e333d] dark:text-[#f9f6f1]">{label}</span>
    </button>
  );
};

interface QuickActionsPanelProps {
  className?: string;
}

export const QuickActionsPanel = ({ className }: QuickActionsPanelProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("w-full", className)}>
      <h2 className="text-xl font-semibold text-[#2e333d] dark:text-[#f9f6f1] mb-4 font-sans">Actions Rapides</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <QuickActionButton
          iconSrc="/icones/chatbot-icon.png"
          label="Chatbot"
          onClick={() => navigate('/individual/chatbot')}
        />
        <QuickActionButton
          iconSrc="/icones/projet-icon.png"
          label="Nouveau Projet"
          onClick={() => navigate('/individual/dashboard')} // Will trigger create project flow
        />
        <QuickActionButton
          iconSrc="/icones/ressources-icon.png"
          label="Ressources"
          onClick={() => navigate('/individual/ressources')}
        />
        <QuickActionButton
          iconSrc="/icones-livrables/reglage-icon.png"
          label="Outils"
          onClick={() => navigate('/individual/outils')}
        />
        <QuickActionButton
          iconSrc="/icones/roadmap-icon.png"
          label="Plan d'Action"
          onClick={() => navigate('/individual/plan-action')}
        />
      </div>
    </div>
  );
};
