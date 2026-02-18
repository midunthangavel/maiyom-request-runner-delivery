import PageShell from "@/components/PageShell";
import MissionCard from "@/components/MissionCard";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";

const tabs = ["Pending", "Accepted", "Completed"];

const RunnerMissions = () => {
  const { missions, offers } = useApp();
  const [activeTab, setActiveTab] = useState("Pending");

  const myOffers = offers.filter((o) => o.runnerId === "r1");
  const getStatus = (tab: string) => {
    if (tab === "Pending") return "pending";
    if (tab === "Accepted") return "accepted";
    return "rejected"; // completed placeholder
  };

  const filteredOffers = myOffers.filter((o) => o.status === getStatus(activeTab));
  const filteredMissions = filteredOffers
    .map((o) => missions.find((m) => m.id === o.missionId))
    .filter(Boolean);

  return (
    <PageShell>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-display font-bold text-foreground mb-4">My Missions</h1>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${
                activeTab === tab
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
        {filteredMissions.map((m) => m && <MissionCard key={m.id} mission={m} />)}
        {filteredMissions.length === 0 && (
          <p className="text-center py-12 text-muted-foreground text-sm">No {activeTab.toLowerCase()} missions</p>
        )}
      </div>
    </PageShell>
  );
};

export default RunnerMissions;
