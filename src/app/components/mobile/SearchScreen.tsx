import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, Sparkles, Heart, Brain, Dumbbell, Globe, X } from 'lucide-react';
import { useNavigate } from 'react-router';

const categories = [
  { name: 'Wellness', icon: Heart, color: 'from-[#FF6B6B] to-[#FF8E53]', posts: 1247 },
  { name: 'Technology', icon: Brain, color: 'from-[#6C63FF] to-[#3A86FF]', posts: 2891 },
  { name: 'Learning', icon: Sparkles, color: 'from-[#EAB308] to-[#FCD34D]', posts: 1634 },
  { name: 'Fitness', icon: Dumbbell, color: 'from-[#51CF66] to-[#34D399]', posts: 982 },
  { name: 'Travel', icon: Globe, color: 'from-[#3B82F6] to-[#60A5FA]', posts: 756 },
  { name: 'Science', icon: TrendingUp, color: 'from-[#8B5CF6] to-[#A78BFA]', posts: 1123 },
];

const trending = [
  'Mindful productivity',
  'AI innovation',
  'Mental health tips',
  'Sustainable living',
  'Remote work strategies',
];

const recentSearches = [
  'meditation techniques',
  'healthy recipes',
  'morning routines',
];

export function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/mobile/search-results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/mobile/search-results?category=${encodeURIComponent(categoryName)}`);
  };

  const handleTrendingClick = (trend: string) => {
    navigate(`/mobile/search-results?q=${encodeURIComponent(trend)}`);
  };

  const handleRecentSearchClick = (search: string) => {
    navigate(`/mobile/search-results?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-y-auto">
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover</h1>
          <p className="text-gray-600">Find meaningful content</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for topics, categories..."
            className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 outline-none focus:border-[#6C63FF] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Trending Searches */}
        {!searchQuery && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-[#6C63FF]" />
              <h2 className="text-lg font-bold text-gray-900">Trending Now</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trending.map((term, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleTrendingClick(term)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-[#6C63FF] hover:text-[#6C63FF] transition-all"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {term}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Searches</h2>
            <div className="space-y-2">
              {recentSearches.map((term, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleRecentSearchClick(term)}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl hover:bg-gray-50 transition-all text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 font-medium">{term}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: searchQuery ? 0 : 0.2 }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={index}
                  className={`relative bg-gradient-to-br ${category.color} rounded-3xl p-6 shadow-lg overflow-hidden`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (searchQuery ? 0 : 0.3) + index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }}
                    />
                  </div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{category.name}</h3>
                    <p className="text-white/80 text-sm">
                      {category.posts.toLocaleString()} posts
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}