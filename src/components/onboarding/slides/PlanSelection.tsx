import { motion } from 'framer-motion';
import { PlanType } from '@/types/onboarding';
import { Check } from 'lucide-react';

interface PlanSelectionProps {
  selectedPlan?: PlanType;
  onSelect: (plan: PlanType) => void;
}

const PlanSelection = ({ selectedPlan, onSelect }: PlanSelectionProps) => {
  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      features: [
        '1 projet',
        'Assistant IA basique',
        'Templates de base',
        'Support communautaire',
      ],
      popular: false,
    },
    {
      id: 'accessible' as PlanType,
      name: 'Accessible',
      price: '9€',
      period: '/mois',
      features: [
        'Projets illimités',
        'Assistant IA avancé',
        'Tous les templates premium',
        'Automatisations',
        'Roadmap interactive',
        'Support prioritaire',
        'Outils IA avancés',
        'Ressources exclusives',
      ],
      popular: true,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Choisissez votre plan
        </h1>
        <p className="text-[#333333] font-poppins">
          Commencez gratuitement, évoluez quand vous êtes prêt
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.button
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              className={`relative rounded-3xl p-8 text-left transition-all duration-150 ${
                plan.popular
                  ? isSelected
                    ? 'bg-[#FF6B35] text-white ring-4 ring-[#FF6B35] ring-offset-4 shadow-[0_20px_60px_rgb(255,107,53,0.3)]'
                    : 'bg-[#FF6B35] text-white shadow-[0_12px_40px_rgb(255,107,53,0.2)] hover:shadow-[0_20px_60px_rgb(255,107,53,0.3)]'
                  : isSelected
                  ? 'bg-white ring-4 ring-[#FF6B35] ring-offset-4 shadow-[0_20px_60px_rgb(0,0,0,0.15)]'
                  : 'bg-white ring-2 ring-gray-200 hover:ring-gray-300 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              whileTap={{ scale: 0.98 }}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-poppins font-semibold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  Recommandé
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                animate={{ scale: isSelected ? 1.02 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mb-6">
                <h3
                  className={`text-2xl font-poppins font-semibold mb-2 ${
                    plan.popular ? 'text-white' : 'text-[#333333]'
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-5xl font-poppins font-bold ${
                      plan.popular ? 'text-white' : 'text-[#333333]'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-lg font-poppins ${
                      plan.popular ? 'text-white/80' : 'text-[#333333]/70'
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1 + featureIndex * 0.05,
                    }}
                  >
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular ? 'bg-white/20' : 'bg-[#FF6B35]/10'
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.popular ? 'text-white' : 'text-[#FF6B35]'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-poppins ${
                        plan.popular ? 'text-white/90' : 'text-[#333333]'
                      }`}
                    >
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
              </motion.div>

              {isSelected && (
                <motion.div
                  className="absolute top-4 right-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-white' : 'bg-[#FF6B35]'
                    }`}
                  >
                    <Check
                      className={`w-5 h-5 ${
                        plan.popular ? 'text-[#FF6B35]' : 'text-white'
                      }`}
                    />
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelection;
