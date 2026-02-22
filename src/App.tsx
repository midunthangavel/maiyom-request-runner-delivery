import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { lazy, Suspense } from "react";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AnimatePresence } from "framer-motion";

const Auth = lazy(() => import("./pages/Auth"));
const RequesterHome = lazy(() => import("./pages/RequesterHome"));
const CreateMission = lazy(() => import("./pages/CreateMission"));
const ActiveMissions = lazy(() => import("./pages/ActiveMissions"));
const MissionDetail = lazy(() => import("./pages/MissionDetail"));
const RunnerFeed = lazy(() => import("./pages/RunnerFeed"));
const RunnerMissions = lazy(() => import("./pages/RunnerMissions"));
const SubmitOffer = lazy(() => import("./pages/SubmitOffer"));
const Tracking = lazy(() => import("./pages/Tracking"));
const Chat = lazy(() => import("./pages/Chat"));
const ChatList = lazy(() => import("./pages/ChatList"));
const Profile = lazy(() => import("./pages/Profile"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Earnings = lazy(() => import("./pages/Earnings"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ConfirmDelivery = lazy(() => import("./pages/ConfirmDelivery"));
const RateRunner = lazy(() => import("./pages/RateRunner"));
const RunnerQR = lazy(() => import("./pages/RunnerQR"));
const Notifications = lazy(() => import("./pages/Notifications"));
const MissionMap = lazy(() => import("./pages/MissionMap"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const SavedLocations = lazy(() => import("./pages/SavedLocations"));
const Verification = lazy(() => import("./pages/Verification"));
const Reviews = lazy(() => import("./pages/Reviews"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Welcome = lazy(() => import("./pages/Welcome"));
const HelpSupport = lazy(() => import("./pages/HelpSupport"));
const ReferralProgram = lazy(() => import("./pages/ReferralProgram"));
const RunnerMap = lazy(() => import("./pages/RunnerMap"));
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";

const queryClient = new QueryClient();

import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />;

  return <>{children}</>;
};

const RoleRouter = () => {
  const { currentRole } = useApp();
  return currentRole === "requester" ? <RequesterHome /> : <RunnerFeed />;
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<AuthGate><RoleRouter /></AuthGate>} />
        <Route path="/create-mission" element={<AuthGate><CreateMission /></AuthGate>} />
        <Route path="/missions" element={<AuthGate><ActiveMissions /></AuthGate>} />
        <Route path="/mission/:id" element={<AuthGate><MissionDetail /></AuthGate>} />
        <Route path="/feed" element={<AuthGate><RunnerFeed /></AuthGate>} />
        <Route path="/my-missions" element={<AuthGate><RunnerMissions /></AuthGate>} />
        <Route path="/submit-offer/:missionId" element={<AuthGate><SubmitOffer /></AuthGate>} />
        <Route path="/tracking/:id" element={<AuthGate><Tracking /></AuthGate>} />
        <Route path="/chat" element={<AuthGate><ChatList /></AuthGate>} />
        <Route path="/chat/:id" element={<AuthGate><Chat /></AuthGate>} />
        <Route path="/profile" element={<AuthGate><Profile /></AuthGate>} />
        <Route path="/wallet" element={<AuthGate><Wallet /></AuthGate>} />
        <Route path="/earnings" element={<AuthGate><Earnings /></AuthGate>} />
        <Route path="/analytics" element={<AuthGate><Analytics /></AuthGate>} />
        <Route path="/confirm-delivery/:id" element={<AuthGate><ConfirmDelivery /></AuthGate>} />
        <Route path="/rate/:id" element={<AuthGate><RateRunner /></AuthGate>} />
        <Route path="/runner-qr/:id" element={<AuthGate><RunnerQR /></AuthGate>} />
        <Route path="/notifications" element={<AuthGate><Notifications /></AuthGate>} />
        <Route path="/map" element={<AuthGate><MissionMap /></AuthGate>} />
        <Route path="/saved-locations" element={<AuthGate><SavedLocations /></AuthGate>} />
        <Route path="/verification" element={<AuthGate><Verification /></AuthGate>} />
        <Route path="/reviews" element={<AuthGate><Reviews /></AuthGate>} />
        <Route path="/settings" element={<AuthGate><Settings /></AuthGate>} />
        <Route path="/help-support" element={<AuthGate><HelpSupport /></AuthGate>} />
        <Route path="/referrals" element={<AuthGate><ReferralProgram /></AuthGate>} />
        <Route path="/runner-map" element={<AuthGate><RunnerMap /></AuthGate>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PwaInstallPrompt />
        <AppProvider>
          <LanguageProvider>
            <NotificationProvider>
              <BrowserRouter>
                <GlobalErrorBoundary>
                  <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                    <AppRoutes />
                  </Suspense>
                </GlobalErrorBoundary>
              </BrowserRouter>
            </NotificationProvider>
          </LanguageProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
