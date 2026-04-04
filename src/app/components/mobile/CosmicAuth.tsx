import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Brain, Mail, Lock, Eye, EyeOff, Sparkles, Rocket, Zap, Star, User, AlertTriangle, CheckCircle, X } from 'lucide-react';

/**
 * Maps raw technical error messages to user-friendly messages.
 * This ensures users never see D1_ERROR, SQLITE_ERROR, etc.
 */
function getFriendlyErrorMessage(rawMessage: string, isLogin: boolean): string {
  const msg = (rawMessage || '').toLowerCase();

  // Database / column / schema errors
  if (msg.includes('d1_error') || msg.includes('sqlite_error') || msg.includes('no such column') || msg.includes('no column named')) {
    return isLogin
      ? 'Invalid email or password. Please try again.'
      : 'Unable to create account. Please try again later.';
  }

  // Network errors
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  // Duplicate user
  if (msg.includes('already exists') || msg.includes('unique constraint')) {
    return 'An account with this email already exists. Please log in instead.';
  }

  // Invalid credentials (already user-friendly from backend)
  if (msg.includes('invalid email') || msg.includes('invalid password')) {
    return 'Invalid email or password. Please try again.';
  }

  // Authentication failed
  if (msg.includes('authentication failed')) {
    return isLogin
      ? 'Invalid email or password. Please try again.'
      : 'Unable to create account. Please try again.';
  }

  // Timeout
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'The server took too long to respond. Please try again.';
  }

  // If the message is already user-friendly (no technical jargon), return it
  if (!msg.includes('error') && !msg.includes('sql') && !msg.includes('d1') && !msg.includes('exception') && rawMessage.length < 100) {
    return rawMessage;
  }

  // Default fallback
  return isLogin
    ? 'Unable to log in. Please check your credentials and try again.'
    : 'Unable to create account. Please try again later.';
}

