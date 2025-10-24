import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, BookOpen, Wrench, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

const QuickActionButton = ({ icon, label, onClick, className }: QuickActionButtonProps) => {
  return (
    <Button
      variant="outline"
      className={cn(
        "flex flex-col items-center justify-center h-24 hover:border-aurentia-pink hover:bg-aurentia-pink/5 transition-all",
        className
      )}
      onClick={onClick}
    >
      <div className="text-aurentia-pink mb-2">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};

interface QuickActionsPanelProps {
  className?: string;
}

export const QuickActionsPanel = ({ className }: QuickActionsPanelProps) => {
  const navigate = useNavigate();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Actions Rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <QuickActionButton
            icon={<MessageSquare className="h-6 w-6" />}
            label="Chatbot"
            onClick={() => navigate('/individual/chatbot')}
          />
          <QuickActionButton
            icon={<Plus className="h-6 w-6" />}
            label="Nouveau Projet"
            onClick={() => navigate('/individual/dashboard')} // Will trigger create project flow
          />
          <QuickActionButton
            icon={<BookOpen className="h-6 w-6" />}
            label="Ressources"
            onClick={() => navigate('/individual/ressources')}
          />
          <QuickActionButton
            icon={<Wrench className="h-6 w-6" />}
            label="Outils"
            onClick={() => navigate('/individual/outils')}
          />
          <QuickActionButton
            icon={<Target className="h-6 w-6" />}
            label="Plan d'Action"
            onClick={() => navigate('/individual/plan-action')}
          />
        </div>
      </CardContent>
    </Card>
  );
};
