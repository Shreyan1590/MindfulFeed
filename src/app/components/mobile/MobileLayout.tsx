import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  PlusSquare,
  BarChart3,
  Trophy,
  Flame,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  Search,
  Brain,
  Bell,
} from 'lucide-react';
import { QuickAccessMenu } from './QuickAccessMenu';

export function MobileLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: User, label: 'Profile', path: '/mobile/profile' },
    { icon: BarChart3, label: 'Dashboard', path: '/mobile/dashboard' },
    { icon: Trophy, label: 'Gamification', path: '/mobile/gamification' },
    { icon: Flame, label: 'Streaks', path: '/mobile/streaks' },
    { icon: Settings, label: 'Settings', path: '/mobile/settings' },
  ];

  const bottomNavItems = [
    { icon: Home, label: 'Feed', path: '/mobile/feed' },
    { icon: Search, label: 'Search', path: '/mobile/search' },
    { icon: PlusSquare, label: 'Upload', path: '/mobile/upload' },
    { icon: BarChart3, label: 'Stats', path: '/mobile/dashboard' },
    { icon: User, label: 'Profile', path: '/mobile/profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  const isFeedScreen = location.pathname === '/mobile/feed';

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl overflow-y-auto"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Drawer Header */}
              <div className="relative h-40 bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] p-6">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">MindfulFeed</h2>
                    <p className="text-white/80 text-sm">Level 12 • 2,340 XP</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">89%</p>
                    <p className="text-xs text-gray-600">Quality</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">7</p>
                    <p className="text-xs text-gray-600">Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">24</p>
                    <p className="text-xs text-gray-600">Badges</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Navigation
                </p>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl mb-2 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  );
                })}

                {/* Additional Options */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Account
                  </p>
                  <button
                    onClick={() => handleNavigation('/mobile/settings')}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl mb-2 text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold">Settings</span>
                  </button>
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>

                {/* App Version */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">MindfulFeed v1.0.0</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar - ALWAYS VISIBLE */}
      <div
        className={`fixed top-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-4 ${
          isFeedScreen
            ? 'bg-transparent'
            : 'bg-white border-b border-gray-200'
        }`}
      >
        {/* Left: Menu Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isFeedScreen
              ? 'bg-black/30 backdrop-blur-md text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Logo */}
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isFeedScreen ? 'bg-white/20 backdrop-blur-md' : 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF]'
            }`}
          >
            <Brain className={`w-5 h-5 ${isFeedScreen ? 'text-white' : 'text-white'}`} />
          </div>
          <h1
            className={`text-lg font-bold ${
              isFeedScreen
                ? 'text-white'
                : 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] bg-clip-text text-transparent'
            }`}
          >
            MindfulFeed
          </h1>
        </div>

        {/* Right: Notifications */}
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${
            isFeedScreen
              ? 'bg-black/30 backdrop-blur-md text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Main Content */}
      <div className="h-full pt-16 pb-20">
        <Outlet />
      </div>

      {/* Quick Access Floating Menu */}
      <QuickAccessMenu />

      {/* Bottom Navigation - ALWAYS VISIBLE */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 z-30 shadow-2xl">
        <div className="flex items-center justify-around h-full px-2">
          {bottomNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={index}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center min-w-[60px]"
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className={`p-2.5 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] shadow-lg'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs mt-1 font-semibold ${
                    isActive
                      ? 'text-[#6C63FF]'
                      : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}