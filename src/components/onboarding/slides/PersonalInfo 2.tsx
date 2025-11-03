import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/types/onboarding';

interface PersonalInfoProps {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: any) => void;
}

const PersonalInfo = ({ data, onChange }: PersonalInfoProps) => {
  const languages = [
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
  ];

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
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
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
            Quelle est votre date de naissance ?
          </label>
          <Input
            type="date"
            value={
              data.birthDate?.year && data.birthDate?.month && data.birthDate?.day
                ? `${data.birthDate.year}-${String(data.birthDate.month).padStart(2, '0')}-${String(data.birthDate.day).padStart(2, '0')}`
                : ''
            }
            onChange={(e) => {
              const dateValue = e.target.value;
              if (dateValue) {
                const [year, month, day] = dateValue.split('-');
                onChange('birthDate', {
                  year,
                  month,
                  day,
                });
              }
            }}
            className="h-14 text-lg font-poppins rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-all duration-300"
          />
        </div>

        {/* Langue préférée */}
        <div>
          <label className="block text-[17px] font-poppins font-semibold mb-3 text-[#333333] dark:text-white">
            Quelle est votre langue préférée ?
          </label>
          <Select
            value={data.preferredLanguage || 'fr'}
            onValueChange={(value) => onChange('preferredLanguage', value)}
          >
            <SelectTrigger className="h-14 text-lg font-poppins rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="font-poppins">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Marketing opt-in */}
        <div className="flex items-start gap-3 pt-4">
          <Checkbox
            checked={data.marketingOptIn || false}
            onCheckedChange={(checked) =>
              onChange('marketingOptIn', checked === true)
            }
            className="mt-1 border-gray-300 data-[state=checked]:bg-[#FF6B35] data-[state=checked]:border-[#FF6B35]"
          />
          <div className="text-sm font-poppins text-[#333333] dark:text-gray-300 leading-relaxed">
            <p>
              Je souhaite recevoir des mises à jour, des offres spéciales et des
              e-mails promotionnels. Se désabonner à tout moment.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalInfo;
