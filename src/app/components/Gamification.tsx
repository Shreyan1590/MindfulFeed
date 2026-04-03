import { Trophy, Flame, Zap, Award, Star, Target } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
}

const achievements: Achievement[] = [
  {
    id: 1,
    title: "Week Warrior",
    description: "Read for 7 consecutive days",
    icon: <Flame className="w-6 h-6" />,
    unlocked: true,
  },
  {
    id: 2,
    title: "Focus Master",
    description: "Maintain 90%+ focus time for a week",
    icon: <Target className="w-6 h-6" />,
    unlocked: true,
  },
  {
    id: 3,
    title: "Quality Seeker",
    description: "Read 50 articles with 0.85+ score",
    icon: <Star className="w-6 h-6" />,
    unlocked: true,
    progress: 42,
  },
  {
    id: 4,
    title: "Mindful Reader",
    description: "Complete 100 articles",
    icon: <Award className="w-6 h-6" />,
    unlocked: false,
    progress: 73,
  },
  {
    id: 5,
    title: "Deep Diver",
    description: "Spend 20+ hours in focused reading",
    icon: <Zap className="w-6 h-6" />,
    unlocked: false,
    progress: 62,
  },
];

export function Gamification() {
  const currentXP = 3850;
  const nextLevelXP = 5000;
  const currentLevel = 12;
  const currentStreak = 14;

  const xpProgress = (currentXP / nextLevelXP) * 100;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
          <Trophy className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-5xl mb-4 tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          Your Mindfulness Journey
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track your progress, maintain streaks, and unlock achievements as you build better digital habits.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-primary to-teal-400 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-8 h-8" />
            <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              Level {currentLevel}
            </span>
          </div>
          <h2 className="text-5xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {currentLevel}
          </h2>
          <p className="text-white/80 text-sm mb-4">Mindful Explorer</p>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-xs text-white/80">
            {currentXP} / {nextLevelXP} XP
          </p>
        </div>

        {/* Streak Card */}
        <div className="bg-gradient-to-br from-secondary to-orange-400 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <Flame className="w-8 h-8" />
            <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              Active
            </span>
          </div>
          <h2 className="text-5xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {currentStreak}
          </h2>
          <p className="text-white/80 text-sm">Day Streak</p>
          <p className="text-xs text-white/70 mt-4">
            Keep reading daily to maintain your streak! 🔥
          </p>
        </div>

        {/* Total XP Card */}
        <div className="bg-gradient-to-br from-accent to-yellow-400 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8" />
            <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              Total
            </span>
          </div>
          <h2 className="text-5xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {currentXP.toLocaleString()}
          </h2>
          <p className="text-white/80 text-sm">Mindfulness XP</p>
          <p className="text-xs text-white/70 mt-4">
            Earned from focused reading and quality content
          </p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Progress to Level {currentLevel + 1}
            </h2>
            <p className="text-sm text-muted-foreground">
              {nextLevelXP - currentXP} XP needed to level up
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {xpProgress.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-3xl mb-8 text-center" style={{ fontFamily: 'var(--font-serif)' }}>
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-3xl p-6 border transition-all ${
                achievement.unlocked
                  ? "bg-card/60 backdrop-blur-sm border-accent/50 hover:border-accent"
                  : "bg-muted/30 border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked
                      ? "bg-accent/20 text-accent"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                      {achievement.title}
                    </h3>
                    {achievement.unlocked && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {achievement.description}
                  </p>
                  {achievement.progress !== undefined && !achievement.unlocked && (
                    <div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {achievement.progress}% complete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Info */}
      <div className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/20">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Keep Building Your Mindful Habits
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every article you read with intention, every day you maintain your streak, and every moment of focused attention 
            earns you XP. Use your progress as motivation to build lasting digital wellness habits.
          </p>
        </div>
      </div>
    </div>
  );
}
