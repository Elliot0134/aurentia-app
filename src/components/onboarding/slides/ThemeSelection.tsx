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
    <div className="w-full max-w-4xl mx-auto px-6">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Choisissez votre style
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {themes.map((theme, index) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;

          return (
            <motion.button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'ring-4 ring-[#FF6B35] ring-offset-4 shadow-2xl'
                  : 'ring-2 ring-gray-200 hover:ring-gray-300 shadow-lg hover:shadow-xl'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center p-8`}
              >
                <motion.div
                  className={`mb-6 p-6 rounded-2xl ${
                    theme.id === 'light' ? 'bg-white/50' : 'bg-black/30'
                  }`}
                  animate={{
                    scale: isSelected ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className={`w-16 h-16 ${
                      theme.id === 'light' ? 'text-gray-800' : 'text-white'
                    }`}
                  />
                </motion.div>
                <div
                  className={`text-3xl font-semibold ${
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
