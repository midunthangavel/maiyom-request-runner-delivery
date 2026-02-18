import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Camera, MapPin, Clock, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { MissionScenario, scenarioIcons, scenarioLabels } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const CreateMission = () => {
  const navigate = useNavigate();
  const { setMissions } = useApp();
  const { toast } = useToast();
  const [scenario, setScenario] = useState<MissionScenario>("traveling");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const handleSubmit = () => {
    if (!title || !description || (scenario === "traveling" && !to)) return;
    setMissions((prev) => [
      {
        id: `m${Date.now()}`,
        requesterId: "u1",
        title,
        description,
        scenario,
        from: from || "Current Location",
        to,
        deliveryLocation: deliveryLocation || to,
        arrivalTime: arrivalTime || "ASAP",
        budgetMin: Number(budgetMin) || 200,
        budgetMax: Number(budgetMax) || 500,
        status: "open",
        category: "General",
        createdAt: "Just now",
      },
      ...prev,
    ]);
    toast({ title: "🎉 Mission posted!", description: "Runners can now see your mission" });
    navigate("/missions");
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display font-semibold text-foreground">Create Mission</h1>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-5 space-y-5 pb-24">
        {/* Scenario */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Scenario</label>
          <div className="flex gap-2">
            {(["traveling", "event", "urgent"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${scenario === s
                  ? "border-primary bg-secondary text-secondary-foreground"
                  : "border-border bg-card text-muted-foreground"
                  }`}
              >
                {scenarioIcons[s]} {scenarioLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">What do you need?</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Flowers + Gift Box"
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Details</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe exactly what you need..."
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary resize-none placeholder:text-muted-foreground/50 font-body"
          />
        </div>

        {/* Photo */}
        <button className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground w-full justify-center bg-card">
          <Camera size={16} /> Add Reference Photo
        </button>

        {scenario === "traveling" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From</label>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="City/Location"
                className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To</label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="City/Location"
                className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
              />
            </div>
          </div>
        )}

        {/* Delivery Location */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <MapPin size={12} /> Delivery Location
          </label>
          <input
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="Platform 3, Chennai Central"
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
          />
        </div>

        {/* Arrival Time */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Clock size={12} /> Arrival Time
          </label>
          <input
            type="datetime-local"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-body"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <IndianRupee size={12} /> Budget Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="Min ₹200"
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
            />
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="Max ₹500"
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title || !description}
          className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow disabled:opacity-40"
        >
          Post Mission
        </button>
      </motion.div>
    </div>
  );
};

export default CreateMission;
