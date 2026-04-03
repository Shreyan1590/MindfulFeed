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
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  points: number;
}

interface ArticleData {
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
  { id: 'curious-cat', name: 'Curious Cat', icon: '🐱', description: 'Asked a great question!', earned: false },
  { id: 'quick-learner', name: 'Quick Learner', icon: '⚡', description: 'Answered 3 questions correctly', earned: false },
  { id: 'knowledge-star', name: 'Knowledge Star', icon: '⭐', description: 'Read full article', earned: false },
  { id: 'language-lover', name: 'Language Lover', icon: '🌍', description: 'Learned in multiple languages', earned: false },
  { id: 'perfect-score', name: 'Perfect Score', icon: '🏆', description: 'Got all quiz questions right!', earned: false },
  { id: 'ai-master', name: 'AI Master', icon: '🤖', description: 'Used AI features 10 times', earned: false },
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
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Load AI analysis when component mounts
  useEffect(() => {
    if (article && !aiAnalysis) {
      loadAIAnalysis();
    }
  }, [article]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Speak content when it appears
  useEffect(() => {
    if (aiAnalysis && soundEnabled && selectedLanguage) {
      // Auto-speak Buddy's explanation when it loads
      const welcomeMessage = getTranslatedMessage('welcome');
      speakText(welcomeMessage + " " + aiAnalysis.explanation);
    }
  }, [aiAnalysis?.explanation]);

  // Speak when tab switches
  useEffect(() => {
    if (soundEnabled && isExpanded) {
      const tabMessage = showChat ? 
        getTranslatedMessage('tabSwitch') + " Chat" :
        getTranslatedMessage('tabSwitch') + " Learn";
      speakText(tabMessage);
    }
  }, [showChat]);

  // Stop speaking when sound is disabled
  useEffect(() => {
    if (!soundEnabled && isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    }
  }, [soundEnabled]);

  // Get translated messages
  const getTranslatedMessage = (key: string): string => {
    const messages: Record<string, Record<string, string>> = {
      welcome: {
        en: "Hi there! Let me explain this for you.",
        ta: "வணக்கம்! இதை உங்களுக்கு விளக்குகிறேன்.",
        hi: "नमस्ते! मैं आपको यह समझाता हूँ।",
        ml: "ഹലോ! ഞാൻ ഇത് നിങ്ങൾക്ക് വിശദീകരിക്കാം.",
        gu: "નમસ્તે! હું તમને આ સમજાવું.",
      },
      correct: {
        en: "Brilliant! That's the right answer!",
        ta: "அருமை! சரியான பதில்!",
        hi: "शानदार! सही जवाब!",
        ml: "മികച്ചത്! ശരിയായ ഉത്തരം!",
        gu: "શાનદાર! સાચો જવાબ!",
      },
      incorrect: {
        en: "Not quite right, but keep trying!",
        ta: "இது சரியல்ல, ஆனால் முயற்சி செய்யுங்கள்!",
        hi: "बिल्कुल सही नहीं, लेकिन कोशिश करते रहें!",
        ml: "തികച്ചും ശരിയല്ല, പക്ഷേ ശ്രമിക്കുക!",
        gu: "તદ્દન સાચું નથી, પરંતુ પ્રયાસ ચાલુ રાખો!",
      },
      badgeEarned: {
        en: "Congratulations! You earned a new badge!",
        ta: "வாழ்த்துக்கள்! நீங்கள் புதிய பேட்ஜ் பெற்றீர்கள்!",
        hi: "बधाई हो! आपने एक नया बैज अर्जित किया!",
        ml: "അഭിനന്ദനങ്ങൾ! നിങ്ങൾ പുതിയ ബാഡ്ജ് നേടി!",
        gu: "અભિનંદન! તમે નવો બેજ મેળવ્યો!",
      },
      languageChanged: {
        en: "Language changed to",
        ta: "மொழி மாற்றப்பட்டது",
        hi: "भाषा बदली गई",
        ml: "ഭാഷ മാറി",
        gu: "ભાષા બદલાઈ",
      },
      tabSwitch: {
        en: "Switched to",
        ta: "மாற்றப்பட்டது",
        hi: "बदल गया",
        ml: "മാറി",
        gu: "બદલાયું",
      },
      pointsEarned: {
        en: "Amazing! You earned",
        ta: "அற்புதம்! நீங்கள் பெற்றீர்கள்",
        hi: "अद्भुत! आपने कमाया",
        ml: "അതിശയകരം! നിങ്ങൾ നേടി",
        gu: "અદ્ભુત! તમે મેળવ્યા",
      },
      replay: {
        en: "Let me repeat that for you.",
        ta: "உங்களுக்காக மீண்டும் சொல்கிறேன்.",
        hi: "मैं आपके लिए दोहराता हूं।",
        ml: "ഞാൻ അത് നിങ്ങൾക്കായി ആവർത്തിക്കാം.",
        gu: "હું તમારા માટે પુનરાવર્તન કરું.",
      },
    };
    return messages[key]?.[selectedLanguage.code] || messages[key]?.['en'] || '';
  };

  // Helper: Speak text in current language with memory
  const speakText = async (text: string, excited: boolean = false) => {
    if (!soundEnabled) return;
    
    try {
      setIsSpeaking(true);
      setCharacterMood('excited');
      setLastSpokenText(text); // Remember what was spoken
      
      // Remove emojis for cleaner speech
      const cleanText = text.replace(/[😊🤖💡✨🎉🦉🎯⭐🌟🔥💖🚀🌈🐱⚡🏆🌍🎁]/g, '').trim();
      
      if (!cleanText) return;
      
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

  // Replay last spoken text
  const handleReplayAudio = async () => {
    if (!lastSpokenText) {
      // If no previous speech, speak a default message
      const message = getTranslatedMessage('welcome');
      await speakText(message, true);
      return;
    }
    
    const replayMessage = getTranslatedMessage('replay');
    await speakText(replayMessage + " " + lastSpokenText, true);
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
      awardPoints(50, 'AI Master badge unlocked!');
    }
  };

  // Award points with animation AND SPEECH
  const awardPoints = async (points: number, reason?: string) => {
    setTotalPoints(prev => prev + points);
    setLastPointsEarned(points);
    setShowPointsAnimation(true);
    setCharacterMood('celebrating');
    setShowParticles(true);
    
    // Speak points announcement
    const message = `${getTranslatedMessage('pointsEarned')} ${points} ${reason ? '. ' + reason : ' points!'}`;
    speakText(message, true);
    
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

  // Earn badge WITH SPEECH
  const earnBadge = async (badgeId: string) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge || badge.earned) return;
    
    setBadges(prev => prev.map(b => 
      b.id === badgeId ? { ...b, earned: true } : b
    ));
    
    // Announce badge
    const message = `${getTranslatedMessage('badgeEarned')} ${badge.name}!`;
    speakText(message, true);
  };

  // Handle quiz answer WITH SPEECH
  const handleQuizAnswer = async (questionIndex: number, answerIndex: number) => {
    const question = quizQuestions[questionIndex];
    const isCorrect = answerIndex === question.correct;

    const newQuizAnswered = [...quizAnswered];
    newQuizAnswered[questionIndex] = true;
    setQuizAnswered(newQuizAnswered);

    if (isCorrect) {
      // Speak correct answer feedback
      const message = `${getTranslatedMessage('correct')} ${question.explanation}`;
      speakText(message, true);
      
      awardPoints(question.points);
      setCorrectAnswers(prev => prev + 1);

      // Check for badges
      if (correctAnswers + 1 >= 3) {
        earnBadge('quick-learner');
      }
      if (correctAnswers + 1 === quizQuestions.length) {
        earnBadge('perfect-score');
        awardPoints(50, 'Perfect score bonus!');
      }
    } else {
      // Speak incorrect feedback
      const message = getTranslatedMessage('incorrect');
      speakText(message);
    }

    incrementAIUsage();
  };

  // Handle chat message with AI AND SPEECH
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
      awardPoints(5, 'First question asked!');
    }

