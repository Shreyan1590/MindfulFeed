import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Home, Search, Upload, BarChart3, User, Trophy, Flame } from 'lucide-react';
import { useNavigate } from 'react-router';

export function QuickAccessMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const isPostDetail = location.pathname.includes('/mobile/post/');
  const bottomPos = isPostDetail ? 'bottom-80' : 'bottom-24';
  const menuBottomPos = isPostDetail ? 'bottom-[380px]' : 'bottom-40';

  const menuItems = [
    { icon: Home, label: 'Feed', path: '/mobile/feed', color: 'from-[#51CF66] to-[#34D399]' },
    { icon: Search, label: 'Search', path: '/mobile/search', color: 'from-[#3B82F6] to-[#60A5FA]' },
    { icon: Upload, label: 'Upload', path: '/mobile/upload', color: 'from-[#EAB308] to-[#FCD34D]' },
    { icon: BarChart3, label: 'Stats', path: '/mobile/dashboard', color: 'from-[#8B5CF6] to-[#A78BFA]' },
    { icon: Trophy, label: 'Rewards', path: '/mobile/gamification', color: 'from-[#F59E0B] to-[#FCD34D]' },
    { icon: Flame, label: 'Streaks', path: '/mobile/streaks', color: 'from-[#FF6B6B] to-[#FF8E53]' },
    { icon: User, label: 'Profile', path: '/mobile/profile', color: 'from-[#6C63FF] to-[#8B5CF6]' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${bottomPos} right-6 w-14 h-14 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] rounded-full shadow-2xl flex items-center justify-center z-50`}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Quick Access Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Items */}
            <motion.div
              className={`fixed ${menuBottomPos} right-6 z-50 flex flex-col gap-3`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center gap-3 group"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold text-sm shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: 10 }}
                      animate={{ x: 0 }}
                    >
                      {item.label}
                    </motion.span>
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full shadow-xl flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
