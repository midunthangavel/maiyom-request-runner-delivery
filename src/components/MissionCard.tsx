import { MapPin, Clock, IndianRupee, MessageCircle, Sparkles } from "lucide-react";
import { Mission } from "@/types";
import { scenarioIcons } from "@/lib/constants";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Props {
  mission: Mission;
  showDistance?: boolean;
  variant?: "default" | "compact";
  index?: number;
}

const statusColors: Record<string, string> = {
  open: "bg-success/10 text-success",
  offered: "bg-warning/10 text-warning",
  accepted: "bg-primary/10 text-primary",
  in_transit: "bg-accent/10 text-accent",
  delivered: "bg-muted text-muted-foreground",
};

const MissionCard = ({ mission, showDistance, variant = "default", index = 0 }: Props) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: index * 0.1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate(`/mission/${mission.id}`)}
      className={`bg-card rounded-2xl border p-4 shadow-elevated cursor-pointer hover-lift neumorphic-card ${mission.is_boosted ? "border-yellow-500/50 ring-1 ring-yellow-500/20 bg-yellow-500/5" : "border-border/50"
        }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{scenarioIcons[mission.scenario]}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[mission.status]}`}>
            {mission.status === "open" ? "Open" : mission.status === "offered" ? "Offers In" : mission.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          {mission.scenario === "urgent" && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
              Urgent
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(mission.created_at), { addSuffix: true })}
        </span>
      </div>

      <h3 className="font-display font-semibold text-foreground mb-1 flex items-center gap-2">
        {mission.is_boosted && <Sparkles size={14} className="text-yellow-500 fill-yellow-500 shrink-0" />}
        {mission.title}
      </h3>

      {variant === "default" && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{mission.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {mission.delivery_location.split(",")[0]}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {mission.arrival_time}
        </span>
        {showDistance && mission.distance && (
          <span className="text-primary font-medium">{mission.distance} away</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
          <IndianRupee size={14} />
          {mission.budget_min}–{mission.budget_max}
        </div>
        <div className="flex items-center gap-2">
          {["accepted", "in_transit", "delivered"].includes(mission.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chat/${mission.id}`);
              }}
              className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Chat"
            >
              <MessageCircle size={16} />
            </button>
          )}
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            {mission.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MissionCard;
