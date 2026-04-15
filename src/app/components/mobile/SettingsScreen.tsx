import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Moon,
  Bell,
  Shield,
  Eye,
  Volume2,
  Smartphone,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTheme } from '../../contexts/ThemeContext';

interface Setting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'darkMode',
      label: 'Dark Mode',
      description: 'Use dark theme for comfortable reading',
      icon: <Moon className="w-5 h-5" />,
      enabled: isDarkMode,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Get notified about new content and streaks',
      icon: <Bell className="w-5 h-5" />,
      enabled: true,
    },
    {
      id: 'privacyMode',
      label: 'Privacy Mode',
      description: 'Hide your activity from others',
      icon: <Shield className="w-5 h-5" />,
      enabled: false,
    },
    {
      id: 'autoplay',
      label: 'Autoplay Videos',
      description: 'Automatically play video content',
      icon: <Eye className="w-5 h-5" />,
      enabled: true,
    },
    {
      id: 'sound',
      label: 'Sound Effects',
      description: 'Play sounds for interactions',
      icon: <Volume2 className="w-5 h-5" />,
      enabled: true,
    },
  ]);

  const [contentPreference, setContentPreference] = useState<'growth' | 'relax'>('growth');

  const toggleSetting = (id: string) => {
    if (id === 'darkMode') {
      toggleDarkMode();
      setSettings((prev) =>
        prev.map((setting) =>
          setting.id === id ? { ...setting, enabled: !isDarkMode } : setting
        )
      );
    } else {
      setSettings((prev) =>
        prev.map((setting) =>
          setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
        )
      );
    }
  };

  return (
    <div className={`h-full overflow-y-auto transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-b from-gray-900 to-gray-800'
        : 'bg-gradient-to-b from-white to-gray-50'
    }`}>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Settings
          </h1>
          <p className={`transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Customize your experience
          </p>
        </div>

        {/* Content Preference */}
        <motion.div
          className={`rounded-3xl p-6 shadow-lg mb-6 transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className={`text-lg font-bold mb-3 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Content Preference
          </h2>
          <p className={`text-sm mb-4 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Choose what type of content you want to see more
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setContentPreference('growth')}
              className={`p-4 rounded-2xl transition-all ${
                contentPreference === 'growth'
                  ? 'bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-2">🚀</div>
              <p className="font-bold text-sm">Growth</p>
              <p
                className={`text-xs mt-1 ${
                  contentPreference === 'growth' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                Challenging & inspiring
              </p>
            </button>
            <button
              onClick={() => setContentPreference('relax')}
              className={`p-4 rounded-2xl transition-all ${
                contentPreference === 'relax'
                  ? 'bg-gradient-to-br from-[#51CF66] to-[#34D399] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-2">🧘</div>
              <p className="font-bold text-sm">Relax</p>
              <p
                className={`text-xs mt-1 ${
                  contentPreference === 'relax' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                Calm & peaceful
              </p>
            </button>
          </div>
        </motion.div>

        {/* Settings List */}
        <motion.div
          className={`rounded-3xl p-6 shadow-lg mb-6 transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className={`text-lg font-bold mb-4 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Preferences
          </h2>
          <div className="space-y-4">
            {settings.map((setting, index) => (
              <motion.div
                key={setting.id}
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {setting.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {setting.label}
                    </p>
                    <p className={`text-xs transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {setting.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    setting.enabled
                      ? 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF]'
                      : isDarkMode
                        ? 'bg-gray-600'
                        : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          className={`rounded-3xl p-6 shadow-lg mb-6 transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={`text-lg font-bold mb-4 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Account
          </h2>
          <div className="space-y-3">
            <button className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Smartphone className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  App Version
                </p>
                <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  v1.0.0 (Latest)
                </p>
              </div>
            </button>

            <button className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <HelpCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Help & Support
                </p>
                <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get help with the app
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
              }`}
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-red-600 dark:text-red-400">Logout</p>
                <p className="text-xs text-red-400 dark:text-red-500">Sign out of your account</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          className={`rounded-2xl p-6 border transition-colors ${
            isDarkMode
              ? 'bg-purple-900/20 border-purple-700/30'
              : 'bg-gradient-to-br from-[#6C63FF]/10 to-[#3A86FF]/10 border-[#6C63FF]/20'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className={`text-sm text-center transition-colors ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <strong>Privacy First:</strong> Your data is encrypted and never sold. We respect your digital wellness journey.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
