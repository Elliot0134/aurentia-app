import { motion } from 'framer-motion';
import { DiscoverySource as DiscoverySourceType } from '@/types/onboarding';
import {
  Mic,
  Newspaper,
  Mail,
  GraduationCap,
  Briefcase,
  Music,
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
  Search,
  HelpCircle,
  MoreHorizontal,
} from 'lucide-react';

interface DiscoverySourceProps {
  selectedSource?: DiscoverySourceType;
  onSelect: (source: DiscoverySourceType) => void;
}

const DiscoverySource = ({ selectedSource, onSelect }: DiscoverySourceProps) => {
  const sources = [
    { id: 'linkedin' as DiscoverySourceType, label: 'LinkedIn', icon: Linkedin },
    {
      id: 'instagram' as DiscoverySourceType,
      label: 'Instagram',
      icon: Instagram,
    },
    { id: 'youtube' as DiscoverySourceType, label: 'YouTube', icon: Youtube },
    { id: 'tiktok' as DiscoverySourceType, label: 'TikTok', icon: Music },
    {
      id: 'friends_school' as DiscoverySourceType,
      label: 'Amis',
      icon: GraduationCap,
    },
    { id: 'google' as DiscoverySourceType, label: 'Google', icon: Search },
    { id: 'other' as DiscoverySourceType, label: 'Autre', icon: MoreHorizontal },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Comment avez-vous entendu parler d'Aurentia ?
      </motion.h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {sources.map((source, index) => {
          const Icon = source.icon;
          const isSelected = selectedSource === source.id;

          return (
            <motion.button
              key={source.id}
              onClick={() => onSelect(source.id)}
              className={`relative rounded-2xl p-6 transition-all duration-150 ${
                isSelected
                  ? 'bg-white ring-2 ring-[#FF6B35] shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                  : 'bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]'
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
                    isSelected ? 'bg-[#FF6B35]/10' : 'bg-gray-100'
                  }`}
                  animate={{
                    scale: isSelected ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isSelected ? 'text-[#FF6B35]' : 'text-gray-700'
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-sm font-poppins font-semibold ${
                    isSelected ? 'text-[#FF6B35]' : 'text-[#333333]'
                  }`}
                >
                  {source.label}
                </span>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DiscoverySource;
