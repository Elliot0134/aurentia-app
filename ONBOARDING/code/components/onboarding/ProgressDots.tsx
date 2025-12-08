import { motion } from 'framer-motion';

interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressDots = ({ totalSteps, currentStep }: ProgressDotsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={`rounded-full transition-all duration-300 ${
            index === currentStep
              ? 'bg-gray-900 h-3 w-3'
              : 'bg-gray-300 h-2 w-2'
          }`}
          initial={{ scale: 0.8 }}
          animate={{
            scale: index === currentStep ? 1.2 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default ProgressDots;
