import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CountryDropdown, Country } from '@/components/ui/country-dropdown';
import { OnboardingData } from '@/types/onboarding';

interface PersonalInfoProps {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: any) => void;
}

const PersonalInfo = ({ data, onChange }: PersonalInfoProps) => {
  const marketingCardRef = useRef<HTMLDivElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const languages = [
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  // Check if all 3 required fields are filled
  const hasFirstName = !!data.firstName && data.firstName.trim().length > 0;
  const hasBirthDate = !!(data.birthDate?.day && data.birthDate?.month && data.birthDate?.year);
  const hasCountry = !!data.country && data.country.length > 0;

  const allFieldsFilled = hasFirstName && hasBirthDate && hasCountry;

  // Auto-scroll to marketing card when it appears
  useEffect(() => {
    if (allFieldsFilled && marketingCardRef.current) {
      setTimeout(() => {
        const element = marketingCardRef.current;
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const scrollToPosition = absoluteElementTop - (window.innerHeight * 0.15);

          window.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth'
          });
        }
      }, 200);
    }
  }, [allFieldsFilled]);

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Aidez-nous à personnaliser votre expérience
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          marginBottom: allFieldsFilled ? '1.5rem' : 0
        }}
        transition={{
          duration: 0.6,
          delay: 0.1,
          marginBottom: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1]
          }
        }}
        className="space-y-8"
      >
        {/* Nom */}
        <div>
          <label className="block text-[17px] font-poppins font-semibold mb-3 text-[#333333] dark:text-white">
            Comment souhaitez-vous que l'on vous appelle ?
          </label>
          <Input
            value={data.firstName || ''}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="James"
            className="w-full h-14 text-lg font-poppins rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-all duration-300 placeholder:text-[#333333] placeholder:opacity-50"
          />
        </div>

        {/* Date de naissance */}
        <div>
          <label className="block text-[17px] font-poppins font-semibold mb-3 text-[#333333] dark:text-white">
            Quel est votre anniversaire ?
          </label>
          <div className="flex items-center gap-3">
            <Input
              ref={dayInputRef}
              type="number"
              value={data.birthDate?.day || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31 && value.length <= 2)) {
                  onChange('birthDate', { ...data.birthDate, day: value });
                  if (value.length === 2 && monthInputRef.current) {
                    monthInputRef.current.focus();
                  }
                }
              }}
              placeholder="JJ"
              min="1"
              max="31"
              className="h-14 text-lg font-poppins rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-all duration-300 placeholder:text-[#333333] placeholder:opacity-50 text-center flex-1"
            />
            <span className="text-2xl font-medium text-gray-400 dark:text-gray-500">/</span>
            <Input
              ref={monthInputRef}
              type="text"
              inputMode="numeric"
              value={data.birthDate?.month || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (/^\d{0,2}$/.test(value) && (value === '' || parseInt(value) <= 12))) {
                  onChange('birthDate', { ...data.birthDate, month: value });
                  if (value.length === 2 && yearInputRef.current) {
                    yearInputRef.current.focus();
                  }
                }
              }}
              placeholder="MM"
              maxLength={2}
              className="h-14 text-lg font-poppins rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-all duration-300 placeholder:text-[#333333] placeholder:opacity-50 text-center flex-1"
            />
            <span className="text-2xl font-medium text-gray-400 dark:text-gray-500">/</span>
            <Input
              ref={yearInputRef}
              type="number"
              value={data.birthDate?.year || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || value.length <= 4) {
                  onChange('birthDate', { ...data.birthDate, year: value });
                }
              }}
              placeholder="AAAA"
              min="1900"
              max={new Date().getFullYear()}
              className="h-14 text-lg font-poppins rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-all duration-300 placeholder:text-[#333333] placeholder:opacity-50 text-center flex-1"
            />
          </div>
        </div>

        {/* Pays */}
        <div>
          <label className="block text-[17px] font-poppins font-semibold mb-3 text-[#333333] dark:text-white">
            Dans quel pays êtes-vous ?
          </label>
          <CountryDropdown
            placeholder="Sélectionnez votre pays"
            defaultValue={data.country}
            onChange={(country: Country) => onChange('country', country.alpha3)}
          />
        </div>

        {/* Marketing opt-in */}
        {allFieldsFilled && (
          <motion.div
            ref={marketingCardRef}
            className="relative mt-6 mb-4 md:mb-0 group cursor-pointer overflow-hidden rounded-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
            onClick={() => onChange('marketingOptIn', !data.marketingOptIn)}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50"
              animate={{ opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/20 via-[#FF8A5B]/30 to-[#FF6B35]/20"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 100%' }}
            />
            <div className="absolute inset-0 rounded-2xl border-2 border-[#FF6B35]/50" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              animate={{ x: ['-150%', '150%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
              style={{ width: '50%' }}
            />

            <div className="relative p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-md bg-[#FF6B35]/30 blur-lg"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <Checkbox
                    checked={data.marketingOptIn || false}
                    onCheckedChange={(checked) => onChange('marketingOptIn', checked === true)}
                    className="relative mt-1 bg-white border-[#FF6B35] data-[state=checked]:bg-[#FF6B35] data-[state=checked]:border-[#FF6B35] w-6 h-6 transition-all duration-300 hover:scale-110"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <p className="font-poppins font-bold text-base text-[#2e333d] dark:text-white leading-relaxed">
                    🎉 Accédez en avant-première aux nouvelles fonctionnalités
                  </p>
                  <p className="text-sm font-poppins text-gray-600 dark:text-gray-400 leading-relaxed">
                    Rejoignez la communauté Aurentia et recevez en avant-première toutes les nouveautés entrepreneuriales
                  </p>

                  <div className="pt-3 opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-64 overflow-hidden transition-all duration-700 ease-in-out">
                    <div className="grid grid-cols-2 gap-3">
                      {['Outils IA', 'Automatisations', 'Ressources', 'Livrables', "Structure d'accompagnement", 'Prompt Library', 'Newsletter'].map((benefit) => {
                        const randomDelay = (Math.random() * 0.5).toFixed(2);
                        return (
                          <motion.span
                            key={benefit}
                            initial={{ scale: 0.85, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: parseFloat(randomDelay), duration: 0.4, type: 'spring', stiffness: 250, damping: 20 }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white border-2 border-[#FF6B35]/30 text-[#2e333d] text-sm font-semibold pointer-events-none"
                          >
                            {benefit}
                          </motion.span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PersonalInfo;
