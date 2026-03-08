import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginScreen } from "./components/LoginScreen";
import { SignupScreen } from "./components/SignupScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { LoanReadinessScreen } from "./components/LoanReadinessScreen";
import { ImprovementPlanScreen } from "./components/ImprovementPlanScreen";
import { ScenarioSimulatorScreen } from "./components/ScenarioSimulatorScreen";
import { BankReadyProfileScreen } from "./components/BankReadyProfileScreen";
import { BottomNavigation } from "./components/BottomNavigation";
import { SideNavigation } from "./components/SideNavigation";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<"landing" | "login" | "signup">("landing");
  const [activeScreen, setActiveScreen] = useState("dashboard");

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
  };

  const handleGetStarted = () => {
    setAuthScreen("login");
  };

  const handleNavigate = (screen: string) => {
    setActiveScreen(screen);
  };

  // Show landing/login/signup if not authenticated
  if (!isAuthenticated) {
    if (authScreen === "landing") {
      return (
        <LandingPage
          onGetStarted={handleGetStarted}
          onNavigateToLogin={() => setAuthScreen("login")}
          onNavigateToSignup={() => setAuthScreen("signup")}
        />
      );
    } else if (authScreen === "login") {
      return (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToSignup={() => setAuthScreen("signup")}
        />
      );
    } else {
      return (
        <SignupScreen
          onSignup={handleSignup}
          onNavigateToLogin={() => setAuthScreen("login")}
        />
      );
    }
  }

  // Show main app
  return (
    <BrowserRouter>
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation for Desktop/Tablet */}
      <div className="hidden md:flex md:w-64 md:fixed md:inset-y-0">
      <SideNavigation activeScreen={activeScreen} onNavigate={handleNavigate} />
    </div>
      
      {/* Main Content */}
      <div className="md:ml-64">
        <div className="max-w-md md:max-w-none mx-auto relative">
          {activeScreen === "dashboard" && <DashboardScreen onNavigate={handleNavigate} />}
          {activeScreen === "readiness" && <LoanReadinessScreen onNavigate={handleNavigate} />}
          {activeScreen === "improvement" && <ImprovementPlanScreen onNavigate={handleNavigate} />}
          {activeScreen === "simulator" && <ScenarioSimulatorScreen onNavigate={handleNavigate} />}
          {activeScreen === "profile" && <BankReadyProfileScreen onNavigate={handleNavigate} />}
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile Only */}
      <div className="md:hidden">
      <BottomNavigation activeScreen={activeScreen} onNavigate={handleNavigate} />
    </div>
    </div>
    </BrowserRouter>
  );
}