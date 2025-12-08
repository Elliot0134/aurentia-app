import { motion } from 'framer-motion';
import { UserType } from '@/types/onboarding';

interface UserTypeSelectionProps {
  selectedType?: UserType;
  onSelect: (type: UserType) => void;
}

const UserTypeSelection = ({ selectedType, onSelect }: UserTypeSelectionProps) => {
  const userTypes = [
    {
      id: 'dreamer' as UserType,
      label: "J'ai un rêve",
      iconPath: '/icones/ampoule-icon.png',
      description: 'Vous avez une idée que vous souhaitez développer',
    },
    {
      id: 'entrepreneur' as UserType,
      label: 'Entrepreneur',
      iconPath: '/icones/fusee-icon.png',
      description: 'Vous avez déjà une entreprise ou un projet en cours',
    },
    {
      id: 'structure' as UserType,
      label: "Structure d'accompagnement",
      iconPath: '/icones/building-icon.png',
      description: 'Vous accompagnez des entrepreneurs',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Laquelle vous décrit le mieux ?
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {userTypes.map((type, index) => {
          const isSelected = selectedType === type.id;

          return (
            <motion.button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`relative rounded-2xl p-8 transition-all duration-150 ${
                isSelected
                  ? 'bg-white ring-2 ring-[#FF6B35] shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                  : 'bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="flex flex-col items-center text-center gap-4"
                whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                animate={{ scale: isSelected ? 1.05 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <motion.div
                  className={`p-5 rounded-xl overflow-hidden ${isSelected ? 'bg-[#FF6B35]/10' : 'bg-gray-100'}`}
                  animate={{
                    scale: isSelected ? [1, 1.1, 1] : 1,
                    rotate: isSelected ? [0, 5, -5, 0] : 0,
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <motion.img
                    src={type.iconPath}
                    alt={type.label}
                    className="w-20 h-20 object-contain"
                    whileHover={{ scale: 1.3 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </motion.div>
                <div>
                  <h3 className={`text-xl font-poppins font-semibold mb-2 ${isSelected ? 'text-[#FF6B35]' : 'text-[#333333]'}`}>
                    {type.label}
                  </h3>
                  <p className="text-sm font-poppins text-[#333333]">{type.description}</p>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default UserTypeSelection;
