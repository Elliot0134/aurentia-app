import { motion } from 'framer-motion';
import { ThemePreference } from '@/types/onboarding';
import { Moon, Sun } from 'lucide-react';

interface ThemeSelectionProps {
  selectedTheme?: ThemePreference;
  onSelect: (theme: ThemePreference) => void;
}

const ThemeSelection = ({ selectedTheme, onSelect }: ThemeSelectionProps) => {
  const themes = [
    {
      id: 'light' as ThemePreference,
      label: 'Clair',
      icon: Sun,
      gradient: 'from-gray-50 to-gray-200',
    },
    {
      id: 'dark' as ThemePreference,
      label: 'Sombre',
      icon: Moon,
      gradient: 'from-gray-800 to-gray-950',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Choisissez votre style
      </motion.h1>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {themes.map((theme, index) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;

          return (
            <motion.button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'ring-4 ring-[#FF6B35] ring-offset-4 shadow-2xl'
                  : 'ring-2 ring-gray-200 hover:ring-gray-300 shadow-lg hover:shadow-xl'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center py-6 px-6`}
              >
                <motion.div
                  className={`mb-2 p-3 rounded-xl ${
                    theme.id === 'light' ? 'bg-white/50' : 'bg-black/30'
                  }`}
                  animate={{
                    scale: isSelected ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className={`w-8 h-8 ${
                      theme.id === 'light' ? 'text-gray-800' : 'text-white'
                    }`}
                  />
                </motion.div>
                <div
                  className={`text-lg font-semibold ${
                    theme.id === 'light' ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {theme.label}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelection;
