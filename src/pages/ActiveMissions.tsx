import PageShell from "@/components/PageShell";
import MissionCard from "@/components/MissionCard";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { CardSkeleton } from "@/components/SkeletonLoader";

import { useMyMissions } from "@/hooks/useSupabase";

const ActiveMissions = () => {
  const { userId } = useApp();
  const { data: myMissions = [], isLoading } = useMyMissions(userId || "");
  const navigate = useNavigate();
  // const myMissions = missions.filter((m) => m.requesterId === "u1"); // specific logic removed

  return (
    <PageTransition>
      <PageShell>
        <div className="px-5 pt-6 pb-4 glass-panel sticky top-0 z-20 mb-4 rounded-b-3xl">
          <h1 className="text-xl font-display font-bold text-foreground">Your Missions</h1>
          <p className="text-xs text-muted-foreground mt-1">{myMissions.length} missions</p>
        </div>
        <div className="px-5 space-y-3">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : myMissions.length > 0 ? (
            myMissions.map((m, i) => (
              <MissionCard key={m.id} mission={m} index={i} />
            ))
          ) : (
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
    </PageTransition>
  );
};

export default ActiveMissions;
