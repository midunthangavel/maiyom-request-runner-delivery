import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Camera, MapPin, Clock, IndianRupee, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { scenarioIcons, scenarioLabels, CITY_COORDS } from "@/lib/constants";
import { MissionScenario } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useCreateMission } from "@/hooks/useSupabase";

const CreateMission = () => {
  const navigate = useNavigate();
  // const { setMissions } = useApp(); // Removed mock state setter
  const { userProfile } = useApp();
  const { toast } = useToast();
  const createMission = useCreateMission();

  const [scenario, setScenario] = useState<MissionScenario>("traveling");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [category, setCategory] = useState("General");

  const handleSubmit = async () => {
    if (!title || !description || (scenario === "traveling" && !to)) return;

    if (!userProfile?.id) {
      toast({ title: "Error", description: "You must be logged in to post a mission.", variant: "destructive" });
      return;
    }

    try {
      // Basic Mock Geocoding
      let lat = null;
      let lng = null;
      let city = to || deliveryLocation; // try to find city in 'to' or 'deliveryLocation'

      // Simple check if any key in CITY_COORDS is present in the string
      const foundCity = Object.keys(CITY_COORDS).find(c => city.toLowerCase().includes(c.toLowerCase()));

      if (foundCity) {
        const [baseLat, baseLng] = CITY_COORDS[foundCity];
        // Add small random offset to avoid stacking (approx 500m-1km radius)
        lat = baseLat + (Math.random() - 0.5) * 0.02;
        lng = baseLng + (Math.random() - 0.5) * 0.02;
      }

      await createMission.mutateAsync({
        requester_id: userProfile.id,
        title,
        description,
        scenario,
        from_location: from || "Current Location",
        to_location: to,
        delivery_location: deliveryLocation || to,
        arrival_time: arrivalTime || "ASAP",
        budget_min: Number(budgetMin) || 200,
        budget_max: Number(budgetMax) || 500,
        status: "open",
        category: category,
        lat,
        lng,
        // created_at is handled by default in DB
      });
      toast({ title: "🎉 Mission posted!", description: "Runners can now see your mission" });
      navigate("/missions");
    } catch (error) {
      console.error("Error creating mission:", error);
      toast({ title: "Error", description: "Failed to post mission. Please try again.", variant: "destructive" });
    }
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
            className="w-full bg-card border-border border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
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

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Hash size={12} /> Category
          </label>
          <div className="flex flex-wrap gap-2">
            {["General", "Medicine", "Food", "Gifts", "Electronics", "Documents"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
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
          disabled={!title || !description || createMission.isPending}
          className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow disabled:opacity-40"
        >
          {createMission.isPending ? "Posting..." : "Post Mission"}
        </button>
      </motion.div>
    </div>
  );
};

export default CreateMission;
