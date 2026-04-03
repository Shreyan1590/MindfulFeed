import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router';

const loadingMessages = [
  'Preparing your feed...',
  'Analyzing your behavior...',
  'Curating mindful content...',
  'Loading your progress...',
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => navigate('/mobile/feed'), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#6C63FF] via-[#3A86FF] to-[#6366F1] flex items-center justify-center">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with Glow */}
        <motion.div
          className="relative mb-8"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-white/30 rounded-full blur-3xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="relative w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40">
            <Brain className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        {/* App Name */}
        <h1 className="text-white text-4xl font-bold mb-2">MindfulFeed</h1>
        <p className="text-white/80 text-sm mb-12">Focus on what matters</p>

        {/* Progress Circle */}
        <div className="relative w-32 h-32 mb-8">
          <svg className="w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="white"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              style={{
                pathLength: progress / 100,
                strokeDasharray: 2 * Math.PI * 56,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Loading Message */}
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-white text-lg font-medium"
        >
          {loadingMessages[messageIndex]}
        </motion.p>
      </div>
    </div>
  );
}
