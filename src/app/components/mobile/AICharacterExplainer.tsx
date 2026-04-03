import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
} from 'lucide-react';

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
  { id: 'reading-champion', name: 'Reading Champion', icon: '📚', description: 'Read 5 articles', earned: false },
];

export function AICharacterExplainer({ articleTitle }: { articleTitle: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bot'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [characterMood, setCharacterMood] = useState<'happy' | 'excited' | 'celebrating'>('happy');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Generate quiz questions based on article
  const quizQuestions: QuizQuestion[] = [
    {
      question: "What is this article mainly about?",
      options: ["AI Technology", "Cooking Recipes", "Sports News", "Fashion Tips"],
      correct: 0,
      explanation: "Great job! This article explores how AI is changing our daily lives! 🎯",
      points: 10,
    },
    {
      question: "How can AI help us in daily life?",
      options: ["Play video games", "Make tasks easier", "Watch TV", "Sleep better"],
      correct: 1,
      explanation: "Excellent! AI helps automate tasks and make our lives more convenient! 🚀",
      points: 15,
    },
    {
      question: "What should we remember when using AI?",
      options: ["Use it responsibly", "Never use it", "Only play games", "Ignore privacy"],
      correct: 0,
      explanation: "Perfect! We must use AI responsibly and think about ethics and privacy! 🌟",
      points: 20,
    },
  ];

  // Multilingual phrases
  const greetings: Record<string, string> = {
    en: "Hi there! I'm Buddy, your learning companion! 🎉",
    ta: "வணக்கம்! நான் பட்டி, உங்கள் கற்றல் தோழன்! 🎉",
    hi: "नमस्ते! मैं बड्डी हूं, आपका सीखने का साथी! 🎉",
    ml: "ഹലോ! ഞാൻ ബഡ്ഡി ആണ്, നിങ്ങളുടെ പഠന സുഹൃത്ത്! 🎉",
    gu: "નમસ્તે! હું બડી છું, તમારો શીખવાનો સાથી! 🎉",
  };

  const encouragements: Record<string, string[]> = {
    en: ["Awesome!", "Brilliant!", "You're a star!", "Keep going!", "Fantastic!"],
    ta: ["அருமை!", "சிறப்பு!", "நீ ஒரு நட்சத்திரம்!", "தொடர்!", "அற்புதம்!"],
    hi: ["शानदार!", "बहुत बढ़िया!", "तुम स्टार हो!", "जारी रखो!", "शानदार!"],
    ml: ["അതിമനോഹരം!", "മികച്ചത്!", "നിങ്ങൾ ഒരു താരമാണ്!", "തുടരൂ!", "അതിശയകരം!"],
    gu: ["જબરદસ્ત!", "શાનદાર!", "તમે સ્ટાર છો!", "ચાલુ રાખો!", "અદ્ભુત!"],
  };

  // Award points
  const awardPoints = (points: number) => {
    setTotalPoints(prev => prev + points);
    setCharacterMood('celebrating');
    setTimeout(() => setCharacterMood('happy'), 1000);
  };

  // Earn badge
  const earnBadge = (badgeId: string) => {
    setBadges(prev => prev.map(badge => 
      badge.id === badgeId ? { ...badge, earned: true } : badge
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
      setCharacterMood('celebrating');

      // Check for badges
      if (correctAnswers + 1 >= 3) {
        earnBadge('quick-learner');
      }
      if (correctAnswers + 1 === quizQuestions.length) {
        earnBadge('perfect-score');
      }
    }
  };

  // Handle chat message
  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatInput('');

    // Earn curious cat badge
    if (chatMessages.length === 0) {
      earnBadge('curious-cat');
      awardPoints(5);
    }

    // Generate bot response
    setTimeout(() => {
      const response = generateBotResponse(userMessage);
      setChatMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 500);
  };

  // Simple NLP response generator
  const generateBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Question patterns
    if (msg.includes('what') || msg.includes('how') || msg.includes('why') || msg.includes('when')) {
      if (msg.includes('ai') || msg.includes('artificial intelligence')) {
        return "Great question! 🤖 AI (Artificial Intelligence) is like giving computers a brain so they can think and learn, just like you! It helps us with homework, games, and even finding the best videos to watch. In Tamil, we say 'செயற்கை நுண்ணறிவு' (seyarkai nunarivu). Want to know more? +5 points for curiosity! 🌟";
      }
      if (msg.includes('work') || msg.includes('learn')) {
        return "Wonderful curiosity! 💡 AI learns by looking at LOTS of examples - imagine reading 1000 books in a second! It finds patterns and gets smarter over time. Just like how you get better at math by practicing! In Hindi, we say 'सीखना' (seekhna) for learning. +5 points! ⭐";
      }
      if (msg.includes('use') || msg.includes('help')) {
        return "Awesome question! 🚀 AI helps us every day! It's in voice assistants (like Alexa), recommendation systems (like YouTube suggestions), smart cameras, and even helps doctors! In Malayalam, we say 'സഹായിക്കുക' (sahayikkuka) for help. You're so smart! +5 points! 🎯";
      }
    }

    // Keywords
    if (msg.includes('thanks') || msg.includes('thank you')) {
      return "You're welcome, my little genius! 💖 Keep those questions coming! Remember: curiosity is your superpower! 🦸‍♀️";
    }
    if (msg.includes('hello') || msg.includes('hi')) {
      return "Hello there, bright star! ✨ Ready to learn something amazing today? Let's explore together! 🌈";
    }

    // Default responses
    const responses = [
      "That's an interesting thought! 🤔 Tell me more about what you're curious about, and I'll explain it in a fun way! +3 points for engaging!",
      "I love your curiosity! 💫 Can you ask that in the form of a question? Like 'What is...' or 'How does...'? I'll give you the best answer! +3 points!",
      "You're asking great things! 🌟 Let me think... AI in this article is about making technology smarter to help humans. What specific part interests you? +3 points!",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Get random encouragement
  const getEncouragement = (): string => {
    const msgs = encouragements[selectedLanguage.code];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mb-4 w-80 bg-white rounded-3xl shadow-2xl border-4 border-purple-500 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="text-4xl"
                    animate={{
                      rotate: characterMood === 'celebrating' ? [0, -10, 10, -10, 10, 0] : 0,
                      scale: characterMood === 'excited' ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    🦉
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Buddy</h3>
                    <p className="text-white/80 text-xs">Your Learning Friend</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <ChevronDown className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Points Display */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-bold text-sm">{totalPoints} Points</span>
                </div>
                <button
                  onClick={() => setShowBadges(!showBadges)}
                  className="bg-white/20 backdrop-blur-md rounded-full p-2 hover:bg-white/30 transition-all"
                >
                  <Award className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="bg-white/20 backdrop-blur-md rounded-full p-2 hover:bg-white/30 transition-all"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-white" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Badges Panel */}
            <AnimatePresence>
              {showBadges && (
                <motion.div
                  className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 border-b border-purple-200"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-500" />
                    Your Badges
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {badges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        className={`p-2 rounded-xl text-center ${
                          badge.earned ? 'bg-gradient-to-br from-yellow-200 to-orange-200' : 'bg-gray-200'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        title={badge.description}
                      >
                        <div className="text-2xl mb-1 filter" style={{ filter: badge.earned ? 'none' : 'grayscale(100%)' }}>
                          {badge.icon}
                        </div>
                        <p className={`text-xs font-semibold ${badge.earned ? 'text-gray-900' : 'text-gray-400'}`}>
                          {badge.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Tabs */}
            <div className="bg-gray-50">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setShowChat(false)}
                  className={`flex-1 py-3 font-semibold transition-all ${
                    !showChat
                      ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📚 Learn
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className={`flex-1 py-3 font-semibold transition-all ${
                    showChat
                      ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  💬 Chat
                </button>
              </div>

              {/* Learn Content */}
              {!showChat && (
                <div className="p-4 max-h-96 overflow-y-auto">
                  {/* Language Selector */}
                  <div className="mb-4">
                    <button
                      onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl px-4 py-2 font-bold flex items-center justify-between"
                    >
                      <span>{selectedLanguage.flag} {selectedLanguage.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {showLanguageMenu && (
                        <motion.div
                          className="mt-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setSelectedLanguage(lang);
                                setShowLanguageMenu(false);
                                if (lang.code !== 'en') {
                                  earnBadge('language-lover');
                                  awardPoints(10);
                                }
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-all flex items-center gap-2"
                            >
                              <span>{lang.flag}</span>
                              <span className="font-semibold text-gray-900">{lang.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Greeting */}
                  <motion.div
                    className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-gray-900 font-bold mb-2">
                      {greetings[selectedLanguage.code]}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Let's make learning fun! 🎮 Answer questions, earn points, and collect badges! 🏆
                    </p>
                  </motion.div>

                  {/* Plain Content Section */}
                  <div className="bg-white rounded-2xl p-4 mb-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                      <h4 className="font-bold text-gray-900">📖 Article Summary</h4>
                    </div>
                    <div className="text-gray-700 text-sm space-y-2">
                      <p><strong>What's this about?</strong></p>
                      <p>This article talks about how Artificial Intelligence (AI) is becoming part of our everyday life - from the apps on your phone to smart speakers at home!</p>
                      
                      <p className="mt-3"><strong>Main Points:</strong></p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>AI helps make our devices smarter</li>
                        <li>It can learn from examples (like how you learn in school!)</li>
                        <li>We use AI in games, recommendations, and assistants</li>
                        <li>We should use AI responsibly and safely</li>
                      </ul>

                      <p className="mt-3"><strong>Why should you care?</strong></p>
                      <p>Because AI is shaping the future - YOUR future! Understanding it now will help you use technology better and maybe even create your own AI someday! 🚀</p>
                    </div>
                  </div>

                  {/* Gamified Bot Dialogue */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 mb-4 border-2 border-orange-300">
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div
                        className="text-2xl"
                        animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        🦉
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">Buddy Says:</h4>
                        <div className="bg-white rounded-lg px-2 py-1 inline-block">
                          <span className="text-xs text-green-600 font-semibold">● Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <motion.div
                        className="bg-white rounded-xl p-3 shadow-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <p className="text-gray-900">
                          🤖 <strong>Hey there, future genius!</strong> Imagine if your toys could think and play with you on their own! That's kinda what AI does - it makes computers and robots smart!
                        </p>
                        {selectedLanguage.code === 'ta' && (
                          <p className="mt-2 text-purple-700 italic">
                            தமிழில்: AI என்பது கணினிகளுக்கு மூளை கொடுப்பது போன்றது! (AI yenbathu kaninikalukku moolai koduppathu pōlātu!)
                          </p>
                        )}
                        {selectedLanguage.code === 'hi' && (
                          <p className="mt-2 text-purple-700 italic">
                            हिंदी में: AI कंप्यूटर को दिमाग देने जैसा है! (AI computer ko dimaag dene jaisa hai!)
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        className="bg-white rounded-xl p-3 shadow-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-gray-900">
                          ✨ <strong>Fun Fact Alert!</strong> AI learns just like you do in school - by seeing lots of examples! If you show it 100 pictures of cats, it learns what cats look like. Cool, right?
                        </p>
                        <div className="mt-2 bg-green-100 rounded-lg px-3 py-2">
                          <p className="text-green-800 font-semibold">🎁 +5 points for learning this fact!</p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-white rounded-xl p-3 shadow-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <p className="text-gray-900">
                          🎯 <strong>Real Life Example:</strong> When YouTube suggests videos you might like, that's AI! It learned what you enjoy watching and finds similar stuff. Smart, huh?
                        </p>
                        {selectedLanguage.code === 'ml' && (
                          <p className="mt-2 text-purple-700 italic">
                            മലയാളത്തിൽ: YouTube നിങ്ങൾക്ക് ഇഷ്ടപ്പെടുന്ന വീഡിയോകൾ കാണിക്കുന്നത് AI ആണ്!
                          </p>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Quiz Section */}
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-4 border-2 border-purple-400">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-gray-900">⚡ Quick Challenge!</h4>
                    </div>

                    {quizQuestions.map((question, qIndex) => (
                      <motion.div
                        key={qIndex}
                        className="mb-4 last:mb-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qIndex * 0.1 }}
                      >
                        <p className="text-gray-900 font-bold mb-2">
                          {qIndex + 1}. {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <button
                              key={oIndex}
                              onClick={() => handleQuizAnswer(qIndex, oIndex)}
                              disabled={quizAnswered[qIndex]}
                              className={`w-full text-left px-4 py-2 rounded-xl font-semibold transition-all ${
                                quizAnswered[qIndex]
                                  ? oIndex === question.correct
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                  : 'bg-white hover:bg-purple-100 text-gray-900'
                              }`}
                            >
                              {String.fromCharCode(65 + oIndex)}) {option}
                              {quizAnswered[qIndex] && oIndex === question.correct && ' ✓'}
                            </button>
                          ))}
                        </div>
                        {quizAnswered[qIndex] && (
                          <motion.div
                            className="mt-2 bg-green-100 rounded-xl p-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <p className="text-green-800 text-sm">
                              {question.explanation}
                            </p>
                            <p className="text-green-600 font-bold text-sm mt-1">
                              +{question.points} points! {getEncouragement()}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Content */}
              {showChat && (
                <div className="flex flex-col h-96">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-4xl mb-3">🦉</p>
                        <p className="text-gray-600 text-sm">
                          Ask me anything about the article!
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          Try: "What is AI?" or "How does it work?"
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <motion.div
                          key={index}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              msg.type === 'user'
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            {msg.type === 'bot' && <span className="text-xl mr-2">🦉</span>}
                            <span className="text-sm">{msg.text}</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 bg-white border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                        placeholder="Type your question..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleChatSend}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-2 hover:shadow-lg transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Character Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full shadow-2xl flex items-center justify-center relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 10px 30px rgba(168, 85, 247, 0.4)',
            '0 10px 40px rgba(236, 72, 153, 0.6)',
            '0 10px 30px rgba(168, 85, 247, 0.4)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="text-3xl"
          animate={{
            rotate: isExpanded ? 0 : [0, -10, 10, -10, 10, 0],
          }}
          transition={{ duration: 2, repeat: isExpanded ? 0 : Infinity, repeatDelay: 2 }}
        >
          🦉
        </motion.div>

        {/* Notification Badge */}
        {!isExpanded && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <span className="text-white text-xs font-bold">!</span>
          </motion.div>
        )}

        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-purple-300"
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.6, 0, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}
