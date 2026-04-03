import { useState } from "react";
import { Shield, Filter, Users, Bell, Palette, Zap, LogIn, Smartphone } from "lucide-react";
import { useNavigate } from "react-router";

interface SettingToggle {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  category: string;
}

const initialSettings: SettingToggle[] = [
  {
    id: "ai-filtering",
    title: "AI Content Filtering",
    description: "Automatically filter low-quality and sensationalist content",
    enabled: true,
    icon: <Filter className="w-5 h-5" />,
    category: "AI & Quality"
  },
  {
    id: "negativity-shield",
    title: "Negativity Shield",
    description: "Block anxiety-inducing and polarizing content from your feed",
    enabled: true,
    icon: <Shield className="w-5 h-5" />,
    category: "AI & Quality"
  },
  {
    id: "quality-threshold",
    title: "High Quality Threshold (0.80+)",
    description: "Only show content with attention score above 0.80",
    enabled: false,
    icon: <Zap className="w-5 h-5" />,
    category: "AI & Quality"
  },
  {
    id: "family-safe",
    title: "Family-Safe Mode",
    description: "Filter mature content and ensure all material is appropriate for all ages",
    enabled: true,
    icon: <Users className="w-5 h-5" />,
    category: "Privacy & Safety"
  },
  {
    id: "tracking-prevention",
    title: "Cross-App Tracking Prevention",
    description: "Block third-party trackers and protect your reading habits",
    enabled: true,
    icon: <Shield className="w-5 h-5" />,
    category: "Privacy & Safety"
  },
  {
    id: "daily-digest",
    title: "Daily Mindful Digest",
    description: "Receive a curated email digest of top-quality articles each morning",
    enabled: false,
    icon: <Bell className="w-5 h-5" />,
    category: "Notifications"
  },
  {
    id: "streak-reminders",
    title: "Streak Reminders",
    description: "Get gentle reminders to maintain your daily reading streak",
    enabled: true,
    icon: <Bell className="w-5 h-5" />,
    category: "Notifications"
  },
  {
    id: "achievement-alerts",
    title: "Achievement Notifications",
    description: "Celebrate when you unlock new achievements and milestones",
    enabled: true,
    icon: <Bell className="w-5 h-5" />,
    category: "Notifications"
  },
];

export function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const navigate = useNavigate();

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const categories = Array.from(new Set(settings.map(s => s.category)));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Palette className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-5xl mb-4 tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          Settings
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Customize your MindfulFeed experience to match your digital wellness goals.
        </p>
      </div>

      {/* Auth Page Button */}
      <div className="mb-8 text-center">
        <button 
          onClick={() => navigate('/auth')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6C63FF] to-[#3A86FF] text-white rounded-full hover:shadow-lg transition-all mr-3"
        >
          <LogIn className="w-4 h-4" />
          View Authentication Page
        </button>
        <button 
          onClick={() => navigate('/mobile/feed')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#51CF66] to-[#34D399] text-white rounded-full hover:shadow-lg transition-all"
        >
          <Smartphone className="w-4 h-4" />
          Open Mobile App
        </button>
      </div>

      {/* Settings by Category */}
      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              {category}
            </h2>
            <div className="space-y-4">
              {settings
                .filter(s => s.category === category)
                .map((setting) => (
                  <div
                    key={setting.id}
                    className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                          {setting.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                            {setting.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(setting.id)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ml-4 flex-shrink-0 ${
                          setting.enabled ? 'bg-primary' : 'bg-muted'
                        }`}
                        role="switch"
                        aria-checked={setting.enabled}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                            setting.enabled ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="mt-12 bg-primary/5 rounded-3xl p-8 border border-primary/20">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Your Privacy Matters
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MindfulFeed is designed with privacy-first principles. We never sell your data, and all AI processing 
              happens with your privacy in mind. Your reading habits are personal, and we respect that. Learn more in our{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
          Save Preferences
        </button>
        <button className="px-6 py-3 bg-card border border-border text-foreground rounded-full hover:bg-muted transition-colors">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}