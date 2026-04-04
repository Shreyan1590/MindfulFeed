import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  TrendingUp,
  Clock,
  Eye,
  MessageCircle,
  Sparkles,
  Award,
  ChevronDown,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { EnhancedAICharacter } from './EnhancedAICharacter';
import { aiTranslationService, ArticleAnalysis } from '../../services/AITranslationService';
import { ttsService } from '../../services/TextToSpeechService';
import { AudioControlsPanel } from './AudioControlsPanel';
import { postsService, PostDetail } from '../../services/PostsService';

export function PostDetailScreen() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Fetch post from backend
  useEffect(() => {
    if (!postId) return;
    const loadPost = async () => {
      setIsLoadingPost(true);
      const fetchedPost = await postsService.fetchPost(postId);
      if (fetchedPost) {
        setPost(fetchedPost);
        performAnalysis(fetchedPost);
      }
      setIsLoadingPost(false);
    };
    loadPost();
  }, [postId, selectedLanguage]);

  const performAnalysis = async (currentPost: PostDetail) => {
    setIsAnalyzing(true);
    try {
      const result = await aiTranslationService.analyzeArticle(
        currentPost.content,
        currentPost.id.toString(),
        selectedLanguage
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleAudio = async () => {
    if (isAudioPlaying) {
      ttsService.stop();
      setIsAudioPlaying(false);
    } else {
      if (!analysis) return;
      setIsAudioLoading(true);
      try {
        await ttsService.speak(analysis.summary, selectedLanguage);
        setIsAudioPlaying(true);
      } catch (error) {
        console.error('Audio failed:', error);
      } finally {
        setIsAudioLoading(false);
      }
    }
  };

  const handleReplayAudio = async () => {
    ttsService.stop();
    setIsAudioPlaying(false);
    setTimeout(handleToggleAudio, 100);
  };

  useEffect(() => {
    // Track scroll progress
    const handleScroll = () => {
      const scrollElement = document.getElementById('post-content');
      if (scrollElement) {
        const scrollTop = scrollElement.scrollTop;
        const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setReadProgress(Math.min(progress, 100));
      }
    };

    const scrollElement = document.getElementById('post-content');
    scrollElement?.addEventListener('scroll', handleScroll);
    return () => scrollElement?.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6C63FF] border-t-transparent" />
      </div>
    );
  }

  const qualityInfo = {
    label: post.attention_score >= 0.9 ? 'Productive' : post.attention_score >= 0.75 ? 'Neutral' : 'Low-Value',
    color: post.attention_score >= 0.9 ? 'bg-[#51CF66]' : post.attention_score >= 0.75 ? 'bg-[#FFD93D]' : 'bg-[#FF6B6B]',
    icon: post.attention_score >= 0.9 ? '🎯' : post.attention_score >= 0.75 ? '📊' : '⚠️',
  };

  return (
    <div className="relative h-full bg-white">
      {/* Read Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] z-50 origin-left"
        style={{ scaleX: readProgress / 100 }}
      />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 z-40">
        <div className="h-full flex items-center justify-between px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setLiked(!liked)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
              />
            </motion.button>

            <motion.button
              onClick={() => setSaved(!saved)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-50 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark
                className={`w-5 h-5 ${saved ? 'fill-blue-500 text-blue-500' : 'text-gray-700'}`}
              />
            </motion.button>

            <motion.button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            className="fixed top-20 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            {['Twitter', 'Facebook', 'LinkedIn', 'Copy Link'].map((platform) => (
              <button
                key={platform}
                className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700"
                onClick={() => setShowShareMenu(false)}
              >
                Share on {platform}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div id="post-content" className="h-full overflow-y-auto pb-24">
        {/* Hero Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Quality Badge */}
          <div className="absolute top-4 left-4">
            <div className={`${qualityInfo.color} rounded-full px-4 py-2 flex items-center gap-2 shadow-lg`}>
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">
                {qualityInfo.icon} {qualityInfo.label}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
              <span className="text-white text-sm font-bold">{post.category}</span>
            </div>
          </div>
        </div>

        {/* Article Info */}
        <div className="px-6 py-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* AI Insights Section */}
          <AnimatePresence>
            {analysis && (
              <motion.div 
                className="mb-8 p-4 bg-purple-50 rounded-2xl border-2 border-purple-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-purple-900">Buddy's Quick Insights</h4>
                  <div className="ml-auto bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    AI POWERED
                  </div>
                </div>
                <p className="text-purple-800 text-sm leading-relaxed mb-4 italic">
                  "{analysis.summary}"
                </p>
                <div className="space-y-2">
                  {analysis.keyPoints.slice(0, 2).map((point, i) => (
                    <div key={i} className="flex gap-2 text-xs text-purple-700 bg-white/50 p-2 rounded-lg">
                      <span>🎯</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Caption */}
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {post.caption}
          </p>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {post.author_avatar && (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-bold text-gray-900">{post.author_name}</p>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#EAB308]" />
                  <span className="text-sm text-gray-600">Level {post.author_level}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#51CF66]" />
                <span className="text-sm font-bold text-gray-900">
                  {(post.attention_score * 100).toFixed(0)}% Quality
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{post.read_time}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-semibold">{post.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">{post.comments}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#EAB308] rounded-full px-3 py-1">
              <Award className="w-4 h-4 text-black" />
              <span className="text-sm font-bold text-black">+{post.xp} XP</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none mb-8">
            {post.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h1 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    {paragraph.replace('# ', '')}
                  </h1>
                );
              } else if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              } else if (paragraph.startsWith('- ')) {
                return (
                  <li key={index} className="text-gray-700 leading-relaxed ml-6">
                    {paragraph.replace('- ', '')}
                  </li>
                );
              } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <p key={index} className="font-bold text-gray-900 mt-4">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                );
              } else if (paragraph.trim()) {
                return (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              }
              return null;
            })}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition-all cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>


        </div>
      </div>

      {/* Scroll to Top Button */}
      {readProgress > 20 && (
        <motion.button
          onClick={() => {
            document.getElementById('post-content')?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] rounded-full shadow-2xl flex items-center justify-center z-40"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown className="w-6 h-6 text-white rotate-180" />
        </motion.button>
      )}

      {/* Floating Audio Controls */}
      {analysis && (
        <AudioControlsPanel
          isPlaying={isAudioPlaying}
          isLoading={isAudioLoading}
          onPlayPause={handleToggleAudio}
          onReplay={handleReplayAudio}
          title={post.title}
        />
      )}

      {/* AI Buddy Character */}
      <EnhancedAICharacter article={{
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category
      }} />
    </div>
  );
}