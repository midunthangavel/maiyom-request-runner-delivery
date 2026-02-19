import PageShell from "@/components/PageShell";
import MissionCard from "@/components/MissionCard";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";

import { useMyOffers } from "@/hooks/useSupabase";

const tabs = ["Pending", "Accepted", "Completed"];

const RunnerMissions = () => {
  const { userId } = useApp();
  const { data: myOffers = [], isLoading } = useMyOffers(userId || "");
  const [activeTab, setActiveTab] = useState("Pending");

  const getStatus = (tab: string) => {
    if (tab === "Pending") return "pending";
    if (tab === "Accepted") return "accepted";
    // For "Completed", we might want to check if mission is delivered or offer is accepted?
    // Original code returned "rejected" for anything else, assuming "Completed" tab wasn't fully implemented or mapped to "rejected"??
    // Let's keep original logic for now to avoid breaking behavior, but maybe "Completed" tab should show completed missions.
    // If tab is "Completed", typically it means mission status is "delivered".
    // But filteredOffers filters by *offer* status.
    // Let's stick to original logic:
    return "rejected";
  };

  const filteredOffers = myOffers.filter((o) => o.status === getStatus(activeTab));

  return (
    <PageShell>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-display font-bold text-foreground mb-4">My Missions</h1>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 space-y-3">
        {isLoading && <p className="text-center text-muted-foreground text-sm py-4">Loading...</p>}
        {!isLoading && filteredOffers.map((o) => o.mission && <MissionCard key={o.mission.id} mission={o.mission} />)}
        {!isLoading && filteredOffers.length === 0 && (
          <p className="text-center py-12 text-muted-foreground text-sm">No {activeTab.toLowerCase()} missions</p>
        )}
      </div>
    </PageShell>
  );
};

export default RunnerMissions;
