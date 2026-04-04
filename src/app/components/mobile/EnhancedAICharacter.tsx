import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import {
  Sparkles,
  Award,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  MessageCircle,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Gift,
  Zap,
  Heart,
  Brain,
  Mic,
  Loader,
  Wand2,
  BookOpen,
  Target,
  Rocket,
  Eye,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { aiTranslationService } from '../../services/AITranslationService';
import { ttsService } from '../../services/TextToSpeechService';
import { ragService } from '../../services/RAGService';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  progress: number;
  target: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  points: number;
}

interface ArticleData {
  id: string;
  title: string;
  content: string;
  category: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
];

const initialBadges: Badge[] = [
  { id: 'curious-cat', name: 'Curious Cat', icon: '🐱', description: 'Asked a great question!', earned: false, progress: 0, target: 1 },
  { id: 'quick-learner', name: 'Quick Learner', icon: '⚡', description: 'Answered 3 questions correctly', earned: false, progress: 0, target: 3 },
  { id: 'knowledge-star', name: 'Knowledge Star', icon: '⭐', description: 'Read full article', earned: false, progress: 0, target: 1 },
  { id: 'language-lover', name: 'Language Lover', icon: '🌍', description: 'Learned in multiple languages', earned: false, progress: 0, target: 2 },
  { id: 'perfect-score', name: 'Perfect Score', icon: '🏆', description: 'Got all quiz questions right!', earned: false, progress: 0, target: 3 },
  { id: 'ai-master', name: 'AI Master', icon: '🤖', description: 'Used AI features 10 times', earned: false, progress: 0, target: 10 },
];

