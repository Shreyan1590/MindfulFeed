import { useState, useEffect } from 'react';
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
  Heart,
  MessageCircle,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { QuickAccessMenu } from './QuickAccessMenu';
import { useTheme } from '../../contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'streak' | 'badge' | 'trending';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ReactNode;
  color: string;
}

export function MobileLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      title: 'New Likes',
      message: 'Sarah and 12 others liked your post about mindfulness',
      time: '2m ago',
      read: false,
      icon: <Heart className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: '2',
      type: 'streak',
      title: 'Streak Alert! 🔥',
      message: "You're on a 7-day streak! Keep it up!",
      time: '1h ago',
      read: false,
      icon: <Flame className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: '3',
      type: 'badge',
      title: 'New Badge Earned',
      message: 'Congratulations! You earned the "Mindful Master" badge',
      time: '3h ago',
      read: false,
      icon: <Star className="w-5 h-5" />,
      color: 'from-yellow-500 to-amber-500',
    },
    {
      id: '4',
      type: 'comment',
      title: 'New Comment',
      message: 'Alex commented: "Great insights on meditation!"',
      time: '5h ago',
      read: true,
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: '5',
      type: 'trending',
      title: 'Trending Post',
      message: 'Your post is trending in #Mindfulness category',
      time: '1d ago',
      read: true,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-purple-500 to-indigo-500',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
    <div className={`relative h-screen overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
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
              className={`fixed left-0 top-0 bottom-0 w-[280px] z-50 shadow-2xl overflow-y-auto transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
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
              <div className={`p-4 border-b transition-colors ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>89%</p>
                    <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quality</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>7</p>
                    <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Streak</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24</p>
                    <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Badges</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                <p className={`text-xs font-bold uppercase tracking-wide mb-3 transition-colors ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
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
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  );
                })}

                {/* Additional Options */}
                <div className={`mt-6 pt-6 border-t transition-colors ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-3 transition-colors ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Account
                  </p>
                  <button
                    onClick={() => handleNavigation('/mobile/settings')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl mb-2 transition-all ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate('/');
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                      isDarkMode
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>

                {/* App Version */}
                <div className="mt-6 text-center">
                  <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    MindfulFeed v1.0.0
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar - ALWAYS VISIBLE */}
      <div
        className={`fixed top-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-4 transition-colors ${
          isFeedScreen
            ? 'bg-transparent'
            : isDarkMode
              ? 'bg-gray-800 border-b border-gray-700'
              : 'bg-white border-b border-gray-200'
        }`}
      >
        {/* Left: Menu Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isFeedScreen
              ? 'bg-black/30 backdrop-blur-md text-white'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1
            className={`text-lg font-bold ${
              isFeedScreen
                ? 'text-white'
                : isDarkMode
                  ? 'text-white'
                  : 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] bg-clip-text text-transparent'
            }`}
          >
            MindfulFeed
          </h1>
        </div>

        {/* Right: Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${
              isFeedScreen
                ? 'bg-black/30 backdrop-blur-md text-white hover:bg-black/40'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 2 }}
            >
              <Bell className="w-5 h-5" />
            </motion.div>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-[10px] font-bold px-1 shadow-lg"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsNotificationsOpen(false)}
                  className="fixed inset-0 z-40"
                />

                {/* Dropdown Panel */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute right-0 top-12 w-[calc(100vw-32px)] max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">Notifications</h3>
                          <p className="text-white/80 text-xs">
                            {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={markAllAsRead}
                          className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold hover:bg-white/30 transition-all"
                        >
                          Mark all read
                        </motion.button>
                      )}
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-2 right-20 w-2 h-2 bg-white/30 rounded-full" />
                    <div className="absolute bottom-3 right-32 w-3 h-3 bg-white/20 rounded-full" />
                    <div className="absolute top-4 right-40 w-1.5 h-1.5 bg-white/40 rounded-full" />
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 15 }}
                          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center"
                        >
                          <Bell className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                        </motion.div>
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">All caught up!</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">No new notifications</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.02)' }}
                            className={`p-3 rounded-2xl mb-2 cursor-pointer transition-all ${
                              !notification.read
                                ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-l-4 border-purple-500'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex gap-3">
                              {/* Icon */}
                              <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${notification.color} flex items-center justify-center text-white shadow-lg`}
                              >
                                {notification.icon}
                              </motion.div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className={`font-semibold text-sm ${
                                      !notification.read
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      {notification.time}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0 mt-1"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        // Navigate to notifications screen if you create one
                      }}
                      className="w-full py-2 text-center text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full pt-16 pb-20">
        <Outlet />
      </div>

      {/* Quick Access Floating Menu */}
      <QuickAccessMenu />

      {/* Bottom Navigation - ALWAYS VISIBLE */}
      <div className={`fixed bottom-0 left-0 right-0 h-20 z-30 shadow-2xl transition-colors ${
        isDarkMode
          ? 'bg-gray-800 border-t border-gray-700'
          : 'bg-white border-t border-gray-200'
      }`}>
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
                      isActive ? 'text-white' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs mt-1 font-semibold ${
                    isActive
                      ? 'text-[#6C63FF]'
                      : isDarkMode
                        ? 'text-gray-500'
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