# 🔗 Cloudflare Integration Example

## How to Integrate Cloudflare with EnhancedAICharacter

### **Step 1: Import the Hook**

Add to the top of `/src/app/components/mobile/EnhancedAICharacter.tsx`:

```tsx
import { useCloudflare } from '../../hooks/useCloudflare';
```

### **Step 2: Use the Hook**

Inside the component:

```tsx
export function EnhancedAICharacter({ article }: { article: ArticleData }) {
  // ... existing state ...
  
  // Add Cloudflare hook
  const { 
    isConnected, 
    saveProgress, 
    loadProgress,
    logActivity,
    saveChatMessage,
    uploadImage 
  } = useCloudflare();
  
  // Get user ID (you can use real auth later)
  const userId = 'user-' + (localStorage.getItem('userId') || Math.random().toString(36));
  
  // ... rest of component
}
```

### **Step 3: Load Progress on Mount**

```tsx
// Load saved progress when component mounts
useEffect(() => {
  const loadSavedProgress = async () => {
    const savedProgress = await loadProgress(userId);
    
    if (savedProgress) {
      console.log('📖 Loaded saved progress:', savedProgress);
      setTotalPoints(savedProgress.totalPoints);
      
      // Restore badges
      const savedBadgeIds = savedProgress.badges;
      setBadges(prev => prev.map(badge => ({
        ...badge,
        earned: savedBadgeIds.includes(badge.id)
      })));
    }
  };
  
  loadSavedProgress();
}, [userId]);
```

### **Step 4: Save Progress When Points Change**

```tsx
// Update the awardPoints function
const awardPoints = async (points: number, reason?: string) => {
  const newTotal = totalPoints + points;
  setTotalPoints(newTotal);
  setLastPointsEarned(points);
  setShowPointsAnimation(true);
  setCharacterMood('celebrating');
  setShowParticles(true);
  
  // Speak points announcement
  const message = `${getTranslatedMessage('pointsEarned')} ${points} ${reason ? '. ' + reason : ' points!'}`;
  speakText(message, true);
  
  // 💾 SAVE TO CLOUDFLARE
  await saveProgress(userId, {
    totalPoints: newTotal,
    badges: badges.filter(b => b.earned).map(b => b.id),
    quizProgress: {},
  });
  
  // 📊 LOG ACTIVITY
  await logActivity(userId, 'points_earned', {
    points,
    reason,
    articleId: article.id,
  });
  
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
```

### **Step 5: Save Chat Messages**

```tsx
// Update handleChatSend
const handleChatSend = async () => {
  if (!chatInput.trim()) return;

  const userMessage = chatInput.trim();
  const timestamp = Date.now();
  
  setChatMessages(prev => [...prev, { type: 'user', text: userMessage, timestamp }]);
  setChatInput('');
  setCharacterMood('thinking');
  setIsLoadingAI(true);

  // 💾 SAVE USER MESSAGE
  await saveChatMessage(userId, article.id, userMessage, 'user');

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
    
    // 💾 SAVE BOT RESPONSE
    await saveChatMessage(userId, article.id, response, 'bot');
    
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
```

### **Step 6: Log All Activities**

```tsx
// Update earnBadge
const earnBadge = async (badgeId: string) => {
  const badge = badges.find(b => b.id === badgeId);
  if (!badge || badge.earned) return;
  
  setBadges(prev => prev.map(b => 
    b.id === badgeId ? { ...b, earned: true } : b
  ));
  
  // Announce badge
  const message = `${getTranslatedMessage('badgeEarned')} ${badge.name}!`;
  speakText(message, true);
  
  // 📊 LOG BADGE EARNED
  await logActivity(userId, 'badge_earned', {
    badgeId,
    badgeName: badge.name,
    articleId: article.id,
  });
  
  // 💾 SAVE PROGRESS
  await saveProgress(userId, {
    totalPoints,
    badges: [...badges.filter(b => b.earned).map(b => b.id), badgeId],
    quizProgress: {},
  });
};
```

### **Step 7: Track Language Changes**

```tsx
// Update handleLanguageChange
const handleLanguageChange = async (lang: Language) => {
  setSelectedLanguage(lang);
  setShowLanguageMenu(false);
  setIsLoadingAI(true);
  setCharacterMood('thinking');
  
  // Announce language change
  const message = `${getTranslatedMessage('languageChanged')} ${lang.name}`;
  speakText(message);
  
  // 📊 LOG LANGUAGE CHANGE
  await logActivity(userId, 'language_changed', {
    from: selectedLanguage.code,
    to: lang.code,
    articleId: article.id,
  });
  
  if (lang.code !== 'en') {
    earnBadge('language-lover');
    awardPoints(10, 'Exploring new languages!');
  }
  
  // Reload AI analysis in new language
  await loadAIAnalysis();
  
  setCharacterMood('excited');
  setIsLoadingAI(false);
};
```

### **Step 8: Show Connection Status**

Add a connection indicator to the header:

```tsx
{/* Connection Status Indicator */}
<div className="flex items-center gap-2 mt-2">
  {isConnected ? (
    <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-green-300 text-xs">Cloud Sync On</span>
    </div>
  ) : (
    <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
      <span className="text-yellow-300 text-xs">Offline Mode</span>
    </div>
  )}
</div>
```

---

## 🎯 **Complete Integration Example**

Here's a complete example of the component with Cloudflare:

```tsx
import { useCloudflare } from '../../hooks/useCloudflare';

export function EnhancedAICharacter({ article }: { article: ArticleData }) {
  // Cloudflare integration
  const { 
    isConnected, 
    saveProgress, 
    loadProgress,
    logActivity,
    saveChatMessage,
  } = useCloudflare();
  
  const userId = 'user-' + (localStorage.getItem('userId') || Math.random().toString(36));
  
  // ... existing state ...
  
  // Load progress on mount
  useEffect(() => {
    const load = async () => {
      const saved = await loadProgress(userId);
      if (saved) {
        setTotalPoints(saved.totalPoints);
        setBadges(prev => prev.map(b => ({
          ...b,
          earned: saved.badges.includes(b.id)
        })));
      }
    };
    load();
  }, []);
  
  // Save progress automatically
  useEffect(() => {
    const save = async () => {
      if (totalPoints > 0) {
        await saveProgress(userId, {
          totalPoints,
          badges: badges.filter(b => b.earned).map(b => b.id),
          quizProgress: {},
        });
      }
    };
    save();
  }, [totalPoints, badges]);
  
  // Award points with cloud sync
  const awardPoints = async (points: number, reason?: string) => {
    const newTotal = totalPoints + points;
    setTotalPoints(newTotal);
    
    await saveProgress(userId, { totalPoints: newTotal });
    await logActivity(userId, 'points_earned', { points, reason });
    
    // ... rest of function
  };
  
  // ... rest of component
  
  return (
    <div>
      {/* Show connection status */}
      {isConnected && (
        <div className="text-green-400 text-xs">☁️ Synced</div>
      )}
      
      {/* ... rest of UI */}
    </div>
  );
}
```

---

## ✅ **What You Get**

With this integration:

✅ **Auto-Save** - Progress saved to cloud automatically  
✅ **Activity Tracking** - Every action logged  
✅ **Chat History** - Messages persisted  
✅ **Cross-Device** - Access progress anywhere  
✅ **Offline Support** - Works without connection  
✅ **Analytics Ready** - Activity data for insights  

**Your AI tutor now has cloud superpowers!** ☁️✨
