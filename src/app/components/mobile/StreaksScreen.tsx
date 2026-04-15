import { motion } from 'motion/react';
import { Flame, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const calendar = [
  { day: 'Mon', date: 27, active: true },
  { day: 'Tue', date: 28, active: true },
  { day: 'Wed', date: 29, active: true },
  { day: 'Thu', date: 30, active: true },
  { day: 'Fri', date: 31, active: true },
  { day: 'Sat', date: 1, active: true },
  { day: 'Sun', date: 2, active: true },
  { day: 'Mon', date: 3, active: true },
  { day: 'Tue', date: 4, active: true },
  { day: 'Wed', date: 5, active: true },
  { day: 'Thu', date: 6, active: true },
  { day: 'Fri', date: 7, active: true },
  { day: 'Sat', date: 8, active: true },
  { day: 'Sun', date: 9, active: true },
  { day: 'Mon', date: 10, active: false },
  { day: 'Tue', date: 11, active: false },
  { day: 'Wed', date: 12, active: false },
  { day: 'Thu', date: 13, active: false },
  { day: 'Fri', date: 14, active: false },
  { day: 'Sat', date: 15, active: false },
  { day: 'Sun', date: 16, active: false },
];

const milestones = [
  { days: 7, achieved: true },
  { days: 14, achieved: true },
  { days: 30, achieved: false },
  { days: 60, achieved: false },
  { days: 100, achieved: false },
];

export function StreaksScreen() {
  const { isDarkMode } = useTheme();
  const currentStreak = 14;
  const longestStreak = 21;

  return (
    <div className={`h-full overflow-y-auto transition-colors ${
      isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-white to-gray-50'
    }`}>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Streak
          </h1>
          <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Keep your momentum going!
          </p>
        </div>

        {/* Current Streak Card */}
        <motion.div
          className="bg-gradient-to-br from-[#FF6B6B] via-[#FF8E53] to-[#FFB64D] rounded-3xl p-8 shadow-xl mb-6 text-white relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, white 2px, transparent 2px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 text-center">
            {/* Flame Icon with Glow */}
            <motion.div
              className="relative inline-block mb-4"
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
                className="absolute inset-0 blur-2xl bg-white/50"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Flame className="w-20 h-20 text-white relative" strokeWidth={2} />
            </motion.div>

            {/* Streak Number */}
            <motion.h2
              className="text-6xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            >
              {currentStreak}
            </motion.h2>
            <p className="text-xl font-semibold mb-1">Day Streak</p>
            <p className="text-white/80">Don't break the chain!</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#6C63FF]" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Longest</p>
                <p className="text-2xl font-bold text-gray-900">{longestStreak}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">days in a row</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#51CF66]/10 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-[#51CF66]" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">active days</p>
          </motion.div>
        </div>

        {/* Calendar View */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Calendar</h2>
          <div className="grid grid-cols-7 gap-2">
            {calendar.map((day, index) => (
              <motion.div
                key={index}
                className="aspect-square"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.02 }}
              >
                <div className="h-full flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500 mb-1">{day.day}</span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                      day.active
                        ? 'bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {day.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Streak Milestones</h2>
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  milestone.achieved
                    ? 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF]'
                    : 'bg-gray-100'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      milestone.achieved
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <p
                      className={`font-bold ${
                        milestone.achieved ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {milestone.days} Day Streak
                    </p>
                    <p
                      className={`text-sm ${
                        milestone.achieved ? 'text-white/80' : 'text-gray-600'
                      }`}
                    >
                      {milestone.achieved ? 'Completed!' : 'Keep going!'}
                    </p>
                  </div>
                </div>
                {milestone.achieved && (
                  <motion.div
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1, type: 'spring' }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
                {!milestone.achieved && (
                  <div className="text-gray-400 text-sm font-semibold">
                    {milestone.days - currentStreak} days to go
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motivation */}
        <motion.div
          className="mt-6 bg-gradient-to-r from-[#FFB64D]/10 to-[#FF6B6B]/10 rounded-2xl p-6 border-2 border-[#FFB64D]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-gray-700 font-semibold text-center">
            🔥 You're on fire! Keep up the great work and reach your next milestone!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
