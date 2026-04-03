import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Share2, Bookmark, Brain, Timer, TrendingUp, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Post {
  id: number;
  image: string;
  title: string;
  caption: string;
  category: string;
  xp: number;
  attentionScore: number;
  contentQuality: 'productive' | 'neutral' | 'low-value' | 'harmful';
  liked: boolean;
  saved: boolean;
}

const contentQualityLabels = {
  productive: { label: 'Productive', color: 'bg-[#51CF66]', icon: '✓' },
  neutral: { label: 'Neutral', color: 'bg-[#EAB308]', icon: '○' },
  'low-value': { label: 'Low-Value', color: 'bg-[#FF6B6B]', icon: '⚠' },
  harmful: { label: 'Harmful', color: 'bg-[#DC2626]', icon: '✕' },
};

const mockPosts: Post[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1764192114257-ae9ecf97eb6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'The Power of Mindful Breathing',
    caption: 'Discover how 5 minutes of mindful breathing can transform your day and reduce stress.',
    category: 'Wellness',
    xp: 15,
    attentionScore: 0.92,
    contentQuality: 'productive',
    liked: false,
    saved: false,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'The Future of AI Technology',
    caption: 'Exploring how artificial intelligence is reshaping our world and what it means for tomorrow.',
    category: 'Technology',
    xp: 20,
    attentionScore: 0.88,
    contentQuality: 'productive',
    liked: false,
    saved: false,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1598439473183-42c9301db5dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Mountain Meditation Retreat',
    caption: 'Find peace in nature with these stunning mountain meditation spots around the world.',
    category: 'Travel',
    xp: 18,
    attentionScore: 0.95,
    contentQuality: 'productive',
    liked: false,
    saved: false,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1608120663152-fe60f4f55fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Books That Changed My Life',
    caption: '10 powerful books that will transform your perspective and enhance your personal growth.',
    category: 'Learning',
    xp: 25,
    attentionScore: 0.91,
    contentQuality: 'productive',
    liked: false,
    saved: false,
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Morning Workout Routine',
    caption: 'Start your day with this energizing 15-minute workout routine that requires no equipment.',
    category: 'Fitness',
    xp: 22,
    attentionScore: 0.87,
    contentQuality: 'neutral',
    liked: false,
    saved: false,
  },
];

export function FeedScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState(mockPosts);
  const [direction, setDirection] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEndOfFeed, setIsEndOfFeed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const currentPost = posts[currentIndex];

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if end of feed
  useEffect(() => {
    if (currentIndex >= posts.length - 1) {
      setIsEndOfFeed(true);
    }
  }, [currentIndex, posts.length]);

  // Touch handlers for swipe
  const handleSwipe = (newDirection: number) => {
    if (newDirection > 0 && currentIndex < posts.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 1000);
      setIsEndOfFeed(false);
    } else if (newDirection < 0 && currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setIsEndOfFeed(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate loading new content
    setTimeout(() => {
      setIsRefreshing(false);
      setCurrentIndex(0);
      setIsEndOfFeed(false);
    }, 2000);
  };

  const toggleLike = () => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === currentPost.id ? { ...post, liked: !post.liked } : post
      )
    );
  };

  const toggleSave = () => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === currentPost.id ? { ...post, saved: !post.saved } : post
      )
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const qualityInfo = contentQualityLabels[currentPost?.contentQuality || 'neutral'];

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black overflow-hidden">
      {/* Post Content */}
      <AnimatePresence mode="wait" custom={direction}>
        {!isEndOfFeed ? (
          <motion.div
            key={currentPost.id}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (Math.abs(info.offset.y) > 100) {
                handleSwipe(info.offset.y > 0 ? -1 : 1);
              }
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentPost.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
            </div>

            {/* AI Content Quality Badge */}
            <motion.div
              className="absolute top-4 left-4 z-20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`${qualityInfo.color} rounded-full px-4 py-2 flex items-center gap-2 shadow-lg`}>
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-bold">
                  {qualityInfo.icon} {qualityInfo.label} Content
                </span>
              </div>
            </motion.div>

            {/* Session Timer - Top Right */}
            <div className="absolute top-4 right-4 z-20">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
                <Timer className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-semibold">{formatTime(sessionTime)}</span>
              </div>
            </div>

            {/* Content Info */}
            <div className="absolute bottom-4 left-0 right-0 z-20 p-6">
              {/* Category Tag */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] rounded-full px-4 py-2 mb-3">
                <span className="text-white text-sm font-bold">{currentPost.category}</span>
              </div>

              {/* Title */}
              <h2 className="text-white text-2xl font-bold mb-2 leading-tight">
                {currentPost.title}
              </h2>

              {/* Caption */}
              <p className="text-white/90 text-base mb-4 leading-relaxed">
                {currentPost.caption}
              </p>

              {/* Attention Score & XP */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
                  <TrendingUp className="w-4 h-4 text-[#51CF66]" />
                  <span className="text-white text-sm font-bold">
                    {(currentPost.attentionScore * 100).toFixed(0)}% Quality
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#EAB308] rounded-full px-4 py-2">
                  <span className="text-black text-sm font-bold">+{currentPost.xp} XP</span>
                </div>
              </div>

              {/* Read Full Article Button */}
              <motion.button
                onClick={() => navigate(`/mobile/post/${currentPost.id}`)}
                className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all"
                whileTap={{ scale: 0.95 }}
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Side Controls */}
            <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-6">
              {/* Like */}
              <motion.button
                onClick={toggleLike}
                className="flex flex-col items-center"
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={currentPost.liked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-8 h-8 ${
                      currentPost.liked ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </motion.div>
                <span className="text-white text-xs mt-1 font-semibold">
                  {currentPost.liked ? 'Liked' : 'Like'}
                </span>
              </motion.button>

              {/* Share */}
              <motion.button className="flex flex-col items-center" whileTap={{ scale: 0.9 }}>
                <Share2 className="w-8 h-8 text-white" />
                <span className="text-white text-xs mt-1 font-semibold">Share</span>
              </motion.button>

              {/* Save */}
              <motion.button
                onClick={toggleSave}
                className="flex flex-col items-center"
                whileTap={{ scale: 0.9 }}
              >
                <Bookmark
                  className={`w-8 h-8 ${
                    currentPost.saved ? 'fill-white text-white' : 'text-white'
                  }`}
                />
                <span className="text-white text-xs mt-1 font-semibold">
                  {currentPost.saved ? 'Saved' : 'Save'}
                </span>
              </motion.button>
            </div>

            {/* Progress Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6C63FF] to-[#3A86FF]"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentIndex + 1) / posts.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        ) : (
          // End of Feed State
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#6C63FF] to-[#3A86FF] flex items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-white text-3xl font-bold mb-3">You're All Caught Up!</h2>
              <p className="text-white/80 text-lg mb-8">
                You've reached the end of today's mindful content.
              </p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white text-[#6C63FF] px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 mx-auto hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {isRefreshing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Refresh Feed
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Gain Animation */}
      <AnimatePresence>
        {showXPAnimation && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1.5, y: -100 }}
            exit={{ opacity: 0, scale: 0.5, y: -200 }}
            transition={{ duration: 1 }}
          >
            <div className="bg-[#EAB308] rounded-full px-6 py-3 shadow-2xl">
              <span className="text-black text-2xl font-bold">+{currentPost?.xp} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Hint */}
      {currentIndex === 0 && !isEndOfFeed && (
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-white text-center bg-black/30 backdrop-blur-md rounded-full px-6 py-2">
            <p className="text-sm font-semibold">Swipe up for next post</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}