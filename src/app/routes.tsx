import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./components/Home";
import { AIEngine } from "./components/AIEngine";
import { Analytics } from "./components/Analytics";
import { Gamification } from "./components/Gamification";
import { Settings } from "./components/Settings";
import { Auth } from "./components/Auth";
import { LoadingScreen } from "./components/mobile/LoadingScreen";
import { MobileLayout } from "./components/mobile/MobileLayout";
import { FeedScreen } from "./components/mobile/FeedScreen";
import { UploadScreen } from "./components/mobile/UploadScreen";
import { DashboardScreen } from "./components/mobile/DashboardScreen";
import { GamificationScreen } from "./components/mobile/GamificationScreen";
import { StreaksScreen } from "./components/mobile/StreaksScreen";
import { ProfileScreen } from "./components/mobile/ProfileScreen";
import { SearchScreen } from "./components/mobile/SearchScreen";
import { SettingsScreen } from "./components/mobile/SettingsScreen";
import { UserFlowGuide } from "./components/mobile/UserFlowGuide";
import { NavigationDemo } from "./components/mobile/NavigationDemo";
import { PostDetailScreen } from "./components/mobile/PostDetailScreen";
import { CosmicAuth } from "./components/mobile/CosmicAuth";
import { SearchResultsScreen } from "./components/mobile/SearchResultsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: CosmicAuth,
  },
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/loading",
    Component: LoadingScreen,
  },
  {
    path: "/mobile-guide",
    Component: UserFlowGuide,
  },
  {
    path: "/navigation-demo",
    Component: NavigationDemo,
  },
  {
    path: "/desktop",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "ai-engine", Component: AIEngine },
      { path: "analytics", Component: Analytics },
      { path: "gamification", Component: Gamification },
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "/mobile",
    Component: MobileLayout,
    children: [
      { path: "feed", Component: FeedScreen },
      { path: "post/:postId", Component: PostDetailScreen },
      { path: "search", Component: SearchScreen },
      { path: "search-results", Component: SearchResultsScreen },
      { path: "upload", Component: UploadScreen },
      { path: "dashboard", Component: DashboardScreen },
      { path: "gamification", Component: GamificationScreen },
      { path: "streaks", Component: StreaksScreen },
      { path: "profile", Component: ProfileScreen },
      { path: "settings", Component: SettingsScreen },
    ],
  },
]);