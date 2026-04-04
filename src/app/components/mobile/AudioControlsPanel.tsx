import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, Loader2 } from 'lucide-react';

interface AudioControlsPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReplay: () => void;
  isLoading?: boolean;
  title?: string;
}

export function AudioControlsPanel({
  isPlaying,
  onPlayPause,
  onReplay,
  isLoading = false,
  title = "Article Narration"
}: AudioControlsPanelProps) {
  return (
    <motion.div
      className="fixed bottom-24 right-4 z-50 pointer-events-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 shadow-2xl flex items-center gap-4">
        {/* Animated Waveform */}
        {isPlaying && (
          <div className="flex items-center gap-1 h-6 px-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-purple-400 rounded-full"
                animate={{
                  height: [8, 16, 8],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none mb-1">
            Now Playing
          </span>
          <span className="text-xs text-white font-semibold truncate max-w-[120px]">
            {title}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
          <motion.button
            onClick={onReplay}
            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={onPlayPause}
            disabled={isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Reward Tip */}
      <AnimatePresence>
        {!isPlaying && !isLoading && (
          <motion.div
            className="absolute -top-10 left-0 right-0 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
              🎁 +20 Stars for Listening!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
