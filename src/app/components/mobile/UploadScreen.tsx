import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { formatErrorCode } from '../../utils/errorCodes';
import { apiUrl, getStoredSession } from '../../services/api';

const categories = [
  'Wellness',
  'Technology',
  'Learning',
  'Fitness',
  'Travel',
  'Productivity',
  'Creativity',
  'Science',
];

interface AIAnalysis {
  quality: 'productive' | 'neutral' | 'low-value' | 'harmful';
  score: number;
  feedback: string;
  suggestions: string[];
}

export function UploadScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!title || !content || !selectedCategory) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(apiUrl('/api/posts/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          caption,
          category: selectedCategory,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to analyze content.' }));
        throw new Error(data.error || 'Unable to analyze content.');
      }

      const result = await response.json();
      setAiAnalysis(result.analysis);
    } catch (e: any) {
      setError(formatErrorCode(e));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!aiAnalysis || aiAnalysis.quality === 'harmful') return;

    const { userId, isDemo } = getStoredSession();
    if (!userId || isDemo) {
      setError('Please log in with a full account before uploading content.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);
    setError(null);

    try {
      const response = await fetch(apiUrl('/api/posts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          content,
          caption,
          category: selectedCategory,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          imageUrl: selectedImage || '',
        }),
      });

      setUploadProgress(75);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Upload failed.' }));
        throw new Error(data.error || 'Upload failed.');
      }

      await response.json();
      setUploadProgress(100);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setTitle('');
        setContent('');
        setCaption('');
        setSelectedCategory('');
        setTags('');
        setSelectedImage(null);
        setAiAnalysis(null);
        setUploadProgress(0);
      }, 3000);
    } catch (e: any) {
      setError(formatErrorCode(e));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'productive':
        return 'bg-[#51CF66]';
      case 'neutral':
        return 'bg-[#EAB308]';
      case 'low-value':
        return 'bg-[#FF6B6B]';
      case 'harmful':
        return 'bg-[#DC2626]';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Content</h1>
          <p className="text-gray-600">Share meaningful content with the community</p>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-gray-900 font-semibold mb-3">Article Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a compelling title..."
            className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-[#6C63FF] transition-all"
          />
        </div>

        {/* Full Content */}
        <div className="mb-6">
          <label className="block text-gray-900 font-semibold mb-3">Article Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your insightful article here..."
            className="w-full h-64 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-[#6C63FF] transition-all resize-none"
          />
        </div>

        {/* Media / Graphics */}
        <div className="mb-6">
          <label className="block text-gray-900 font-semibold mb-3">Cover Image URL (Optional)</label>
          <input
            type="text"
            value={selectedImage || ''}
            onChange={(e) => setSelectedImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-[#6C63FF] transition-all"
          />
        </div>

        {/* Category Selector */}
        <div className="mb-6">
          <label className="block text-gray-900 font-semibold mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <label className="block text-gray-900 font-semibold mb-3">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="mindfulness, AI, productivity..."
            className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-[#6C63FF] transition-all"
          />
        </div>

        {/* Analyze Content Button */}
        <motion.button
          onClick={handleAnalysis}
          disabled={!title || !content || !selectedCategory || isAnalyzing}
          className={`w-full py-4 rounded-2xl font-bold text-lg mb-6 transition-all ${
            title && content && selectedCategory && !isAnalyzing
              ? 'bg-[#EAB308] text-white shadow-lg shadow-yellow-200/50'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileTap={title && content && selectedCategory && !isAnalyzing ? { scale: 0.98 } : {}}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Smart Analysis...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Analyze Quality</span>
            </div>
          )}
        </motion.button>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* AI Analysis Results */}
        <AnimatePresence>
          {aiAnalysis && !isAnalyzing && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={`${getQualityColor(aiAnalysis.quality)} rounded-3xl p-6 text-white shadow-lg`}>
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6" />
                  <h3 className="text-xl font-bold">AI Analysis</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Content Quality</span>
                    <span className="text-2xl font-bold">{(aiAnalysis.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${aiAnalysis.score * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <p className="mb-4">{aiAnalysis.feedback}</p>
                {aiAnalysis.suggestions.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Suggestions:</p>
                    <ul className="space-y-1">
                      {aiAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span>•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <div className="mb-6">
          <label className="block text-gray-900 font-semibold mb-3">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a meaningful caption..."
            className="w-full h-32 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 outline-none focus:border-[#6C63FF] transition-all resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">{caption.length} / 500</span>
            {caption.length > 0 && caption.length < 20 && (
              <div className="flex items-center gap-1 text-[#FF6B6B] text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Caption too short</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Selector */}
        <div className="mb-8">
          <label className="block text-gray-900 font-semibold mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Button */}
        <motion.button
          onClick={handleUpload}
          disabled={
            !selectedImage ||
            !caption ||
            caption.length < 20 ||
            !selectedCategory ||
            isUploading ||
            !aiAnalysis
          }
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            selectedImage && caption && caption.length >= 20 && selectedCategory && aiAnalysis && !isUploading
              ? 'bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileTap={
            selectedImage && caption && caption.length >= 20 && selectedCategory && aiAnalysis && !isUploading
              ? { scale: 0.98 }
              : {}
          }
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Uploading... {uploadProgress}%</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              <span>Upload Content</span>
            </div>
          )}
        </motion.button>

        {/* Upload Progress Bar */}
        {isUploading && (
          <motion.div
            className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#6C63FF] to-[#3A86FF]"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        )}
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 flex flex-col items-center max-w-sm mx-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <motion.div
                className="w-20 h-20 bg-[#51CF66] rounded-full flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
              <p className="text-gray-600 text-center mb-4">Your content has been shared</p>
              {aiAnalysis && (
                <div className="bg-[#51CF66]/10 rounded-2xl p-4 w-full">
                  <p className="text-center text-[#51CF66] font-bold">
                    +{Math.round(aiAnalysis.score * 50)} XP Earned
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
