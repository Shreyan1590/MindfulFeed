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
} from 'lucide-react';
import { AICharacterExplainer } from './AICharacterExplainer';

interface Post {
  id: number;
  title: string;
  caption: string;
  category: string;
  image: string;
  attentionScore: number;
  xp: number;
  readTime: string;
  views: number;
  comments: number;
  author: {
    name: string;
    avatar: string;
    level: number;
  };
  content: string;
  tags: string[];
  relatedPosts: number[];
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: 'The Future of AI in Daily Life',
    caption: 'How artificial intelligence is transforming the way we live, work, and connect with others.',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    attentionScore: 0.92,
    xp: 150,
    readTime: '8 min read',
    views: 12450,
    comments: 89,
    author: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      level: 24,
    },
    content: `
# Understanding AI Integration

Artificial Intelligence has become an integral part of our daily routines, often in ways we don't even realize. From personalized recommendations on streaming platforms to smart home devices that learn our preferences, AI is quietly revolutionizing modern life.

## The Morning Routine Revolution

Consider your morning routine. Your alarm clock might use AI to wake you during your lightest sleep phase. Your coffee maker can learn when you typically wake up and have your brew ready. Your news app curates articles based on your reading habits and interests.

## Work and Productivity

In the workplace, AI assists with:

- **Email Management**: Smart filtering and priority inbox
- **Calendar Optimization**: Suggesting meeting times based on everyone's schedule
- **Document Analysis**: Quickly summarizing long reports
- **Code Assistance**: Helping developers write better code faster

## Entertainment Personalization

Streaming services use sophisticated AI algorithms to understand not just what you watch, but when you watch it, how you watch it, and what mood you're likely in. This creates an increasingly personalized entertainment experience.

## Health and Wellness

AI-powered health apps can:
- Track your activity patterns
- Provide personalized workout recommendations
- Monitor sleep quality
- Suggest dietary improvements
- Even detect potential health issues early

## The Future Ahead

As AI continues to evolve, we'll see even deeper integration into our lives. Smart cities will optimize traffic flow, energy consumption will be managed more efficiently, and personalized education will adapt to each learner's pace and style.

## Ethical Considerations

With great power comes great responsibility. As we embrace AI, we must also consider:

- **Privacy**: How much data are we willing to share?
- **Bias**: Ensuring AI systems are fair and inclusive
- **Transparency**: Understanding how AI makes decisions
- **Control**: Maintaining human oversight

## Conclusion

The key to successfully integrating AI into our lives is finding the right balance between convenience and control, between automation and autonomy. As these technologies continue to develop, staying informed and engaged will be crucial.

The future is here, and it's powered by AI. The question isn't whether we'll use AI, but how we'll use it responsibly to enhance our lives while maintaining our humanity.
    `,
    tags: ['AI', 'Technology', 'Future', 'Innovation', 'Productivity'],
    relatedPosts: [2, 3, 4],
  },
  {
    id: 2,
    title: 'Mindful Living in a Digital Age',
    caption: 'Finding balance and peace in our hyper-connected world.',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1599036629621-07f8cb665695?w=800',
    attentionScore: 0.89,
    xp: 120,
    readTime: '6 min read',
    views: 8920,
    comments: 64,
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      level: 18,
    },
    content: `
# The Art of Mindful Digital Living

In today's hyper-connected world, finding moments of peace and mindfulness has become more important than ever. This guide explores practical strategies for maintaining mental wellness while navigating our digital landscape.

## Understanding Digital Overwhelm

The average person checks their phone 96 times per day. We're constantly bombarded with notifications, updates, and information. This constant connectivity can lead to:

- Increased anxiety and stress
- Reduced attention span
- Sleep disruption
- Decreased productivity
- Weakened personal relationships

## Setting Boundaries

Creating healthy digital boundaries is essential:

**Morning Routine**: Start your day without immediately checking your phone. Give yourself at least 30 minutes of screen-free time.

**Designated Digital-Free Zones**: Keep bedrooms, dining areas, and certain spaces free from devices.

**Notification Management**: Turn off non-essential notifications. You don't need to know every time someone likes your post.

## Mindful Consumption

Be intentional about your digital diet:

1. **Quality over Quantity**: Choose meaningful content over mindless scrolling
2. **Time Limits**: Set daily limits for social media apps
3. **Purpose-Driven Use**: Ask yourself why you're picking up your phone
4. **Scheduled Checks**: Batch your social media time instead of constant checking

## The Power of Presence

Practice being fully present in the moment:

- **Single-Tasking**: Focus on one thing at a time
- **Mindful Breaks**: Take regular breaks to breathe and reset
- **Nature Time**: Spend time outdoors without devices
- **Deep Conversations**: Have phone-free conversations with loved ones

## Digital Detox Strategies

Regular digital detoxes can reset your relationship with technology:

- **Weekend Retreats**: Plan device-free weekends
- **Evening Wind-Down**: No screens 1-2 hours before bed
- **Vacation Boundaries**: Limit work communication during time off
- **Social Media Breaks**: Take periodic breaks from platforms

## Cultivating Real Connections

Technology should enhance, not replace, human connection:

- Video calls are better than text
- Phone calls are better than messaging
- In-person meetings are best of all

## Conclusion

Mindful digital living isn't about rejecting technology—it's about using it intentionally. By creating boundaries, being selective about consumption, and prioritizing real-world connections, we can enjoy the benefits of our digital age while protecting our mental health and well-being.

Remember: You control technology, not the other way around.
    `,
    tags: ['Mindfulness', 'Wellness', 'Digital Health', 'Balance', 'Self-Care'],
    relatedPosts: [1, 5, 6],
  },
];

export function PostDetailScreen() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    // Find post by ID
    const foundPost = mockPosts.find(p => p.id === Number(postId));
    if (foundPost) {
      setPost(foundPost);
    } else {
      // If not found, use first post as default
      setPost(mockPosts[0]);
    }
  }, [postId]);

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
    label: post.attentionScore >= 0.9 ? 'Productive' : post.attentionScore >= 0.75 ? 'Neutral' : 'Low-Value',
    color: post.attentionScore >= 0.9 ? 'bg-[#51CF66]' : post.attentionScore >= 0.75 ? 'bg-[#FFD93D]' : 'bg-[#FF6B6B]',
    icon: post.attentionScore >= 0.9 ? '🎯' : post.attentionScore >= 0.75 ? '📊' : '⚠️',
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
      <div id="post-content" className="h-full overflow-y-auto pt-16 pb-24">
        {/* Hero Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={post.image}
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

          {/* Caption */}
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {post.caption}
          </p>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-900">{post.author.name}</p>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#EAB308]" />
                  <span className="text-sm text-gray-600">Level {post.author.level}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#51CF66]" />
                <span className="text-sm font-bold text-gray-900">
                  {(post.attentionScore * 100).toFixed(0)}% Quality
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
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

          {/* Related Posts */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 gap-4">
              {mockPosts.slice(0, 3).map((relatedPost) => (
                <button
                  key={relatedPost.id}
                  onClick={() => navigate(`/mobile/post/${relatedPost.id}`)}
                  className="flex gap-4 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-all text-left"
                >
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {relatedPost.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{relatedPost.readTime}</span>
                      <span>•</span>
                      <span>{relatedPost.category}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
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

      {/* AI Character Explainer - Kid-Friendly Learning Assistant */}
      <AICharacterExplainer articleTitle={post.title} />
    </div>
  );
}