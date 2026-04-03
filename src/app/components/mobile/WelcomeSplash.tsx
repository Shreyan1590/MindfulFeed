import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Zap, Trophy, Target } from 'lucide-react';

interface WelcomeSplashProps {
  onComplete: () => void;
}

export function WelcomeSplash({ onComplete }: WelcomeSplashProps) {
  const [step, setStep] = useState(0);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Every post is analyzed for quality and meaning',
      color: 'from-[#6C63FF] to-[#3A86FF]',
    },
    {
      icon: Sparkles,
      title: 'Mindful Consumption',
      description: 'Break free from doom-scrolling habits',
      color: 'from-[#51CF66] to-[#34D399]',
    },
    {
      icon: Trophy,
      title: 'Gamification Rewards',
      description: 'Earn XP, unlock badges, and level up',
      color: 'from-[#EAB308] to-[#FCD34D]',
    },
    {
      icon: Zap,
      title: 'Track Your Progress',
      description: 'See your attention scores and analytics',
      color: 'from-[#3B82F6] to-[#60A5FA]',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < features.length) {
        setStep(step + 1);
      } else {
        setTimeout(onComplete, 1000);
      }
    }, step === 0 ? 2000 : 2500);

    return () => clearTimeout(timer);
  }, [step, features.length, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#6C63FF] via-[#3A86FF] to-[#6366F1] z-50 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 2px, transparent 2px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg">
        {step === 0 ? (
          // Logo Intro
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <motion.div
              className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Brain className="w-16 h-16 text-white" strokeWidth={2} />
            </motion.div>
            <h1 className="text-5xl font-bold text-white mb-3">MindfulFeed</h1>
            <p className="text-white/80 text-lg">Intelligent Social Media Platform</p>
          </motion.div>
        ) : (
          // Features
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {step <= features.length && (() => {
                const feature = features[step - 1];
                const Icon = feature.icon;
                return (
                  <>
                    <div
                      className={`w-24 h-24 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl`}
                    >
                      <Icon className="w-12 h-12 text-white" strokeWidth={2} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                      {feature.title}
                    </h2>
                    <p className="text-white/80 text-xl">{feature.description}</p>
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Progress Dots */}
        {step > 0 && step <= features.length && (
          <div className="flex justify-center gap-2 mt-12">
            {features.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === step - 1
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/30'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
