import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Edit, Award, Flame, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { apiUrl, getStoredSession } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

export function ProfileScreen() {
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { userId, userName, isDemo } = getStoredSession();

        if (!userId) {
          setUser({
            name: userName || 'Explorer',
            level: 1,
            xp: 0,
            attention_score: 0,
          });
          return;
        }

        if (isDemo) {
          setUser({
            name: userName || 'Cosmic Explorer',
            level: 5,
            xp: 420,
            attention_score: 0.92,
          });
          return;
        }

        const res = await fetch(apiUrl(`/api/user/${userId}`));
        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setUser({
          name: 'Explorer',
          level: 1,
          xp: 0,
          attention_score: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading || !user) {
    return (
      <div className={`h-full flex items-center justify-center transition-colors ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <motion.div
          className="w-12 h-12 border-4 border-[#6C63FF] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }
  return (
    <div className={`h-full overflow-y-auto transition-colors ${
      isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-white to-gray-50'
    }`}>
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
          {[
            { icon: Flame, color: '#FF6B6B', bg: 'bg-[#FF6B6B]/10', value: '14', label: 'Day Streak', delay: 0.1 },
            { icon: TrendingUp, color: '#6C63FF', bg: 'bg-[#6C63FF]/10', value: `${Math.round(user.attention_score * 100)}%`, label: 'Quality Score', delay: 0.2 },
            { icon: BookOpen, color: '#51CF66', bg: 'bg-[#51CF66]/10', value: '243', label: 'Posts Read', delay: 0.3 },
            { icon: Calendar, color: '#EAB308', bg: 'bg-[#EAB308]/10', value: '28', label: 'Active Days', delay: 0.4 },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`rounded-2xl p-5 shadow-lg transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: stat.delay }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badges Section */}
        <motion.div
          className={`rounded-3xl p-6 shadow-lg mb-6 transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Badges
            </h2>
            <span className={`text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              3 Unlocked
            </span>
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
          className={`rounded-3xl p-6 shadow-lg transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className={`text-xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h2>
          <div className="space-y-3">
            {[
              { action: 'Read "The Power of Mindful Breathing"', time: '2 hours ago', xp: 15 },
              { action: 'Unlocked Early Bird badge', time: '1 day ago', xp: 50 },
              { action: 'Completed 7-day streak', time: '2 days ago', xp: 100 },
              { action: 'Read "Future of AI Technology"', time: '3 days ago', xp: 20 },
            ].map((activity, index) => (
              <motion.div
                key={index}
                className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="flex-1">
                  <p className={`font-semibold text-sm transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {activity.action}
                  </p>
                  <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activity.time}
                  </p>
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
