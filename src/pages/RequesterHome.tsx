import PageShell from "@/components/PageShell";
import MissionCard from "@/components/MissionCard";
import OnboardingTour from "@/components/OnboardingTour";
import { useApp } from "@/contexts/AppContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useMissions } from "@/hooks/useSupabase";
import { motion } from "framer-motion";
import { Plus, Bell, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RequesterHome = () => {
  const { userProfile } = useApp();
  const { data: missions = [] } = useMissions();
  const { unreadAlerts } = useNotifications();
  const navigate = useNavigate();

  // Filter active missions for current user
  // User ID should come from userProfile.id
  const userId = userProfile?.id;
  const activeMissions = missions.filter((m) => m.requester_id === userId && m.status !== "delivered");
  const walletBalance = 0; // distinct wallet table needed or field in profile. Profile doesn't have it yet.

  const userName = userProfile?.name || "User";

  return (
    <PageShell>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Good evening,</p>
            <h1 className="text-xl font-display font-bold text-foreground">{userName.split(" ")[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-full bg-card border border-border"
            >
              <Bell size={18} className="text-foreground" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-0.5">
                  {unreadAlerts > 9 ? "9+" : unreadAlerts}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Location Bar */}
        <button
          onClick={() => navigate("/saved-locations")}
          className="flex items-center gap-2 text-xs text-muted-foreground mb-5 hover:text-primary transition-colors"
        >
          <MapPin size={12} className="text-primary" />
          <span>{userProfile?.city || "Select Location"}</span>
        </button>

        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/create-mission")}
          className="w-full py-4 rounded-xl bg-gradient-primary text-primary-foreground font-display font-semibold text-base flex items-center justify-center gap-2 shadow-glow animate-pulse-glow"
        >
          <Plus size={20} /> I Need Something
        </motion.button>
      </div>

      {/* Wallet Card */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between shadow-card">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wallet Balance</p>
            <p className="text-xl font-display font-bold text-foreground">₹{walletBalance.toLocaleString()}</p>
          </div>
          <button
            onClick={() => navigate("/wallet")}
            className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full"
          >
            Add Money
          </button>
        </div>
      </div>

      {/* Active Missions */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-foreground">Your Active Missions</h2>
          <button onClick={() => navigate("/missions")} className="text-xs text-primary font-medium">
            See All
          </button>
        </div>
        <div className="space-y-3">
          {activeMissions.length > 0 ? (
            activeMissions.map((m, i) => <MissionCard key={m.id} mission={m} index={i} />)
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active missions. Tap above to create one!
            </div>
          )}
        </div>
      </div>

      {/* Nearby Missions */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-foreground">Nearby Missions</h2>
        </div>
        <div className="space-y-3">
          {missions.filter(m => m.status === "open").slice(0, 2).map((m, i) => (
            <MissionCard key={m.id} mission={m} showDistance index={i} />
          ))}
        </div>
      </div>

      {/* Onboarding Tour - shows once for new users */}
      <OnboardingTour />
    </PageShell>
  );
};

export default RequesterHome;
