import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, Shield } from 'lucide-react';

interface ModerationFeedbackProps {
  moderationResult: {
    approved: boolean;
    score: number;
    category: 'approved' | 'rejected' | 'review';
    reason?: string;
    flags: {
      hateSpeech: boolean;
      violence: boolean;
      explicit: boolean;
      spam: boolean;
      misinformation: boolean;
      lowQuality: boolean;
    };
    suggestions?: string[];
  } | null;
  onClose: () => void;
  onRetry?: () => void;
}

export function ModerationFeedback({ moderationResult, onClose, onRetry }: ModerationFeedbackProps) {
  if (!moderationResult) return null;

  const { approved, score, category, reason, flags, suggestions } = moderationResult;

  const getIcon = () => {
    if (approved) return <CheckCircle className="w-16 h-16 text-green-400" />;
    if (category === 'review') return <AlertTriangle className="w-16 h-16 text-yellow-400" />;
    return <XCircle className="w-16 h-16 text-red-400" />;
  };

  const getColor = () => {
    if (approved) return 'from-green-500 to-emerald-500';
    if (category === 'review') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const flagsList = Object.entries(flags)
    .filter(([_, value]) => value)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim());

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2e] rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Shield Icon Background */}
          <div className="absolute -top-8 -right-8 opacity-10">
            <Shield className="w-48 h-48 text-purple-500" />
          </div>

          {/* Header */}
          <div className="relative flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              {getIcon()}
            </motion.div>

            <motion.h2
              className="text-2xl font-bold text-white mt-4 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {approved ? 'Content Approved!' : category === 'review' ? 'Needs Improvement' : 'Content Rejected'}
            </motion.h2>

            {/* Quality Score */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-white/60 text-sm">Quality Score:</span>
              <span className={`text-2xl font-bold ${getScoreColor()}`}>
                {score}/100
              </span>
            </motion.div>

            {/* Score Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Reason */}
          {reason && (
            <motion.div
              className="bg-white/5 rounded-2xl p-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-white/80 text-sm text-center">{reason}</p>
            </motion.div>
          )}

          {/* Flags */}
          {flagsList.length > 0 && (
            <motion.div
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Issues Detected
              </h3>
              <ul className="space-y-1">
                {flagsList.map((flag, index) => (
                  <li key={index} className="text-red-300 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {flag.charAt(0).toUpperCase() + flag.slice(1)}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <motion.div
              className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-blue-400 font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Suggestions for Improvement
              </h3>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    className="text-blue-200 text-xs flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!approved && onRetry && (
              <motion.button
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-2xl font-semibold shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={onRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Edit & Retry
              </motion.button>
            )}
            <motion.button
              className={`${!approved && onRetry ? 'flex-1' : 'w-full'} bg-white/10 text-white py-3 rounded-2xl font-semibold border border-white/20`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {approved ? 'Continue' : 'Cancel'}
            </motion.button>
          </div>

          {/* AI Badge */}
          <motion.div
            className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Shield className="w-3 h-3" />
            <span>Powered by AI Content Moderation</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
