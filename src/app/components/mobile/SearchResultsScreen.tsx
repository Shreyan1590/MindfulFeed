import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, TrendingUp, Heart, Bookmark, Clock } from 'lucide-react';

interface SearchPost {
  id: number;
  title: string;
  caption: string;
  category: string;
  image: string;
  attentionScore: number;
  xp: number;
  readTime: string;
  author: string;
}

const allPosts: SearchPost[] = [
  {
    id: 1,
    title: 'The Power of Mindful Breathing',
    caption: 'Discover how 5 minutes of mindful breathing can transform your day.',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1764192114257-ae9ecf97eb6f?w=400',
    attentionScore: 0.92,
    xp: 15,
    readTime: '5 min',
    author: 'Sarah Chen',
  },
  {
    id: 2,
    title: 'The Future of AI Technology',
    caption: 'Exploring how artificial intelligence is reshaping our world.',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
    attentionScore: 0.88,
    xp: 20,
    readTime: '8 min',
    author: 'Alex Thompson',
  },
  {
    id: 3,
    title: 'Mountain Meditation Retreat',
    caption: 'Find peace in nature with stunning mountain meditation spots.',
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1598439473183-42c9301db5dc?w=400',
    attentionScore: 0.95,
    xp: 18,
    readTime: '6 min',
    author: 'Emma Wilson',
  },
  {
    id: 4,
    title: 'Books That Changed My Life',
    caption: '10 powerful books for personal growth and transformation.',
    category: 'Learning',
    image: 'https://images.unsplash.com/photo-1608120663152-fe60f4f55fe3?w=400',
    attentionScore: 0.91,
    xp: 25,
    readTime: '10 min',
    author: 'Marcus Reid',
  },
  {
    id: 5,
    title: 'Morning Workout Routine',
    caption: 'Energizing 15-minute workout that requires no equipment.',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400',
    attentionScore: 0.87,
    xp: 22,
    readTime: '7 min',
    author: 'Jessica Park',
  },
  {
    id: 6,
    title: 'Climate Change Solutions',
    caption: 'Innovative approaches to tackling global warming.',
    category: 'Science',
    image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=400',
    attentionScore: 0.94,
    xp: 30,
    readTime: '12 min',
    author: 'Dr. James Foster',
  },
  {
    id: 7,
    title: 'Yoga for Beginners',
    caption: 'Start your yoga journey with these simple poses.',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    attentionScore: 0.89,
    xp: 16,
    readTime: '5 min',
    author: 'Lisa Martinez',
  },
  {
    id: 8,
    title: 'Machine Learning Basics',
    caption: 'Understanding the fundamentals of ML and AI.',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400',
    attentionScore: 0.90,
    xp: 28,
    readTime: '15 min',
    author: 'David Kumar',
  },
];

export function SearchResultsScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [filteredPosts, setFilteredPosts] = useState<SearchPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let results = allPosts;

      // Filter by category
      if (category) {
        results = results.filter(post => 
          post.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Filter by search query
      if (query) {
        results = results.filter(post =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.caption.toLowerCase().includes(query.toLowerCase()) ||
          post.category.toLowerCase().includes(query.toLowerCase()) ||
          post.author.toLowerCase().includes(query.toLowerCase())
        );
      }

      setFilteredPosts(results);
      setIsLoading(false);
    }, 500);
  }, [query, category]);

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">
              {category ? `${category} Posts` : query ? `Search: "${query}"` : 'All Posts'}
            </h1>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Searching...' : `${filteredPosts.length} results found`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              className="w-12 h-12 border-4 border-[#6C63FF] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.button
                key={post.id}
                onClick={() => navigate(`/mobile/post/${post.id}`)}
                className="w-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all text-left border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-white" />
                        <span className="text-white text-xs font-bold">
                          {(post.attentionScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] rounded-full px-3 py-1 mb-2 self-start">
                      <span className="text-white text-xs font-bold">{post.category}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    {/* Caption */}
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {post.caption}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-semibold">{post.author}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#EAB308] font-bold">+{post.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h2>
            <p className="text-gray-600 mb-6">
              {query 
                ? `No posts found for "${query}"`
                : `No posts found in ${category}`
              }
            </p>
            <button
              onClick={() => navigate('/mobile/search')}
              className="bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] text-white px-6 py-3 rounded-full font-bold"
            >
              Try Another Search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
