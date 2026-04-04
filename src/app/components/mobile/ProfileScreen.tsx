import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Edit, Award, Flame, TrendingUp, Calendar, BookOpen } from 'lucide-react';

export function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUserId = localStorage.getItem('mindfulfeed_userId') || 'user_dhilip_k';
        const res = await fetch(`https://mindfulfeed-worker.info-skillxpress.workers.dev/api/user/${storedUserId}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <motion.div
          className="w-12 h-12 border-4 border-[#6C63FF] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }
  return (
    <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-y-auto">
      <div className="p-6 pb-24">
        {/* Profile Header */}
        <motion.div
          className="bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] rounded-3xl p-8 shadow-xl mb-6 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
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

          <div className="relative z-10 flex flex-col items-center">
            {/* Profile Picture */}
            <div className="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1643656090647-ba85185222b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Edit className="w-4 h-4 text-[#6C63FF]" />
              </button>
            </div>

            {/* Name & Username */}
            <h1 className="text-2xl font-bold text-white mb-1">{user?.name || 'Explorer'}</h1>
            <p className="text-white/80 mb-4">@{user?.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}_mindful</p>

            {/* Level Badge */}
            <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-white" />
              <span className="text-white font-bold">Level {user.level} • {user.xp} XP</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#FF6B6B]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">14</p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#6C63FF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(user.attention_score * 100)}%</p>
                <p className="text-xs text-gray-600">Quality Score</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#51CF66]/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#51CF66]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">243</p>
                <p className="text-xs text-gray-600">Posts Read</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#EAB308]/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#EAB308]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">28</p>
                <p className="text-xs text-gray-600">Active Days</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Badges Section */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Badges</h2>
            <span className="text-sm text-gray-600 font-semibold">3 Unlocked</span>
          </div>
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] rounded-2xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#51CF66] to-[#34D399] rounded-2xl flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#EAB308] to-[#FCD34D] rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'Read "The Power of Mindful Breathing"', time: '2 hours ago', xp: 15 },
              { action: 'Unlocked Early Bird badge', time: '1 day ago', xp: 50 },
              { action: 'Completed 7-day streak', time: '2 days ago', xp: 100 },
              { action: 'Read "Future of AI Technology"', time: '3 days ago', xp: 20 },
            ].map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold text-sm">{activity.action}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
                <div className="bg-[#EAB308] rounded-full px-3 py-1">
                  <span className="text-black text-xs font-bold">+{activity.xp} XP</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
