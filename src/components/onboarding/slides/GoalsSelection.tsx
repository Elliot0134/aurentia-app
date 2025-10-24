import { motion } from 'framer-motion';
import { UserType, EntrepreneurGoal, StructureGoal } from '@/types/onboarding';
import {
  CheckCircle2,
  Map,
  Bot,
  Wand2,
  Zap,
  Users,
  FileText,
  BookOpen,
  Building,
  Target,
  UserPlus,
  Shield,
  Award,
} from 'lucide-react';

interface GoalsSelectionProps {
  userType: UserType;
  selectedGoals: (EntrepreneurGoal | StructureGoal)[];
  onToggle: (goal: EntrepreneurGoal | StructureGoal) => void;
}

const GoalsSelection = ({
  userType,
  selectedGoals,
  onToggle,
}: GoalsSelectionProps) => {
  const entrepreneurGoals = [
    {
      id: 'validate_idea' as EntrepreneurGoal,
      label: 'Valider mon idée',
      icon: CheckCircle2,
    },
    {
      id: 'plan_before_launch' as EntrepreneurGoal,
      label: 'Tout prévoir avant de lancer',
      icon: Target,
    },
    { id: 'roadmap' as EntrepreneurGoal, label: 'Roadmap', icon: Map },
    { id: 'ai_assistant' as EntrepreneurGoal, label: 'Assistant IA', icon: Bot },
    { id: 'ai_tools' as EntrepreneurGoal, label: 'Outils IA', icon: Wand2 },
    {
      id: 'automations' as EntrepreneurGoal,
      label: 'Automatisations',
      icon: Zap,
    },
    {
      id: 'find_providers' as EntrepreneurGoal,
      label: 'Trouver des prestataires',
      icon: Users,
    },
    { id: 'templates' as EntrepreneurGoal, label: 'Templates', icon: FileText },
    {
      id: 'resources' as EntrepreneurGoal,
      label: 'Ressources',
      icon: BookOpen,
    },
    {
      id: 'find_structures' as EntrepreneurGoal,
      label: "Chercher des structures d'accompagnement",
      icon: Building,
    },
  ];

  const structureGoals = [
    {
      id: 'receive_applications' as StructureGoal,
      label: 'Recevoir plus de candidatures',
      icon: UserPlus,
    },
    {
      id: 'manage_members' as StructureGoal,
      label: 'Gérer mes adhérents',
      icon: Users,
    },
    {
      id: 'relieve_team' as StructureGoal,
      label: "Soulager l'équipe",
      icon: Shield,
    },
    {
      id: 'find_mentors' as StructureGoal,
      label: 'Trouver des mentors',
      icon: Award,
    },
  ];

  const goals =
    userType === 'structure' ? structureGoals : entrepreneurGoals;

  const isGoalSelected = (goalId: EntrepreneurGoal | StructureGoal) =>
    selectedGoals.includes(goalId);

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Que souhaitez-vous faire avec Aurentia ?
        </h1>
        <p className="text-[#333333] font-poppins">Sélectionnez tout ce qui s'applique</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {goals.map((goal, index) => {
          const Icon = goal.icon;
          const isSelected = isGoalSelected(goal.id);

          return (
            <motion.button
              key={goal.id}
              onClick={() => onToggle(goal.id)}
              className={`relative rounded-2xl p-6 transition-all duration-150 ${
                isSelected
                  ? 'bg-[#FF6B35] text-white shadow-[0_8px_30px_rgb(255,107,53,0.25)]'
                  : 'bg-white text-[#333333] ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.03,
                ease: 'easeOut',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="flex flex-col items-center justify-center text-center gap-3"
                whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                animate={{ scale: isSelected ? 1.05 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <motion.div
                  className={`p-3 rounded-xl ${
                    isSelected ? 'bg-white/20' : 'bg-gray-100'
                  }`}
                  animate={{
                    rotate: isSelected ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : ''}`} />
                </motion.div>
                <span className="text-sm font-poppins font-semibold">{goal.label}</span>
              </motion.div>
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsSelection;
