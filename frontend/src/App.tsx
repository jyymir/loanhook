import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { SignupScreen } from "./components/SignupScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { LoanReadinessScreen } from "./components/LoanReadinessScreen";
import { ImprovementPlanScreen } from "./components/ImprovementPlanScreen";
import { ScenarioSimulatorScreen } from "./components/ScenarioSimulatorScreen";
import { BankReadyProfileScreen } from "./components/BankReadyProfileScreen";
import { BottomNavigation } from "./components/BottomNavigation";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<"login" | "signup">("login");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeScreen, setActiveScreen] = useState("dashboard");

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
  };

  const handleCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  const handleNavigate = (screen: string) => {
    setActiveScreen(screen);
  };

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    if (authScreen === "login") {
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

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {activeScreen === "dashboard" && <DashboardScreen onNavigate={handleNavigate} />}
        {activeScreen === "readiness" && <LoanReadinessScreen onNavigate={handleNavigate} />}
        {activeScreen === "improvement" && <ImprovementPlanScreen onNavigate={handleNavigate} />}
        {activeScreen === "simulator" && <ScenarioSimulatorScreen onNavigate={handleNavigate} />}
        {activeScreen === "profile" && <BankReadyProfileScreen onNavigate={handleNavigate} />}
        
        <BottomNavigation activeScreen={activeScreen} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
