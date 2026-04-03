import { Outlet, NavLink } from "react-router";
import { Home, Brain, BarChart3, Trophy, Settings } from "lucide-react";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-card/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              <span className="text-primary">Mindful</span>
              <span className="text-foreground">Feed</span>
            </h1>
            <nav className="flex gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Feed</span>
              </NavLink>
              <NavLink
                to="/ai-engine"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI Engine</span>
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </NavLink>
              <NavLink
                to="/gamification"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
