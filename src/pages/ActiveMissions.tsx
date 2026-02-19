import PageShell from "@/components/PageShell";
import MissionCard from "@/components/MissionCard";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import { motion } from "framer-motion";

import { useMyMissions } from "@/hooks/useSupabase";

const ActiveMissions = () => {
  const { userId } = useApp();
  const { data: myMissions = [], isLoading } = useMyMissions(userId || "");
  const navigate = useNavigate();
  // const myMissions = missions.filter((m) => m.requesterId === "u1"); // specific logic removed

  return (
    <PageShell>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-display font-bold text-foreground">Your Missions</h1>
        <p className="text-xs text-muted-foreground mt-1">{myMissions.length} missions</p>
      </div>
      <div className="px-5 space-y-3">
        {myMissions.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <MissionCard mission={m} />
          </motion.div>
        ))}
        {myMissions.length === 0 && (
          <EmptyState
            emoji="📦"
            title="No missions yet"
            subtitle="Post your first mission and get it delivered by trusted runners"
            actionLabel="Create Mission"
            onAction={() => navigate("/create-mission")}
          />
        )}
      </div>
    </PageShell>
  );
};

export default ActiveMissions;
