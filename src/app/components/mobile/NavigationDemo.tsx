import { motion } from 'motion/react';
import { Menu, Brain, Bell, Home, Search, PlusSquare, BarChart3, User, Plus, Check } from 'lucide-react';

export function NavigationDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Complete Mobile Navigation System
          </h1>
          <p className="text-white/80 text-lg">
            All navigation elements are ALWAYS visible and accessible
          </p>
        </div>

        {/* Navigation Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Top Navigation */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">1</span>
              </div>
              <h3 className="text-white text-xl font-bold">Top Navigation Bar</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Menu className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">MindfulFeed</span>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center relative">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>Menu button (opens sidebar)</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>MindfulFeed logo (center)</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>Notifications with badge</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Navigation */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">2</span>
              </div>
              <h3 className="text-white text-xl font-bold">Bottom Navigation</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-around">
                {[
                  { icon: Home, label: 'Feed', active: true },
                  { icon: Search, label: 'Search', active: false },
                  { icon: PlusSquare, label: 'Upload', active: false },
                  { icon: BarChart3, label: 'Stats', active: false },
                  { icon: User, label: 'Profile', active: false },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`p-2 rounded-xl ${
                          item.active
                            ? 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF]'
                            : 'bg-transparent'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            item.active ? 'text-white' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs mt-1 font-semibold ${
                          item.active ? 'text-[#6C63FF]' : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>5 main navigation tabs</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>Icons + labels for clarity</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>Active state highlighting</span>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Drawer */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">3</span>
              </div>
              <h3 className="text-white text-xl font-bold">Sidebar Drawer</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 mb-4 space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] rounded-xl">
                <User className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Profile</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <span className="text-gray-700 font-semibold">Dashboard</span>
              </div>
              <div className="text-center text-xs text-gray-500 pt-2">+ 3 more items</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>User info & stats header</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>All screen navigation</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>Settings & logout options</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Access FAB */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">4</span>
              </div>
              <h3 className="text-white text-xl font-bold">Quick Access Menu</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-center">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] rounded-full flex items-center justify-center shadow-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-16 right-0 flex flex-col gap-2">
                  {[
                    'bg-gradient-to-r from-[#51CF66] to-[#34D399]',
                    'bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]',
                    'bg-gradient-to-r from-[#EAB308] to-[#FCD34D]',
                  ].map((color, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 ${color} rounded-full shadow-lg opacity-80`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>Floating action button</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>7 quick access shortcuts</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Check className="w-4 h-4 text-[#51CF66]" />
                <span>Color-coded categories</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Features */}
        <motion.div
          className="bg-white rounded-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ✅ All Navigation Elements Are Always Visible
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">📱 Mobile-First Design</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Touch-friendly tap targets</li>
                <li>• Gesture-based interactions</li>
                <li>• Smooth animations</li>
                <li>• Responsive layouts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">🎯 Multiple Access Points</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Bottom navigation (main)</li>
                <li>• Sidebar drawer (full menu)</li>
                <li>• Quick access FAB (shortcuts)</li>
                <li>• Top bar (context)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">✨ Enhanced UX</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Active state highlighting</li>
                <li>• Visual feedback on tap</li>
                <li>• Clear navigation labels</li>
                <li>• Consistent positioning</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-white text-lg mb-4">
            Experience the complete mobile navigation system now!
          </p>
          <a
            href="/mobile/feed"
            className="inline-block bg-white text-[#6C63FF] px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all"
          >
            Launch Mobile App →
          </a>
        </div>
      </div>
    </div>
  );
}
