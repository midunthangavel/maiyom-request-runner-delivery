import { Home, Search, MessageSquare, User, Zap, Wallet, Bell, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRole } = useApp();
  const { unreadMessages, unreadAlerts, totalUnread } = useNotifications();
  const { t } = useLanguage();

  const requesterTabs = [
    { path: "/home", icon: Home, label: t("nav.home"), badge: 0 },
    { path: "/missions", icon: Zap, label: t("nav.myRequests"), badge: 0 },
    { path: "/chat", icon: MessageSquare, label: t("nav.chat"), badge: unreadMessages },
    { path: "/profile", icon: User, label: t("nav.profile"), badge: 0 },
  ];

  const runnerTabs = [
    { path: "/feed", icon: Search, label: t("nav.feed"), badge: 0 },
    { path: "/my-missions", icon: Zap, label: t("nav.myJobs"), badge: 0 },
    { path: "/map", icon: MapPin, label: t("nav.map"), badge: 0 },
    { path: "/chat", icon: MessageSquare, label: t("nav.chat"), badge: unreadMessages },
    { path: "/profile", icon: User, label: t("nav.profile"), badge: 0 },
  ];

  const tabs = currentRole === "requester" ? requesterTabs : runnerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-2 right-2 h-0.5 bg-gradient-primary rounded-full"
                />
              )}
              <div className="relative">
                <motion.div
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <tab.icon
                    size={20}
                    className={isActive ? "text-primary" : "text-muted-foreground"}
                  />
                </motion.div>
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-0.5 border border-card">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
