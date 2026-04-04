import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Share2, Bookmark, Brain, Timer, TrendingUp, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { postsService, PostFeed } from '../../services/PostsService';

interface Post {
  id: string;
  image: string;
  title: string;
  caption: string;
  category: string;
  xp: number;
  attentionScore: number;
  contentQuality: 'productive' | 'neutral' | 'low-value' | 'harmful';
  authorName: string;
  authorLevel: number;
  liked: boolean;
  saved: boolean;
}

const contentQualityLabels = {
  productive: { label: 'Productive', color: 'bg-[#51CF66]', icon: '✓' },
  neutral: { label: 'Neutral', color: 'bg-[#EAB308]', icon: '○' },
  'low-value': { label: 'Low-Value', color: 'bg-[#FF6B6B]', icon: '⚠' },
  harmful: { label: 'Harmful', color: 'bg-[#DC2626]', icon: '✕' },
};

function mapApiPostToFeed(apiPost: PostFeed): Post {
  return {
    id: apiPost.id,
    image: apiPost.image_url,
    title: apiPost.title,
    caption: apiPost.caption,
    category: apiPost.category,
    xp: apiPost.xp,
    attentionScore: apiPost.attention_score,
    contentQuality: (apiPost.content_quality || 'productive') as Post['contentQuality'],
    authorName: apiPost.author_name || 'MindfulFeed Team',
    authorLevel: apiPost.author_level || 1,
    liked: false,
    saved: false,
  };
}

export function FeedScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [direction, setDirection] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEndOfFeed, setIsEndOfFeed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Fetch posts from backend on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const apiPosts = await postsService.fetchPosts();
      if (apiPosts.length > 0) {
        setPosts(apiPosts.map(mapApiPostToFeed));
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPost = posts[currentIndex];

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if end of feed (Disabled for unlimited feed)
  useEffect(() => {
    // We no longer stop at the end. We will loop or refetch.
  }, [currentIndex, posts.length]);

  // Touch handlers for swipe
  const handleSwipe = (newDirection: number) => {
    if (newDirection > 0) {
      // Swipe up (Next)
      if (currentIndex < posts.length - 1) {
        setDirection(1);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Loop back to start for 'Unlimited' feel
        setDirection(1);
        setCurrentIndex(0);
      }
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 1000);
    } else if (newDirection < 0 && currentIndex > 0) {
      // Swipe down (Prev)
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPosts();
    setCurrentIndex(0);
    setIsEndOfFeed(false);
    setIsRefreshing(false);
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
        {posts.length > 0 && (
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

              {/* Author & Creator Level */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                  By {currentPost.authorName}
                </span>
                <div className="w-1 h-1 bg-white/30 rounded-full" />
                <span className="text-[#EAB308] text-xs font-bold uppercase tracking-wider">
                  Level {currentPost.authorLevel} Creator
                </span>
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