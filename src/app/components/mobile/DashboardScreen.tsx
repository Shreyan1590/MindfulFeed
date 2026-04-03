import { motion } from 'motion/react';
import { TrendingUp, Clock, Eye, Zap, RefreshCw } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

const usageData = [
  { day: 'Mon', minutes: 25 },
  { day: 'Tue', minutes: 32 },
  { day: 'Wed', minutes: 28 },
  { day: 'Thu', minutes: 35 },
  { day: 'Fri', minutes: 30 },
  { day: 'Sat', minutes: 22 },
  { day: 'Sun', minutes: 27 },
];

const qualityBreakdown = [
  { label: 'High Quality', value: 68, color: '#51CF66' },
  { label: 'Medium Quality', value: 24, color: '#EAB308' },
  { label: 'Low Quality', value: 8, color: '#FF6B6B' },
];

export function DashboardScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(true);
  const attentionScore = 0.85;

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-[#6C63FF] border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-600 font-semibold">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!hasData) {
    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Data Yet</h2>
          <p className="text-gray-600 mb-6">
            Start consuming content to see your analytics and insights here.
          </p>
          <button className="bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] text-white px-6 py-3 rounded-full font-bold">
            Browse Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-y-auto">
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Track your mindful consumption</p>
          </div>
          <button
            onClick={handleRefresh}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Attention Score Circle */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Attention Score
          </h2>
          <div className="relative w-48 h-48 mx-auto">
            {/* Background Circle */}
            <svg className="w-48 h-48 -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#E5E7EB"
                strokeWidth="16"
                fill="none"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="80"
                stroke="url(#gradient)"
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: attentionScore }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  strokeDasharray: 2 * Math.PI * 80,
                  strokeDashoffset: 2 * Math.PI * 80 * (1 - attentionScore),
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="100%" stopColor="#3A86FF" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-5xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', damping: 10 }}
              >
                {Math.round(attentionScore * 100)}
              </motion.span>
              <span className="text-gray-600 font-semibold mt-1">Score</span>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">
            You're consuming high-quality content! 🎉
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-[#6C63FF]" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Daily Usage</p>
            <p className="text-2xl font-bold text-gray-900">28m</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-12 h-12 bg-[#51CF66]/10 rounded-xl flex items-center justify-center mb-3">
              <Eye className="w-6 h-6 text-[#51CF66]" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Posts Viewed</p>
            <p className="text-2xl font-bold text-gray-900">24</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-12 h-12 bg-[#EAB308]/10 rounded-xl flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-[#EAB308]" />
            </div>
            <p className="text-gray-600 text-sm mb-1">XP Earned</p>
            <p className="text-2xl font-bold text-gray-900">480</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-12 h-12 bg-[#3A86FF]/10 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-[#3A86FF]" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Sessions</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </motion.div>
        </div>

        {/* Weekly Usage Chart */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Usage</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#6C63FF"
                  strokeWidth={3}
                  dot={{ fill: '#6C63FF', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2">
            {usageData.map((item) => (
              <span key={item.day} className="text-xs text-gray-600 font-semibold">
                {item.day}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Content Quality Breakdown */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Content Quality</h2>
          <div className="space-y-4">
            {qualityBreakdown.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-900 font-semibold">{item.label}</span>
                  <span className="text-gray-600 font-bold">{item.value}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}