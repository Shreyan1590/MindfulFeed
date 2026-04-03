import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  LogIn,
  Loader,
  Home,
  Upload,
  BarChart3,
  Trophy,
  Flame,
  User,
  Search,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FlowStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  description: string;
  color: string;
}

const flowSteps: FlowStep[] = [
  {
    id: 'auth',
    title: 'Authentication',
    icon: <LogIn className="w-6 h-6" />,
    path: '/auth',
    description: 'Login or sign up with glass-morphic design',
    color: 'from-[#6C63FF] to-[#3A86FF]',
  },
  {
    id: 'loading',
    title: 'Loading',
    icon: <Loader className="w-6 h-6" />,
    path: '/loading',
    description: 'Beautiful loading experience with progress',
    color: 'from-[#3A86FF] to-[#6366F1]',
  },
  {
    id: 'feed',
    title: 'Feed',
    icon: <Home className="w-6 h-6" />,
    path: '/mobile/feed',
    description: 'Instagram Reels-style vertical feed with AI quality scores',
    color: 'from-[#51CF66] to-[#34D399]',
  },
  {
    id: 'upload',
    title: 'Upload',
    icon: <Upload className="w-6 h-6" />,
    path: '/mobile/upload',
    description: 'Content upload with real-time AI analysis feedback',
    color: 'from-[#EAB308] to-[#FCD34D]',
  },
  {
    id: 'search',
    title: 'Search',
    icon: <Search className="w-6 h-6" />,
    path: '/mobile/search',
    description: 'Discover content by categories and trending topics',
    color: 'from-[#3B82F6] to-[#60A5FA]',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <BarChart3 className="w-6 h-6" />,
    path: '/mobile/dashboard',
    description: 'Analytics with attention scores and usage stats',
    color: 'from-[#8B5CF6] to-[#A78BFA]',
  },
  {
    id: 'gamification',
    title: 'Gamification',
    icon: <Trophy className="w-6 h-6" />,
    path: '/mobile/gamification',
    description: 'XP, levels, badges with confetti animations',
    color: 'from-[#F59E0B] to-[#FCD34D]',
  },
  {
    id: 'streaks',
    title: 'Streaks',
    icon: <Flame className="w-6 h-6" />,
    path: '/mobile/streaks',
    description: 'Track daily activity streaks and milestones',
    color: 'from-[#FF6B6B] to-[#FF8E53]',
  },
  {
    id: 'profile',
    title: 'Profile',
    icon: <User className="w-6 h-6" />,
    path: '/mobile/profile',
    description: 'User profile with stats, badges, and activity',
    color: 'from-[#6C63FF] to-[#8B5CF6]',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings className="w-6 h-6" />,
    path: '/mobile/settings',
    description: 'Preferences and account management',
    color: 'from-[#64748B] to-[#94A3B8]',
  },
];

export function UserFlowGuide() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#6C63FF] via-[#3A86FF] to-[#6366F1] z-50 overflow-y-auto">
      <div className="min-h-screen p-6 pb-24">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <motion.div
            className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3">MindfulFeed</h1>
          <p className="text-white/80 text-lg mb-6">
            Complete Mobile App System with Full Product Architecture
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3">
            <span className="text-white font-semibold">10 Screens</span>
            <span className="text-white/60">•</span>
            <span className="text-white font-semibold">AI Intelligence</span>
            <span className="text-white/60">•</span>
            <span className="text-white font-semibold">Gamification</span>
          </div>
        </div>

        {/* Flow Steps */}
        <div className="max-w-4xl mx-auto space-y-6">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative">
                {/* Connector Line */}
                {index < flowSteps.length - 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full h-6 w-0.5 bg-white/20" />
                )}

                {/* Card */}
                <motion.button
                  onClick={() => navigate(step.path)}
                  className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      {step.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                          Screen {index + 1}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">{step.description}</p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-6 h-6 text-white/60 flex-shrink-0" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'AI Content Intelligence',
              description: 'Real-time quality analysis and feedback',
              icon: '🧠',
            },
            {
              title: 'Gamification System',
              description: 'XP, levels, badges, and streaks',
              icon: '🎮',
            },
            {
              title: 'Premium Animations',
              description: 'Motion-powered smooth transitions',
              icon: '✨',
            },
            {
              title: 'State Management',
              description: 'Loading, error, success, empty states',
              icon: '⚡',
            },
            {
              title: 'Responsive Design',
              description: 'Mobile-first, production-ready',
              icon: '📱',
            },
            {
              title: 'Full User Flow',
              description: 'Connected navigation system',
              icon: '🔗',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h4 className="text-white font-bold mb-2">{feature.title}</h4>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Start Button */}
        <motion.div
          className="max-w-4xl mx-auto mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <button
            onClick={() => navigate('/auth')}
            className="bg-white text-[#6C63FF] px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all"
          >
            Start Experience →
          </button>
          <p className="text-white/60 mt-4 text-sm">
            Begin with authentication or tap any screen above
          </p>
        </motion.div>
      </div>
    </div>
  );
}
