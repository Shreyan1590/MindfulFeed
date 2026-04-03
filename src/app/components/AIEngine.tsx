import { Brain, Check, AlertTriangle, TrendingUp, Zap } from "lucide-react";

interface QualityFactor {
  name: string;
  score: number;
  description: string;
}

const qualityFactors: QualityFactor[] = [
  {
    name: "Depth of Content",
    score: 0.94,
    description: "Rich, well-researched information with actionable insights"
  },
  {
    name: "Source Credibility",
    score: 0.91,
    description: "Published by verified experts and trusted institutions"
  },
  {
    name: "Educational Value",
    score: 0.88,
    description: "Teaches new concepts or skills with practical application"
  },
  {
    name: "Engagement Quality",
    score: 0.85,
    description: "Encourages reflection and critical thinking"
  },
  {
    name: "Emotional Balance",
    score: 0.92,
    description: "Balanced tone without sensationalism or negativity"
  },
];

export function AIEngine() {
  const overallScore = 0.90;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-5xl mb-4 tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          AI Attention Engine
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our advanced AI analyzes every piece of content across multiple dimensions to ensure it deserves your time and attention.
        </p>
      </div>

      {/* Quality Meter */}
      <div className="mb-12">
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-12 border border-border text-center">
          <h2 className="text-2xl mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
            Current Content Quality Score
          </h2>
          
          {/* Circular Score Display */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted/30"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${overallScore * 534.07} 534.07`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F766E" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-6xl mb-2" style={{ fontFamily: 'var(--font-serif)', color: '#0F766E' }}>
                {(overallScore * 100).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-primary">
            <Check className="w-5 h-5" />
            <span className="text-lg">Excellent quality - Highly recommended for focused reading</span>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="mb-12">
        <h2 className="text-3xl mb-8 text-center" style={{ fontFamily: 'var(--font-serif)' }}>
          Quality Analysis Breakdown
        </h2>
        
        <div className="space-y-4">
          {qualityFactors.map((factor, index) => (
            <div
              key={index}
              className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                    {factor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {factor.description}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-2xl" style={{ fontFamily: 'var(--font-serif)', color: '#0F766E' }}>
                    {(factor.score * 100).toFixed(0)}
                  </span>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full transition-all duration-1000"
                  style={{ width: `${factor.score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Real-Time Analysis
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Content is analyzed instantly as it's published, ensuring you only see the highest quality material.
          </p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Multi-Factor Scoring
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our AI evaluates content across 15+ dimensions including depth, credibility, and emotional balance.
          </p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Negativity Filter
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Automatically filters out sensationalist, polarizing, or anxiety-inducing content to protect your mental health.
          </p>
        </div>
      </div>
    </div>
  );
}
