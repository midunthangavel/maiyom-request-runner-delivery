import PageShell from "@/components/PageShell";
import { useApp } from "@/contexts/AppContext";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useTheme } from "next-themes";
import {
  Star, Shield, MapPin, ChevronRight, LogOut, Settings,
  Moon, Sun, Wallet, TrendingUp, Flame, Package, Zap, Award, MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockRunners } from "@/lib/mockData";
import { getReviewsForRunner, getTrustScore, getAverageRating, type Review } from "@/lib/reviewStore";
import { useState, useEffect } from "react";

const Profile = () => {
  const { userName, currentRole, walletBalance, missions, setAuthenticated } = useApp();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const isRunner = currentRole === "runner";
  const runner = mockRunners[0];
  const myMissions = missions.filter((m) => m.requesterId === "u1");
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (isRunner) {
      setReviews(getReviewsForRunner("r1"));
    }
  }, [isRunner]);

  const avgRating = isRunner ? (getAverageRating("r1") ?? runner.rating) : 4.7;
  const trustBadge = isRunner ? getTrustScore(avgRating, runner.completedMissions) : null;

  const handleLogout = () => {
    setAuthenticated(false);
    navigate("/");
  };

  return (
    <PageShell>
      <div className="px-5 pt-6">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-card text-center mb-5">
          <div className="w-20 h-20 rounded-full bg-gradient-primary mx-auto mb-3 flex items-center justify-center text-3xl">
            {isRunner ? "🏃" : "🧑"}
          </div>
          <h2 className="text-lg font-display font-bold text-foreground">{userName}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Chennai, Tamil Nadu</p>
          <div className="mt-2 flex justify-center">
            <RoleSwitcher />
          </div>

          {/* Role-specific stats */}
          <div className="flex items-center justify-center gap-3 mt-3">
            {isRunner ? (
              <>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star size={12} className="text-warning fill-warning" /> {runner.rating}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{runner.completedMissions} deliveries</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame size={12} className="text-primary" /> {runner.streak} day streak
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star size={12} className="text-warning fill-warning" /> 4.7
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{myMissions.length} missions</span>
              </>
            )}
            <span className="text-xs text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
              <Shield size={10} /> Level {isRunner ? runner.verificationLevel : 2}
            </span>
          </div>
          {/* Trust Score Badge */}
          {trustBadge && (
            <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${trustBadge.color} bg-current/10 px-2.5 py-1 rounded-full`}
              style={{ backgroundColor: 'transparent' }}
            >
              <Award size={12} />
              <span className={trustBadge.color}>{trustBadge.label}</span>
            </div>
          )}
        </div>

        {/* Runner: Earnings Quick Stats */}
        {isRunner && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-card rounded-lg border border-border p-3 shadow-card">
              <p className="text-[10px] text-muted-foreground">Today</p>
              <p className="text-lg font-display font-bold text-foreground">₹{runner.earnings.today}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-3 shadow-card">
              <p className="text-[10px] text-muted-foreground">This Week</p>
              <p className="text-lg font-display font-bold text-foreground">₹{runner.earnings.weekly.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Requester: Wallet Quick View */}
        {!isRunner && (
          <div className="bg-card rounded-lg border border-border p-4 mb-5 shadow-card flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wallet Balance</p>
              <p className="text-xl font-display font-bold text-foreground">₹{walletBalance.toLocaleString()}</p>
            </div>
            <button
              onClick={() => navigate("/wallet")}
              className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-full"
            >
              Manage
            </button>
          </div>
        )}

        {/* Verification */}
        <div className="bg-secondary rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Verification</p>
              <p className="text-xs text-muted-foreground mt-0.5">Complete Aadhaar KYC to reach Level 3</p>
            </div>
            <button
              onClick={() => navigate("/verification")}
              className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-full"
            >
              Verify
            </button>
          </div>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-primary rounded-full" />
          </div>
        </div>

        {/* Menu */}

        {/* Recent Reviews - Runner only */}
        {isRunner && reviews.length > 0 && (
          <div className="mb-5">
            <h3
              onClick={() => navigate("/reviews")}
              className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            >
              <MessageCircle size={14} className="text-primary" /> Recent Reviews
            </h3>
            <div className="space-y-3">
              {reviews.slice(0, 3).map((rev) => (
                <div key={rev.id} className="bg-card rounded-lg border border-border p-3 shadow-card">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= rev.rating ? "text-warning fill-warning" : "text-muted-foreground/20"} />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(rev.date).toLocaleDateString()}
                    </span>
                  </div>
                  {rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {rev.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  {rev.comment && (
                    <p className="text-xs text-muted-foreground line-clamp-2">"{rev.comment}"</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">— {rev.reviewerName}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-1">
          {/* Role-specific links */}
          {isRunner && (
            <button
              onClick={() => navigate("/earnings")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <TrendingUp size={18} className="text-success" />
              <span className="flex-1 text-sm text-foreground text-left">Earnings & Stats</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          )}
          {!isRunner && (
            <button
              onClick={() => navigate("/wallet")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Wallet size={18} className="text-primary" />
              <span className="flex-1 text-sm text-foreground text-left">Wallet & Payments</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          )}

          {/* Common links */}
          {[
            { icon: MapPin, label: "Saved Locations", path: "/saved-locations" },
            { icon: Settings, label: "Settings", path: "/settings" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <item.icon size={18} className="text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground text-left">{item.label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
          >
            {isDark ? <Sun size={18} className="text-warning" /> : <Moon size={18} className="text-muted-foreground" />}
            <span className="flex-1 text-sm text-foreground text-left">Dark Mode</span>
            <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${isDark ? "bg-primary" : "bg-muted"}`}>
              <div className={`w-5 h-5 bg-card rounded-full shadow transition-transform ${isDark ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/5 transition-colors"
          >
            <LogOut size={18} className="text-destructive" />
            <span className="text-sm text-destructive text-left">Log Out</span>
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default Profile;