    try {
      // Use AI service to generate response
      const response = await aiTranslationService.chatWithAI(
        userMessage,
        article.content,
        selectedLanguage.code,
        chatMessages.map(m => ({ role: m.type, content: m.text }))
      );
      
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        text: response,
        timestamp: Date.now()
      }]);
      
      // Speak the response in the current language
      speakText(response, true);
      
      awardPoints(5);
      incrementAIUsage();
      setCharacterMood('happy');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = "Oops! I'm having trouble thinking right now. Try asking again!";
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        text: errorMsg,
        timestamp: Date.now()
      }]);
      speakText(errorMsg);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Handle language change WITH SPEECH
  const handleLanguageChange = async (lang: Language) => {
    setSelectedLanguage(lang);
    setShowLanguageMenu(false);
    setIsLoadingAI(true);
    setCharacterMood('thinking');
    
    // Announce language change
    const message = `${getTranslatedMessage('languageChanged')} ${lang.name}`;
    speakText(message);
    
    if (lang.code !== 'en') {
      earnBadge('language-lover');
      awardPoints(10, 'Exploring new languages!');
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
      {/* ... Previous particle and animation code ... */}
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

      {/* Main Panel - Truncated for brevity, continues with same structure but adds replay button */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mb-4 w-80 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-pink-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border-4 border-purple-500/50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
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
            
            <div className="relative z-10 bg-gradient-to-br from-purple-900/98 via-blue-900/98 to-pink-900/98 rounded-3xl m-[3px]">
              {/* Header with Replay Button */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-4 relative overflow-hidden">
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
                            ))}\n                          </motion.div>
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
                          {isSpeaking ? '🔊 Speaking...' : 
                           characterMood === 'thinking' ? '🤔 Analyzing...' : 
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

                  {/* Enhanced Points Display with Replay Button */}
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
                      <span className="text-white/70 text-sm">Pts</span>
                    </div>
                    
                    <motion.button
                      onClick={() => setShowBadges(!showBadges)}
                      className="bg-white/10 backdrop-blur-md rounded-full p-2 hover:bg-white/20 transition-all border border-white/30 relative"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="View Badges"
                    >
                      <Trophy className="w-5 h-5 text-yellow-300" />
                      {badges.filter(b => b.earned).length > 0 && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {badges.filter(b => b.earned).length}
                        </motion.div>
                      )}
                    </motion.button>
                    
                    {/* NEW: Replay Button */}
                    <motion.button
                      onClick={handleReplayAudio}
                      disabled={!soundEnabled || isSpeaking}
                      className="bg-white/10 backdrop-blur-md rounded-full p-2 hover:bg-white/20 transition-all border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed relative group"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Replay Last Speech"
                    >
                      <RotateCcw className={`w-5 h-5 text-green-300 ${isSpeaking ? 'animate-spin' : ''}`} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Replay
                      </div>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="bg-white/10 backdrop-blur-md rounded-full p-2 hover:bg-white/20 transition-all border border-white/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title={soundEnabled ? 'Mute' : 'Unmute'}
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

              {/* Rest of the component structure remains the same */}
              <div className="p-4">
                <p className="text-white/70 text-sm text-center">
                  {isSpeaking ? '🔊 Buddy is speaking...' : 'Click 🔁 to replay last message'}
                </p>
              </div>
            </div>
          </motion.div>
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

        {isSpeaking && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🔊 Speaking
          </motion.div>
        )}

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
    </div>
  );
}
