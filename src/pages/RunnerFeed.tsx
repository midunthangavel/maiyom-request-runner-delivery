import PageShell from "@/components/PageShell";
import MissionCard from "@/components/MissionCard";

import { useApp } from "@/contexts/AppContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useMissions } from "@/hooks/useSupabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Bell, X, AlertTriangle, IndianRupee, Sparkles, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FeedSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";
import PageTransition from "@/components/PageTransition";

const categories = ["All", "General", "Medicine", "Food", "Gifts", "Electronics", "Documents"];
const sortOptions = [
  { value: "newest", label: "Newest First", icon: null },
  { value: "smart", label: "Smart Match", icon: Sparkles },
  { value: "price-high", label: "Highest Budget", icon: null },
  { value: "price-low", label: "Lowest Budget", icon: null },
];

const RunnerFeed = () => {
  const { data: missions = [], isLoading: loading } = useMissions();
  console.log("RunnerFeed Missions:", missions);
  const { unreadAlerts } = useNotifications();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [maxDistance, setMaxDistance] = useState(10);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"ASAP" | "Scheduled">("ASAP");

  // Filter Logic (Client-side for now)
  let openMissions = missions
    .filter((m) => m.status === "open" || m.status === "offered")
    .filter((m) => activeTab === "ASAP" ? !m.is_scheduled : m.is_scheduled)
    .filter((m) => activeCategory === "All" || m.category === activeCategory)
    .filter((m) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.delivery_location.toLowerCase().includes(q) ||
        m.from_location.toLowerCase().includes(q) ||
        m.to_location.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    })
    // Price range filter
    .filter((m) => m.budget_max >= priceRange[0] && m.budget_min <= priceRange[1])
    // Urgency filter
    .filter((m) => !urgentOnly || m.scenario === "urgent");

  // Apply sort
  if (sortBy === "price-high") {
    openMissions = [...openMissions].sort((a, b) => b.budget_max - a.budget_max);
  } else if (sortBy === "price-low") {
    openMissions = [...openMissions].sort((a, b) => a.budget_min - b.budget_min);
  } else if (sortBy === "smart") {
    // Smart Match: prioritize urgent
    openMissions = [...openMissions].sort((a, b) => {
      const urgencyA = a.scenario === "urgent" ? 0 : 1;
      const urgencyB = b.scenario === "urgent" ? 0 : 1;
      if (urgencyA !== urgencyB) return urgencyA - urgencyB;
      return b.budget_max - a.budget_max;
    });
  }

  // Pin boosted missions to the top if sorting by newest or smart
  if (sortBy === "newest" || sortBy === "smart") {
    openMissions = [...openMissions].sort((a, b) => {
      if (a.is_boosted === b.is_boosted) return 0;
      return a.is_boosted ? -1 : 1;
    });
  }

  const activeFilterCount =
    (sortBy !== "newest" ? 1 : 0) +
    (maxDistance < 10 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0) +
    (urgentOnly ? 1 : 0);

  const resetFilters = () => {
    setSortBy("newest");
    setMaxDistance(10);
    setPriceRange([0, 1000]);
    setUrgentOnly(false);
  };

  return (
    <PageTransition>
      <PageShell>
        <div className="px-5 pt-6 pb-4 glass-panel sticky top-0 z-20 mb-4 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display font-bold text-foreground">Mission Feed</h1>
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

          {/* ASAP vs Scheduled Tabs */}
          <div className="flex bg-muted p-1 rounded-xl mb-4 relative">
            <motion.div
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-card rounded-lg shadow-sm"
              animate={{ left: activeTab === "ASAP" ? 4 : "50%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab("ASAP")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${activeTab === "ASAP" ? "text-foreground" : "text-muted-foreground"}`}
            >
              ASAP
            </button>
            <button
              onClick={() => setActiveTab("Scheduled")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${activeTab === "Scheduled" ? "text-foreground" : "text-muted-foreground"}`}
            >
              <CalendarClock size={16} /> Scheduled
            </button>
          </div>

          {/* Search — matches title, description, location, category */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
              <Search size={16} className="text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, location, category..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 font-body"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-2.5 rounded-lg border transition-colors ${showFilters || activeFilterCount > 0
                ? "bg-primary/10 border-primary"
                : "bg-card border-border"
                }`}
            >
              <SlidersHorizontal size={16} className={showFilters || activeFilterCount > 0 ? "text-primary" : "text-muted-foreground"} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-1">
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  </div>

                  {/* Sort */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Sort by</p>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${sortBy === opt.value
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : "border-border text-muted-foreground bg-card"
                            }`}
                        >
                          {opt.icon && <opt.icon size={12} />}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Urgency Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-destructive" />
                      <p className="text-xs font-medium text-foreground">Urgent Only</p>
                    </div>
                    <button
                      onClick={() => setUrgentOnly(!urgentOnly)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors ${urgentOnly ? "bg-destructive" : "bg-muted"}`}
                    >
                      <div className={`w-5 h-5 bg-card rounded-full shadow transition-transform ${urgentOnly ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>

                  {/* Price Range */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee size={12} className="text-primary" />
                        <p className="text-xs font-medium text-muted-foreground">Budget Range</p>
                      </div>
                      <p className="text-xs font-semibold text-foreground">₹{priceRange[0]} – ₹{priceRange[1]}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-8">Min</span>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="50"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                          className="flex-1 accent-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-8">Max</span>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="50"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                          className="flex-1 accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Max Distance */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Max Distance</p>
                      <p className="text-xs font-semibold text-foreground">{maxDistance} km</p>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  {/* Reset */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-primary font-medium"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 space-y-3">
          {loading ? (
            <FeedSkeleton />
          ) : openMissions.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="No missions found"
              subtitle={search ? "Try a different search term" : "Check back soon for new missions nearby"}
            />
          ) : (
            openMissions.map((m, i) => (
              <MissionCard key={m.id} mission={m} showDistance index={i} />
            ))
          )}
        </div>
      </PageShell>
    </PageTransition>
  );
};

export default RunnerFeed;