export function EnhancedAICharacter({ article }: { article: ArticleData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswered, setQuizAnswered] = useState<boolean[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bot'; text: string; timestamp: number }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [characterMood, setCharacterMood] = useState<'happy' | 'excited' | 'celebrating' | 'thinking'>('happy');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedBadgeForDetails, setSelectedBadgeForDetails] = useState<Badge | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const learnContentRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Load AI analysis and Greet user
  useEffect(() => {
    if (article && !aiAnalysis) {
      loadAIAnalysis();
    }
  }, [article]);

  useEffect(() => {
    if (isExpanded) {
      speakText("Hey there! I'm Buddy! Let's explore this together!", true);
    }
  }, [isExpanded]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Stop speaking when sound is disabled
  useEffect(() => {
    if (!soundEnabled && isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    }
  }, [soundEnabled]);

  // Scroll to top when badges panel is opened
  useEffect(() => {
    if (showBadges && learnContentRef.current) {
      learnContentRef.current.scrollTop = 0;
    }
  }, [showBadges]);

  // Helper: Speak text in current language
  const speakText = async (text: string, excited: boolean = false) => {
    if (!soundEnabled) return;
    
    try {
      setIsSpeaking(true);
      setCharacterMood('excited');
      
      // Remove emojis for cleaner speech
      const cleanText = text.replace(/[😊🤖💡✨🎉🦉🎯⭐🌟🔥💖🚀🌈]/g, '');
      
      if (excited) {
        await ttsService.speakExcited(cleanText, selectedLanguage.code);
      } else {
        await ttsService.speak(cleanText, selectedLanguage.code);
      }
      
      setCharacterMood('happy');
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Load AI-generated content analysis
  const loadAIAnalysis = async () => {
    setIsLoadingAI(true);
    setCharacterMood('thinking');
    
    try {
      // Use AI service to analyze article
      const [simplification, quiz, explanation] = await Promise.all([
        aiTranslationService.simplifyForKids({
          text: article.content,
          ageLevel: 10,
          language: selectedLanguage.code,
        }),
        aiTranslationService.generateQuizQuestions(
          article.content,
          selectedLanguage.code,
          'medium',
          3
        ),
        aiTranslationService.generateKidFriendlyExplanation(
          article.title,
          article.content,
          selectedLanguage.code
        ),
      ]);

      setAiAnalysis({
        simplification,
        explanation,
      });
      
      setQuizQuestions(quiz);
      setQuizAnswered(new Array(quiz.length).fill(false));
      
      incrementAIUsage();
      setCharacterMood('excited');
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setIsLoadingAI(false);
      setCharacterMood('happy');
    }
  };

  // Increment AI usage counter
  const incrementAIUsage = () => {
    const newCount = aiUsageCount + 1;
    setAiUsageCount(newCount);
    
    if (newCount >= 10) {
      earnBadge('ai-master');
      awardPoints(50);
    }
  };

  // Award points with animation
  const awardPoints = (points: number) => {
    setTotalPoints(prev => prev + points);
    setLastPointsEarned(points);
    setShowPointsAnimation(true);
    setCharacterMood('celebrating');
    setShowParticles(true);
    
    // Trigger celebration animation
    controls.start({
      scale: [1, 1.2, 1],
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.6 },
    });
    
    setTimeout(() => {
      setShowPointsAnimation(false);
      setCharacterMood('happy');
      setShowParticles(false);
    }, 2000);
  };

  // Earn badge
  const earnBadge = (badgeId: string) => {
    setBadges(prev => prev.map(badge => 
      badge.id === badgeId && !badge.earned ? { ...badge, earned: true } : badge
    ));
  };

  // Handle quiz answer
  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const question = quizQuestions[questionIndex];
    const isCorrect = answerIndex === question.correct;

    const newQuizAnswered = [...quizAnswered];
    newQuizAnswered[questionIndex] = true;
    setQuizAnswered(newQuizAnswered);

    if (isCorrect) {
      awardPoints(question.points);
      setCorrectAnswers(prev => prev + 1);

      // Check for badges
      if (correctAnswers + 1 >= 3) {
        earnBadge('quick-learner');
        speakText("Whoa! You're a quick learner!", true);
      }
      if (correctAnswers + 1 === quizQuestions.length) {
        earnBadge('perfect-score');
        awardPoints(50); // Bonus!
        speakText("Perfect score! You're amazing!", true);
      } else {
        speakText("That's right! Great job!", true);
      }
    } else {
      speakText("Oops, not quite! But keep trying, you're doing great!");
    }

    incrementAIUsage();
  };

  // Handle chat message with AI
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    const timestamp = Date.now();
    
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage, timestamp }]);
    setChatInput('');
    setCharacterMood('thinking');
    setIsLoadingAI(true);

    // Earn curious cat badge
    if (chatMessages.length === 0) {
      earnBadge('curious-cat');
      awardPoints(5);
    }

    try {
      // Convert internal chat messages to RAG history format
      const history: Array<{role: 'user' | 'assistant', content: string}> = chatMessages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Use AI RAG service with history for contextual continuity
      const response = await ragService.askQuestion(
        article.id,
        userMessage,
        history
      );
      
      const responseText = response.answer;
      
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        text: responseText,
        timestamp: Date.now()
      }]);
      
      // Speak the response in the current language
      if (soundEnabled) {
        speakText(responseText, true); // Use excited voice
      }
      
      awardPoints(5);
      incrementAIUsage();
      setCharacterMood('happy');
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        text: "Oops! I'm having trouble thinking right now. Try asking again! 🤔",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Handle language change
  const handleLanguageChange = async (lang: Language) => {
    setSelectedLanguage(lang);
    setShowLanguageMenu(false);
    setIsLoadingAI(true);
    setCharacterMood('thinking');
    
    if (lang.code !== 'en') {
      earnBadge('language-lover');
      awardPoints(10);
      speakText(`Cool! Let's learn in ${lang.name}!`, true);
    } else {
      speakText("Switching to English, sounds good!");
    }
    
    // Reload AI analysis in new language
    await loadAIAnalysis();
    
    setCharacterMood('excited');
    setIsLoadingAI(false);
  };

  // Voice input (simulated)
  const handleVoiceInput = () => {
    setIsListening(true);
    setCharacterMood('thinking');
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      setCharacterMood('happy');
      setChatInput("Tell me more about this topic!");
    }, 2000);
  };

  // Character animations based on mood
  const getCharacterAnimation = () => {
    switch (characterMood) {
      case 'happy':
        return { rotate: [0, -5, 5, 0], transition: { duration: 2, repeat: Infinity } };
      case 'excited':
        return { scale: [1, 1.1, 1], transition: { duration: 0.5, repeat: 3 } };
      case 'celebrating':
        return { rotate: [0, -15, 15, -15, 15, 0], scale: [1, 1.2, 1], transition: { duration: 0.6 } };
      case 'thinking':
        return { rotate: [0, 10, -10, 0], transition: { duration: 1, repeat: Infinity } };
      default:
        return {};
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Floating Particles */}
      <AnimatePresence>
        {showParticles && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i / 12) * Math.PI * 2) * 100,
                  y: Math.sin((i / 12) * Math.PI * 2) * 100,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Points Animation */}
      <AnimatePresence>
        {showPointsAnimation && (
          <motion.div
            className="absolute -top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-lg z-50"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.5 }}
          >
            +{lastPointsEarned} Points! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed top-4 left-4 right-4 bottom-24 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-pink-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border-4 border-purple-500/50 overflow-hidden flex flex-col z-[60]"
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            style={{
              boxShadow: '0 0 60px rgba(168, 85, 247, 0.6), 0 0 120px rgba(236, 72, 153, 0.4)',
            }}
          >
            {/* Animated Border Effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(90deg, #a855f7, #ec4899, #f59e0b, #a855f7)',
                backgroundSize: '300% 300%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            
            <div className="relative z-10 bg-gradient-to-br from-purple-900/98 via-blue-900/98 to-pink-900/98 rounded-3xl m-[3px] flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-4 relative overflow-hidden shrink-0">
                {/* Animated Background Pattern */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                  animate={{
                    x: [0, 20, 0],
                    y: [0, 20, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="text-5xl relative"
                        animate={controls}
                        style={{
                          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
                        }}
                      >
                        🦉
                        {/* Thinking dots */}
                        {characterMood === 'thinking' && (
                          <motion.div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-white rounded-full"
                                animate={{
                                  y: [0, -10, 0],
                                  opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                      <div>
                        <h3 className="text-white font-bold text-xl flex items-center gap-2">
                          Buddy AI
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                          </motion.div>
                        </h3>
                        <motion.p 
                          className="text-white/90 text-xs font-semibold"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {characterMood === 'thinking' ? '🤔 Analyzing...' : 
                           characterMood === 'celebrating' ? '🎉 Awesome!' : 
                           characterMood === 'excited' ? '✨ Ready to learn!' : 
                           '💡 Your AI Learning Friend'}
                        </motion.p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all backdrop-blur-sm"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Enhanced Points Display */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-white/30">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                      </motion.div>
                      <motion.span 
                        className="text-white font-bold text-lg"
                        key={totalPoints}
                        initial={{ scale: 1.5, color: '#fbbf24' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        transition={{ duration: 0.3 }}
                      >
                        {totalPoints}
                      </motion.span>
                      <span className="text-white/70 text-sm">Points</span>
                    </div>
                    
                    <motion.button
                      onClick={() => setShowBadges(!showBadges)}
                      className={`backdrop-blur-md rounded-full p-2 hover:bg-white/20 transition-all border relative ${
                        showBadges 
                          ? 'bg-yellow-500/30 border-yellow-400' 
                          : 'bg-white/10 border-white/30'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title={showBadges ? 'Hide Achievements' : 'Show Achievements'}
                    >
                      <Trophy className={`w-5 h-5 ${showBadges ? 'text-yellow-400' : 'text-yellow-300'}`} />
                      {badges.filter(b => b.earned).length > 0 && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {badges.filter(b => b.earned).length}
                        </motion.div>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        const newSound = !soundEnabled;
                        setSoundEnabled(newSound);
                        if (newSound) {
                          setTimeout(() => speakText("Voice on! I can talk now!"), 100);
                        }
                      }}
                      className="bg-white/10 backdrop-blur-md rounded-full p-2 hover:bg-white/20 transition-all border border-white/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-white" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-white" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Enhanced Badges Panel - Fully Expandable Dropdown */}
              <AnimatePresence>
                {showBadges && (
                  <motion.div
                    className="bg-gradient-to-br from-purple-800/90 to-pink-800/90 border-b border-purple-500/30"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="p-4">
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Your Achievements
                        <motion.span
                          className="ml-auto text-sm text-yellow-300 bg-yellow-500/20 px-3 py-1 rounded-full"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {badges.filter(b => b.earned).length}/{badges.length}
                        </motion.span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {badges.map((badge, index) => (
                          <motion.div
                            key={badge.id}
                            onClick={() => {
                              setSelectedBadgeForDetails(badge);
                              speakText(`Check it out! That's the ${badge.name} badge!`, true);
                            }}
                            className={`p-3 rounded-xl text-center relative overflow-hidden cursor-pointer ${
                              badge.earned 
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                                : 'bg-gray-700/50'
                            }`}
                            initial={{ opacity: 0, scale: 0, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0, y: 20 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            title={badge.description}
                          >
                            {badge.earned && (
                              <>
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  animate={{ x: ['-100%', '200%'] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                />
                                <motion.div
                                  className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.05 + 0.2 }}
                                >
                                  <span className="text-xs">✓</span>
                                </motion.div>
                              </>
                            )}
                            <div className="relative">
                              <motion.div
                                className="text-3xl mb-1"
                                animate={badge.earned ? { rotate: [0, 10, -10, 0] } : {}}
                                transition={{ duration: 0.5, repeat: badge.earned ? Infinity : 0, repeatDelay: 5 }}
                                style={{ filter: badge.earned ? 'none' : 'grayscale(100%) opacity(0.5)' }}
                              >
                                {badge.icon}
                              </motion.div>
                              <p className={`text-xs font-semibold ${badge.earned ? 'text-black' : 'text-gray-400'}`}>
                                {badge.name}
                              </p>
                              {!badge.earned && (
                                <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                  <motion.div
                                    className="bg-purple-400 h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(badge.progress / badge.target) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <AnimatePresence>
                        {selectedBadgeForDetails && (
                          <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBadgeForDetails(null)}
                          >
                            <motion.div
                              className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-3xl shadow-2xl border border-purple-500/50 w-full max-w-sm relative"
                              initial={{ scale: 0.8, y: 20 }}
                              animate={{ scale: 1, y: 0 }}
                              exit={{ scale: 0.8, y: 20 }}
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                onClick={() => setSelectedBadgeForDetails(null)}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                              >
                                <X className="w-5 h-5 text-white" />
                              </button>
                              
                              <div className="text-center">
                                <motion.div
                                  className="text-6xl mb-4 inline-block"
                                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  style={{ filter: selectedBadgeForDetails.earned ? 'none' : 'grayscale(100%) opacity(0.8)' }}
                                >
                                  {selectedBadgeForDetails.icon}
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2">{selectedBadgeForDetails.name}</h3>
                                <p className="text-purple-200 mb-6">{selectedBadgeForDetails.description}</p>
                                
                                <div className="bg-black/30 rounded-2xl p-4">
                                  <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="text-white">Progress</span>
                                    <span className="text-yellow-400">
                                      {selectedBadgeForDetails.progress} / {selectedBadgeForDetails.target}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                      className={`h-full ${selectedBadgeForDetails.earned ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-purple-400 to-pink-500'}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(selectedBadgeForDetails.progress / selectedBadgeForDetails.target) * 100}%` }}
                                      transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                  </div>
                                  {selectedBadgeForDetails.earned ? (
                                    <p className="mt-3 text-sm text-green-400 font-bold flex items-center justify-center gap-1">
                                      <Award className="w-4 h-4" /> Badge Earned!
                                    </p>
                                  ) : (
                                    <p className="mt-3 text-sm text-purple-300">
                                      Keep going to unlock this badge!
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Content Tabs */}
              {!showBadges && (
                <div className="bg-black/20 flex flex-col flex-1 min-h-0">
                  <div className="flex border-b border-purple-500/30 shrink-0">
                  <motion.button
                    onClick={() => {
                      setShowChat(false);
                      speakText("Let's look at the cool stuff we can learn!");
                    }}
                    className={`flex-1 py-3 font-semibold transition-all relative ${
                      !showChat
                        ? 'bg-purple-600/50 text-white'
                        : 'text-purple-300 hover:bg-purple-600/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Brain className="inline-block w-4 h-4 mr-2" />
                    AI Learn
                    {!showChat && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400"
                        layoutId="activeTab"
                      />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowChat(true);
                      speakText("I'm ready to chat! What's on your mind?");
                    }}
                    className={`flex-1 py-3 font-semibold transition-all relative ${
                      showChat
                        ? 'bg-purple-600/50 text-white'
                        : 'text-purple-300 hover:bg-purple-600/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="inline-block w-4 h-4 mr-2" />
                    AI Chat
                    {showChat && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400"
                        layoutId="activeTab"
                      />
                    )}
                  </motion.button>
                </div>

                {/* Learn Content */}
                {!showChat && (
                  <div ref={learnContentRef} className="pt-2 px-4 pb-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {/* Language Selector */}
                    <motion.div 
                      className="mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl px-4 py-3 font-bold flex items-center justify-between shadow-lg"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-2xl">{selectedLanguage.flag}</span>
                          <span>{selectedLanguage.name}</span>
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showLanguageMenu && (
                          <motion.div
                            className="mt-2 bg-purple-900/90 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-purple-500/50"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          >
                            {languages.map((lang, index) => (
                              <motion.button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang)}
                                className="w-full px-4 py-3 text-left hover:bg-purple-600/50 transition-all flex items-center gap-3 text-white"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 5 }}
                              >
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-semibold">{lang.name}</span>
                                {lang.code === selectedLanguage.code && (
                                  <motion.div
                                    className="ml-auto"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                  >
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                  </motion.div>
                                )}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {isLoadingAI ? (
                      <motion.div
                        className="flex flex-col items-center justify-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Brain className="w-16 h-16 text-purple-400 mb-4" />
                        </motion.div>
                        <p className="text-white font-bold text-lg mb-2">AI is analyzing...</p>
                        <p className="text-purple-300 text-sm">Making it fun for you! ✨</p>
                      </motion.div>
                    ) : aiAnalysis ? (
                      <div className="space-y-4">
                        {/* AI-Generated Simple Explanation */}
                        <motion.div
                          className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl p-4 border-2 border-blue-500/50"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">📖 Simple Version</h4>
                            <motion.div
                              className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              AI-Generated
                            </motion.div>
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed mb-3">
                            {aiAnalysis.simplification.simplifiedText}
                          </p>
                          
                          {/* Analogies */}
                          {aiAnalysis.simplification.analogies.length > 0 && (
                            <div className="space-y-2 mt-3">
                              <p className="text-blue-300 text-xs font-semibold flex items-center gap-1">
                                <Lightbulb className="w-4 h-4" />
                                Think of it like this:
                              </p>
                              {aiAnalysis.simplification.analogies.map((analogy: string, i: number) => (
                                <motion.div
                                  key={i}
                                  className="bg-blue-800/30 rounded-lg p-2 text-white/80 text-xs"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                >
                                  💡 {analogy}
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {/* Keywords */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {aiAnalysis.simplification.keywords.map((keyword: string, i: number) => (
                              <motion.span
                                key={i}
                                className="px-2 py-1 bg-blue-600/50 text-blue-100 rounded-full text-xs font-semibold"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                {keyword}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>

                        {/* Buddy's Fun Explanation */}
                        <motion.div
                          className="bg-gradient-to-br from-orange-900/50 to-pink-900/50 rounded-2xl p-4 border-2 border-orange-500/50"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <motion.div
                              className="text-3xl"
                              animate={{ rotate: [0, -10, 10, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                              🦉
                            </motion.div>
                            <div>
                              <h4 className="font-bold text-white">Buddy Says:</h4>
                              <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold inline-block">
                                ● Active
                              </div>
                            </div>
                          </div>

                          <motion.div
                            className="bg-orange-800/30 rounded-xl p-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <p className="text-white text-sm leading-relaxed">
                              {aiAnalysis.explanation}
                            </p>
                            <motion.div
                              className="mt-2 bg-green-500/20 rounded-lg p-2"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 }}
                            >
                              <p className="text-green-300 text-xs font-semibold">
                                🎁 +5 points for reading Buddy's explanation!
                              </p>
                            </motion.div>
                          </motion.div>
                        </motion.div>

                        {/* AI-Generated Quiz */}
                        {quizQuestions.length > 0 && (
                          <motion.div
                            className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-4 border-2 border-purple-500/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Target className="w-5 h-5 text-purple-400" />
                              <h4 className="font-bold text-white">⚡ AI Quiz Challenge!</h4>
                              <motion.div
                                className="ml-auto bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                AI-Generated
                              </motion.div>
                            </div>

                            {quizQuestions.map((question, qIndex) => (
                              <motion.div
                                key={qIndex}
                                className="mb-4 last:mb-0"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: qIndex * 0.15 }}
                              >
                                <p className="text-white font-bold mb-2 flex items-center gap-2">
                                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                                    {qIndex + 1}
                                  </span>
                                  {question.question}
                                </p>
                                <div className="space-y-2">
                                  {question.options.map((option, oIndex) => (
                                    <motion.button
                                      key={oIndex}
                                      onClick={() => handleQuizAnswer(qIndex, oIndex)}
                                      disabled={quizAnswered[qIndex]}
                                      className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${
                                        quizAnswered[qIndex]
                                          ? oIndex === question.correct
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                            : 'bg-gray-700/50 text-gray-400'
                                          : 'bg-purple-800/50 hover:bg-purple-700/50 text-white border-2 border-purple-500/30 hover:border-purple-400/50'
                                      }`}
                                      whileHover={!quizAnswered[qIndex] ? { scale: 1.02, x: 5 } : {}}
                                      whileTap={!quizAnswered[qIndex] ? { scale: 0.98 } : {}}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                          quizAnswered[qIndex] && oIndex === question.correct
                                            ? 'bg-white text-green-600'
                                            : 'bg-purple-600/50 text-white'
                                        }`}>
                                          {String.fromCharCode(65 + oIndex)}
                                        </span>
                                        {option}
                                        {quizAnswered[qIndex] && oIndex === question.correct && (
                                          <motion.span
                                            className="ml-auto"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                          >
                                            ✓
                                          </motion.span>
                                        )}
                                      </span>
                                    </motion.button>
                                  ))}
                                </div>
                                {quizAnswered[qIndex] && (
                                  <motion.div
                                    className="mt-3 bg-green-900/30 border border-green-500/50 rounded-xl p-3"
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                  >
                                    <p className="text-green-300 text-sm mb-2">
                                      {question.explanation}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <motion.div
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                      >
                                        +{question.points} Points!
                                      </motion.div>
                                      <span className="text-white text-sm font-semibold">
                                        {['Awesome!', 'Brilliant!', 'Fantastic!', 'Amazing!'][Math.floor(Math.random() * 4)]}
                                      </span>
                                    </div>
                                  </motion.div>
                                )}
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Rocket className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <p className="text-white font-bold mb-2">Loading AI Magic...</p>
                        <p className="text-purple-300 text-sm">Buddy is getting ready!</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Enhanced Chat Content */}
                {showChat && (
                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 pt-2 px-4 pb-4 overflow-y-auto chat-scrollbar space-y-3 min-h-0">
                      {chatMessages.length === 0 ? (
                        <motion.div
                          className="text-center py-8"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <motion.div
                            className="text-6xl mb-4"
                            animate={{ 
                              rotate: [0, -10, 10, -10, 10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                          >
                            🦉
                          </motion.div>
                          <p className="text-white font-bold mb-2">
                            Ask Buddy anything!
                          </p>
                          <p className="text-purple-300 text-sm mb-4">
                            I'll use AI to give you the best answer!
                          </p>
                          <div className="space-y-2 text-xs text-purple-300">
                            <p>💡 "What is {article.category}?"</p>
                            <p>💡 "How does it work?"</p>
                            <p>💡 "Tell me more about this!"</p>
                          </div>
                        </motion.div>
                      ) : (
                        chatMessages.map((msg, index) => (
                          <motion.div
                            key={index}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                                msg.type === 'user'
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                  : 'bg-gradient-to-r from-blue-900/80 to-cyan-900/80 text-white border border-blue-500/50'
                              }`}
                            >
                              {msg.type === 'bot' && (
                                <motion.span 
                                  className="text-2xl mr-2 inline-block"
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 0.5 }}
                                >
                                  🦉
                                </motion.span>
                              )}
                              <span className="text-sm leading-relaxed">{msg.text}</span>
                              <p className="text-xs opacity-60 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      )}
                      {isLoadingAI && (
                        <motion.div
                          className="flex justify-start"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="bg-blue-900/80 rounded-2xl px-4 py-3 flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Brain className="w-5 h-5 text-blue-400" />
                            </motion.div>
                            <span className="text-white text-sm">Buddy is thinking...</span>
                          </div>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Enhanced Chat Input */}
                    <div className="p-3 bg-purple-900/50 border-t border-purple-500/30 shrink-0">
                      <div className="flex gap-2">
                        <motion.button
                          onClick={handleVoiceInput}
                          className={`p-3 rounded-full transition-all ${
                            isListening 
                              ? 'bg-red-600 animate-pulse' 
                              : 'bg-purple-700/50 hover:bg-purple-600/50'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={isListening}
                        >
                          <Mic className="w-5 h-5 text-white" />
                        </motion.button>
                        
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !isLoadingAI && handleChatSend()}
                          placeholder="Ask me anything..."
                          disabled={isLoadingAI}
                          className="flex-1 bg-purple-800/30 border border-purple-500/50 rounded-full px-4 py-3 text-sm text-white placeholder-purple-300/50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                        />
                        
                        <motion.button
                          onClick={handleChatSend}
                          disabled={!chatInput.trim() || isLoadingAI}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-3 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {isLoadingAI ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Loader className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </motion.button>
                      </div>
                      <p className="text-purple-300 text-xs mt-2 text-center flex items-center justify-center gap-1">
                        <Wand2 className="w-3 h-3" />
                        Powered by AI • Ask anything about the article!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    
    {/* Backdrop for Expanded State */}
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </AnimatePresence>

      {/* Enhanced Floating Character Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden"
        animate={{
          boxShadow: [
            '0 10px 40px rgba(168, 85, 247, 0.6)',
            '0 10px 60px rgba(236, 72, 153, 0.8)',
            '0 10px 40px rgba(168, 85, 247, 0.6)',
          ],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Rotating gradient overlay */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        
        <motion.div
          className="text-4xl relative z-10"
          animate={getCharacterAnimation()}
          style={{
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))',
          }}
        >
          🦉
        </motion.div>

        {/* AI Badge */}
        {!isExpanded && (
          <motion.div
            className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-2 py-1 flex items-center gap-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-bold">AI</span>
          </motion.div>
        )}

        {/* Pulse Rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-purple-400"
            animate={{
              scale: [1, 2, 2],
              opacity: [0.8, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.button>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9333ea, #db2777);
        }
      `}</style>
    </div>
  );
}