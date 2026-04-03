import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  Star,
  Crown,
  Zap,
  Target,
  BookOpen,
  Heart,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

const badges: Badge[] = [
  {
    id: 1,
    name: 'Early Bird',
    description: 'Read 5 articles before 9 AM',
    icon: <Star className="w-6 h-6" />,
    unlocked: true,
  },
  {
    id: 2,
    name: 'Knowledge Seeker',
    description: 'Complete 100 quality reads',
    icon: <BookOpen className="w-6 h-6" />,
    unlocked: true,
  },
  {
    id: 3,
    name: 'Wellness Warrior',
    description: 'Read 50 wellness articles',
    icon: <Heart className="w-6 h-6" />,
    unlocked: true,
  },
  {
    id: 4,
    name: 'Tech Explorer',
    description: 'Complete 30 tech reads',
    icon: <Zap className="w-6 h-6" />,
    unlocked: false,
    progress: 22,
    total: 30,
  },
  {
    id: 5,
    name: 'Consistency King',
    description: 'Maintain 30-day streak',
    icon: <Crown className="w-6 h-6" />,
    unlocked: false,
    progress: 14,
    total: 30,
  },
  {
    id: 6,
    name: 'Quality Champion',
    description: 'Maintain 90%+ quality score for 7 days',
    icon: <Trophy className="w-6 h-6" />,
    unlocked: false,
    progress: 5,
    total: 7,
  },
];

export function GamificationScreen() {
  const [currentXP, setCurrentXP] = useState(2480);
  const [currentLevel, setCurrentLevel] = useState(8);
  const [xpToNextLevel] = useState(520);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const xpProgress = (currentXP / (currentXP + xpToNextLevel)) * 100;

  const handleLevelUpDemo = () => {
    setShowLevelUp(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => setShowLevelUp(false), 3000);
  };

  return (
    <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-y-auto">
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gamification</h1>
          <p className="text-gray-600">Level up your mindful journey</p>
        </div>

        {/* Level Card */}
        <motion.div
          className="bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] rounded-3xl p-6 shadow-xl mb-6 text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />
          </div>

          <div className="relative z-10">
            {/* Level Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Current Level</p>
                  <p className="text-3xl font-bold">{currentLevel}</p>
                </div>
              </div>
              <button
                onClick={handleLevelUpDemo}
                className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-all"
              >
                Demo Level Up
              </button>
            </div>

            {/* XP Progress */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{currentXP} XP</span>
                <span className="font-semibold">{xpToNextLevel} to next level</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-10 h-10 bg-[#EAB308]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-[#EAB308]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">6</p>
            <p className="text-xs text-gray-600">Badges</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-[#6C63FF]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">14</p>
            <p className="text-xs text-gray-600">Streak</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-10 h-10 bg-[#51CF66]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-[#51CF66]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">85%</p>
            <p className="text-xs text-gray-600">Quality</p>
          </motion.div>
        </div>

        {/* Badges Section */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Achievement Badges</h2>
          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <motion.button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`relative rounded-2xl p-4 flex flex-col items-center ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-[#6C63FF] to-[#3A86FF]'
                    : 'bg-gray-100'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Badge Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                    badge.unlocked
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Badge Name */}
                <p
                  className={`text-xs font-semibold text-center ${
                    badge.unlocked ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {badge.name}
                </p>

                {/* Progress Bar for Locked Badges */}
                {!badge.unlocked && badge.progress && badge.total && (
                  <div className="w-full mt-2">
                    <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6C63FF] rounded-full"
                        style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Unlock Indicator */}
                {badge.unlocked && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-[#51CF66] rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] rounded-3xl p-12 text-center"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <motion.div
                className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Crown className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-3">Level Up!</h2>
              <p className="text-2xl text-white/90 mb-2">Level {currentLevel + 1}</p>
              <p className="text-white/80">You're on fire! Keep going!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm w-full"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  selectedBadge.unlocked
                    ? 'bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {selectedBadge.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {selectedBadge.name}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {selectedBadge.description}
              </p>
              {!selectedBadge.unlocked && selectedBadge.progress && selectedBadge.total && (
                <div>
                  <p className="text-sm text-gray-600 text-center mb-2">
                    Progress: {selectedBadge.progress} / {selectedBadge.total}
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] rounded-full"
                      style={{
                        width: `${
                          (selectedBadge.progress / selectedBadge.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {selectedBadge.unlocked && (
                <div className="bg-[#51CF66]/10 rounded-2xl p-4 text-center">
                  <p className="text-[#51CF66] font-bold">✓ Unlocked!</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
