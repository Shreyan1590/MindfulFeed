import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for demo
    if (!email || !password || (isSignup && !displayName)) {
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      navigate('/loading');
    }, 2000);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setHasError(false);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/40 rounded-full text-white hover:bg-white/30 transition-all"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>
          Back to App
        </span>
      </motion.button>

      {/* Dynamic Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#6C63FF] via-[#3A86FF] to-[#6366F1]"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Black Tint Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Glow Orbs */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-[#6C63FF]/40"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-[#3A86FF]/40"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.4, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Particles */}
      {mounted && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.3 + 0.1,
          }}
          animate={{
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            filter: 'blur(2px)',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-2xl">
            <Brain className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          className="text-white text-center mb-2"
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '2px',
          }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          MindfulFeed
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-white/90 text-center mb-10"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '1.125rem',
            fontWeight: 600,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          {isSignup ? 'Join the focus revolution.' : 'Focus on what matters.'}
        </motion.p>

        {/* Glass Card */}
        <motion.div
          className="relative rounded-[32px] p-8 shadow-2xl border-2 border-white/40"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={
            hasError
              ? {
                  opacity: 1,
                  y: 0,
                  x: [0, -10, 10, -10, 10, 0],
                }
              : { opacity: 1, y: 0, x: 0 }
          }
          transition={{
            opacity: { duration: 0.8, delay: 0.4 },
            y: { duration: 0.8, delay: 0.4 },
            x: hasError
              ? {
                  duration: 0.4,
                  ease: 'easeInOut',
                }
              : {},
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name Field (Signup Only) */}
            <AnimatePresence>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <label
                    className="block text-white text-sm mb-2"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C63FF]">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full bg-white rounded-[20px] px-12 py-4 text-gray-800 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#3A86FF] focus:ring-offset-2 focus:ring-offset-transparent"
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div>
              <label
                className="block text-white text-sm mb-2"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C63FF]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-white rounded-[20px] px-12 py-4 text-gray-800 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#3A86FF] focus:ring-offset-2 focus:ring-offset-transparent"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 500,
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-white text-sm mb-2"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C63FF]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white rounded-[20px] px-12 py-4 text-gray-800 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#3A86FF] focus:ring-offset-2 focus:ring-offset-transparent"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 500,
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-white rounded-full py-4 mt-6 relative overflow-hidden"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '1.5px',
                color: '#6C63FF',
                boxShadow: '0 0 20px rgba(58, 134, 255, 0.3)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-6 h-6 border-3 border-[#6C63FF] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>
              ) : (
                <span>{isSignup ? 'CREATE ACCOUNT' : 'LOG IN'}</span>
              )}
            </motion.button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p
              className="text-white/80"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 500,
              }}
            >
              {isSignup ? 'Already have an account? ' : 'New here? '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-bold underline text-white hover:text-white/90 transition-colors"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                {isSignup ? 'Log In' : 'Create Account'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}