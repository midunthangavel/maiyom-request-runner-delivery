import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { notificationIcons } from "@/lib/mockData";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCheck, Bell } from "lucide-react";

const Notifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadAlerts,
        markAlertRead,
        markAllAlertsRead,
    } = useNotifications();

    const handleAlertTap = (id: string, actionUrl?: string) => {
        markAlertRead(id);
        if (actionUrl) navigate(actionUrl);
    };

    return (
        <div className="min-h-screen max-w-lg mx-auto bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ArrowLeft size={20} className="text-foreground" />
                    </button>
                    <h1 className="font-display font-semibold text-foreground flex-1">Notifications</h1>
                    {unreadAlerts > 0 && (
                        <button
                            onClick={markAllAlertsRead}
                            className="flex items-center gap-1.5 text-xs text-primary font-medium"
                        >
                            <CheckCheck size={14} /> Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Alerts List */}
            <div className="px-5 py-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground text-sm">
                        <Bell size={32} className="mx-auto mb-3 opacity-30" />
                        No notifications yet
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notif) => (
                            <motion.button
                                key={notif.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAlertTap(notif.id, notif.actionUrl)}
                                className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all ${notif.read
                                        ? "bg-card border-border"
                                        : "bg-secondary/50 border-primary/20 shadow-sm"
                                    }`}
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-lg">
                                    {notificationIcons[notif.type]}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm leading-snug ${notif.read ? "text-foreground" : "text-foreground font-semibold"}`}>
                                            {notif.title}
                                        </p>
                                        {!notif.read && (
                                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                                    <p className="text-[10px] text-muted-foreground/70 mt-1">{notif.timestamp}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
