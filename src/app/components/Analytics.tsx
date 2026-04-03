import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Clock, Eye, BookOpen, Target } from "lucide-react";
import React from "react";

const weeklyData = [
  { day: "Mon", focused: 65, scrolled: 35 },
  { day: "Tue", focused: 72, scrolled: 28 },
  { day: "Wed", focused: 58, scrolled: 42 },
  { day: "Thu", focused: 85, scrolled: 15 },
  { day: "Fri", focused: 78, scrolled: 22 },
  { day: "Sat", focused: 92, scrolled: 8 },
  { day: "Sun", focused: 88, scrolled: 12 },
];

const readingTrend = [
  { week: "Week 1", articles: 28, minutes: 180 },
  { week: "Week 2", articles: 35, minutes: 245 },
  { week: "Week 3", articles: 42, minutes: 312 },
  { week: "Week 4", articles: 48, minutes: 358 },
];

export function Analytics() {
  // Suppress Recharts duplicate key warnings (known library issue)
  React.useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl mb-4 tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          Consumption Analytics
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track your digital wellness journey with detailed insights into your reading habits and focus patterns.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <h3 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>4.2h</h3>
          <p className="text-sm text-muted-foreground">Time Focused</p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">-24%</span>
          </div>
          <h3 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>45m</h3>
          <p className="text-sm text-muted-foreground">Time Scrolled</p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+18%</span>
          </div>
          <h3 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>42</h3>
          <p className="text-sm text-muted-foreground">Articles Read</p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Perfect</span>
          </div>
          <h3 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>0.89</h3>
          <p className="text-sm text-muted-foreground">Avg Quality</p>
        </div>
      </div>

      {/* Time Focused vs Scrolled Chart */}
      <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border mb-12">
        <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
          Weekly Focus vs. Scroll Time
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Track how much time you spend in focused reading versus mindless scrolling
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="colorFocused" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorScrolled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              stroke="#78716c"
              tick={{ fontFamily: 'var(--font-sans)' }}
            />
            <YAxis 
              stroke="#78716c"
              tick={{ fontFamily: 'var(--font-sans)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFBF5',
                border: '1px solid rgba(15, 118, 110, 0.1)',
                borderRadius: '1rem',
                fontFamily: 'var(--font-sans)'
              }}
            />
            <Area
              type="monotone"
              dataKey="scrolled"
              stroke="#F97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorScrolled)"
              name="Time Scrolled (min)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="focused"
              stroke="#0F766E"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorFocused)"
              name="Time Focused (min)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Reading Trend Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border">
          <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            Articles Read
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Your reading volume is growing
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={readingTrend}>
              <XAxis 
                dataKey="week" 
                stroke="#78716c"
                tick={{ fontFamily: 'var(--font-sans)' }}
              />
              <YAxis 
                stroke="#0F766E"
                tick={{ fontFamily: 'var(--font-sans)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFBF5',
                  border: '1px solid rgba(15, 118, 110, 0.1)',
                  borderRadius: '1rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
              <Line
                type="monotone"
                dataKey="articles"
                stroke="#0F766E"
                strokeWidth={3}
                dot={false}
                name="Articles Read"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border">
          <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            Reading Time
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            More time spent on quality content
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={readingTrend}>
              <XAxis 
                dataKey="week" 
                stroke="#78716c"
                tick={{ fontFamily: 'var(--font-sans)' }}
              />
              <YAxis 
                stroke="#EAB308"
                tick={{ fontFamily: 'var(--font-sans)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFBF5',
                  border: '1px solid rgba(15, 118, 110, 0.1)',
                  borderRadius: '1rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#EAB308"
                strokeWidth={3}
                dot={false}
                name="Minutes Spent"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary/5 backdrop-blur-sm rounded-3xl p-8 border border-primary/20">
          <h3 className="text-xl mb-3 text-primary" style={{ fontFamily: 'var(--font-serif)' }}>
            📈 You're Improving!
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your focused reading time has increased by 12% this week compared to last week. Keep up the great work!
          </p>
        </div>
        <div className="bg-secondary/5 backdrop-blur-sm rounded-3xl p-8 border border-secondary/20">
          <h3 className="text-xl mb-3 text-secondary" style={{ fontFamily: 'var(--font-serif)' }}>
            🎯 Best Day
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Saturday was your most mindful day with 92 minutes of focused reading and only 8 minutes of scrolling.
          </p>
        </div>
      </div>
    </div>
  );
}