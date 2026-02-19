import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Auth from "./pages/Auth";
import RequesterHome from "./pages/RequesterHome";
import CreateMission from "./pages/CreateMission";
import ActiveMissions from "./pages/ActiveMissions";
import MissionDetail from "./pages/MissionDetail";
import RunnerFeed from "./pages/RunnerFeed";
import RunnerMissions from "./pages/RunnerMissions";
import SubmitOffer from "./pages/SubmitOffer";
import Tracking from "./pages/Tracking";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Earnings from "./pages/Earnings";
import Analytics from "./pages/Analytics";
import ConfirmDelivery from "./pages/ConfirmDelivery";
import RateRunner from "./pages/RateRunner";
import RunnerQR from "./pages/RunnerQR";
import Notifications from "./pages/Notifications";
import MissionMap from "./pages/MissionMap";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import SavedLocations from "./pages/SavedLocations";
import Verification from "./pages/Verification";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Welcome from "./pages/Welcome";


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

const AppRoutes = () => (
  <Routes>
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
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          <LanguageProvider>
            <NotificationProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </NotificationProvider>
          </LanguageProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