export function CosmicAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  const [planets, setPlanets] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);
  const navigate = useNavigate();

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Auto-dismiss success after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    // Check if user is already logged in
    const userId = localStorage.getItem('mindfulfeed_userId');
    const token = localStorage.getItem('mindfulfeed_token');
    
    if (userId && token) {
      // Auto-login!
      setIsLoading(true);
      setTimeout(() => {
        navigate('/mobile/feed');
      }, 500);
    }

    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
    }));
    setStars(newStars);

    const newPlanets = [
      { id: 1, x: 10, y: 20, size: 120, color: 'from-purple-500 to-pink-500' },
      { id: 2, x: 80, y: 70, size: 80, color: 'from-blue-500 to-cyan-500' },
      { id: 3, x: 20, y: 80, size: 60, color: 'from-yellow-500 to-orange-500' },
      { id: 4, x: 90, y: 15, size: 100, color: 'from-green-500 to-teal-500' },
    ];
    setPlanets(newPlanets);
  }, []);

  // Clear messages when switching between login and signup
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setConfirmPassword(''); // Clear confirm password on toggle
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validation for signup
    if (!isLogin && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please try again.');
      setIsLoading(false);
      return;
    }

    const sanitizedEmail = email.trim().toLowerCase();

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin 
        ? { email: sanitizedEmail, password } 
        : { name: fullName.trim(), email: sanitizedEmail, password };

      const res = await fetch(`https://mindfulfeed-worker.info-skillxpress.workers.dev${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        // Store persistent session
        localStorage.setItem('mindfulfeed_userId', data.user.id);
        localStorage.setItem('mindfulfeed_token', data.token);
        localStorage.setItem('mindfulfeed_userName', data.user.name);
        navigate('/mobile/feed');
      } else {
        // After registration, switch to login
        setIsLogin(true);
        setSuccessMessage('Account created successfully! Please log in.');
      }
    } catch (err: any) {
      const rawMessage = err.message || 'Something went wrong';
      setErrorMessage(getFriendlyErrorMessage(rawMessage, isLogin));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('https://mindfulfeed-worker.info-skillxpress.workers.dev/api/login-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Guest login failed');
      }

      // Store guest session
      localStorage.setItem('mindfulfeed_userId', data.user.id);
      localStorage.setItem('mindfulfeed_token', data.token);
      localStorage.setItem('mindfulfeed_userName', data.user.name);
      localStorage.setItem('mindfulfeed_isDemo', 'true');
      
      setSuccessMessage(`Welcome, ${data.user.name}!`);
      setTimeout(() => {
        navigate('/mobile/feed');
      }, 500);
    } catch (err: any) {
      setErrorMessage('Unable to launch demo mode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-fullscreen mobile-no-horizontal-scroll mobile-custom-scroll bg-[#0a0a1f]">
      {/* Animated Background - Space */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#1a1a3e] via-[#0f0f2e] to-[#0a0a1f]"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/* Stars */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Floating Planets */}
        {planets.map((planet) => (
          <motion.div
            key={planet.id}
            className={`absolute rounded-full bg-gradient-to-br ${planet.color} opacity-20 blur-2xl`}
            style={{
              left: `${planet.x}%`,
              top: `${planet.y}%`,
              width: planet.size,
              height: planet.size,
            }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Shooting Stars */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`shooting-${i}`}
            className="absolute h-0.5 w-20 bg-gradient-to-r from-white to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 200],
              y: [0, 200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 4,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Nebula Effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 70% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mobile-centered-content mobile-text-compact mobile-compact">
        <motion.div
          className="w-full max-w-md mobile-compact-spacing"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-8 mobile-compact-spacing"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="relative w-24 h-24 mb-6"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {/* Outer Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-purple-500/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Inner Ring */}
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-blue-500/30"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                  rotate: [0, -360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Core */}
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.5)',
                    '0 0 40px rgba(59, 130, 246, 0.5)',
                    '0 0 20px rgba(168, 85, 247, 0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              MindfulFeed
            </motion.h1>
            <motion.p
              className="text-purple-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Your Cosmic Content Journey
            </motion.p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
          >
            {/* Toggle */}
            <div className="flex gap-2 mb-8 bg-white/5 rounded-full p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-full font-semibold transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-white/60'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-full font-semibold transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-white/60'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Toast */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mb-6 bg-red-500/15 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-red-300 text-sm font-semibold mb-0.5">
                      {isLogin ? 'Login Failed' : 'Sign Up Failed'}
                    </p>
                    <p className="text-red-200/80 text-xs leading-relaxed">
                      {errorMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setErrorMessage('')}
                    className="flex-shrink-0 text-red-400/60 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mb-6 bg-green-500/15 border border-green-500/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-300 text-sm font-semibold mb-0.5">
                      Success
                    </p>
                    <p className="text-green-200/80 text-xs leading-relaxed">
                      {successMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="flex-shrink-0 text-green-400/60 hover:text-green-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-12 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                  <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 animate-pulse" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-12 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-all"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Signup Only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-12 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Full Name */}
              {!isLogin && (
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-12 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="John Doe"
                      required
                    />
                    <Star className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Forgot Password */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-purple-300 hover:text-purple-200 text-sm font-semibold transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-bold text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      className="flex items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Rocket className="w-6 h-6" />
                      </motion.div>
                      <span>Launching...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span>{isLogin ? 'Launch Into Feed' : 'Start Your Journey'}</span>
                      <Zap className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.button>
            </form>

            {/* Social Auth */}
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/5 text-white/60">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl py-3 text-white font-semibold transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl py-3 text-white font-semibold transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>

            {/* Guest Access */}
            <div className="mt-6">
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/20 border border-white/10 rounded-2xl py-3 text-purple-200 font-semibold transition-all group disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-125 transition-transform" />
                <span>Explore as Guest</span>
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-white/40 text-sm mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            By continuing, you agree to our{' '}
            <button className="text-purple-300 hover:text-purple-200 transition-all">
              Terms
            </button>{' '}
            and{' '}
            <button className="text-purple-300 hover:text-purple-200 transition-all">
              Privacy Policy
            </button>
          </motion.p>
        </motion.div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}