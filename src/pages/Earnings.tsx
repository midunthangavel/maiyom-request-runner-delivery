import PageShell from "@/components/PageShell";
import { useApp } from "@/contexts/AppContext";
import { IndianRupee, Star, TrendingUp, Flame, Award, ChevronRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Earnings = () => {
  const { userProfile } = useApp();
  // Placeholder runner stats until we have a real earnings table
  const runner = {
    earnings: { today: 0, weekly: 0 },
    rating: userProfile?.rating || 5.0,
    streak: 0,
    completedMissions: userProfile?.completed_missions || 0
  };
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-display font-bold text-foreground mb-5">Earnings</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-card rounded-lg border border-border p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-xl font-display font-bold text-foreground">₹{runner.earnings.today}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-success" />
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <p className="text-xl font-display font-bold text-foreground">₹{runner.earnings.weekly.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <Star size={14} className="text-warning fill-warning" />
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
            <p className="text-xl font-display font-bold text-foreground">{runner.rating}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <p className="text-xl font-display font-bold text-foreground">{runner.streak} days 🔥</p>
          </div>
        </div>

        {/* Missions Completed */}
        <div className="bg-secondary rounded-lg p-4 flex items-center gap-3 mb-4">
          <Award size={24} className="text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{runner.completedMissions} Missions Completed</p>
            <p className="text-xs text-muted-foreground">You're in the top 5% of runners!</p>
          </div>
        </div>

        {/* View Analytics */}
        <button
          onClick={() => navigate("/analytics")}
          className="w-full bg-card rounded-lg border border-border p-4 flex items-center gap-3 shadow-card hover:bg-muted/50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 size={18} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">View Analytics</p>
            <p className="text-xs text-muted-foreground">Charts, trends & insights</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>
    </PageShell>
  );
};

export default Earnings;
