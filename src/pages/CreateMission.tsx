import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Camera, MapPin, Clock, IndianRupee, Hash, Loader2, Sparkles, Navigation, CalendarClock, Heart, Plus, Minus, MapPin as MapPinIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { scenarioIcons, scenarioLabels } from "@/lib/constants";
import { MissionScenario } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { geocodeAddress } from "@/lib/geocoding";
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
  const [dropoffLocations, setDropoffLocations] = useState<string[]>([]);
  const [arrivalTime, setArrivalTime] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [category, setCategory] = useState("General");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [notifyFavorites, setNotifyFavorites] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [vehicleRequirement, setVehicleRequirement] = useState<'Any' | 'Two-Wheeler' | 'Car' | 'Truck'>('Any');
  const [packageSize, setPackageSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [isAiCalculating, setIsAiCalculating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ min: number; max: number } | null>(null);

  // Mock AI pricing based on input changes
  useEffect(() => {
    if (to && deliveryLocation) {
      setIsAiCalculating(true);
      setAiSuggestion(null);

      const timer = setTimeout(() => {
        // Mock distance logic
        const basePrice = 50;
        const distanceMultiplier = Math.floor(Math.random() * 200) + 50;
        const min = basePrice + distanceMultiplier;
        const max = min + Math.floor(min * 0.4); // 40% margin

        setAiSuggestion({ min, max });
        setIsAiCalculating(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [to, deliveryLocation]);

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setBudgetMin(aiSuggestion.min.toString());
      setBudgetMax(aiSuggestion.max.toString());
      toast({ title: "AI Budget Applied ✨", description: "Smart pricing strategy loaded." });
    }
  };

  const handleAddDropoff = () => {
    if (dropoffLocations.length >= 3) {
      toast({ title: "Max stops reached", description: "You can only add up to 3 additional stops.", variant: "destructive" });
      return;
    }
    setDropoffLocations([...dropoffLocations, ""]);
  };

  const handleUpdateDropoff = (index: number, value: string) => {
    const newLocs = [...dropoffLocations];
    newLocs[index] = value;
    setDropoffLocations(newLocs);
  };

  const handleRemoveDropoff = (index: number) => {
    setDropoffLocations(dropoffLocations.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || (scenario === "traveling" && !to)) return;

    if (!userProfile?.id) {
      toast({ title: "Error", description: "You must be logged in to post a mission.", variant: "destructive" });
      return;
    }

    try {
      // Geocode the delivery address
      let lat = null;
      let lng = null;
      const addressToGeocode = to || deliveryLocation;

      if (addressToGeocode) {
        const coords = await geocodeAddress(addressToGeocode);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
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
        dropoff_locations: dropoffLocations.filter(loc => loc.trim() !== ""),
        is_template: isTemplate,
        is_boosted: isBoosted,
        vehicle_requirement: vehicleRequirement,
        package_size: packageSize,
        // created_at is handled by default in DB
        is_scheduled: isScheduled,
        scheduled_for: isScheduled ? scheduledFor : undefined
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

        {/* Vehicle Requirement & Package Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              Vehicle
            </label>
            <div className="flex bg-card border border-border rounded-lg overflow-hidden">
              <select
                value={vehicleRequirement}
                onChange={(e) => setVehicleRequirement(e.target.value as any)}
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none text-foreground font-body appearance-none"
              >
                <option value="Any">Any Vehicle</option>
                <option value="Two-Wheeler">Two-Wheeler</option>
                <option value="Car">Car</option>
                <option value="Truck">Truck/Van</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              Package Size
            </label>
            <div className="flex bg-card border border-border rounded-lg overflow-hidden">
              <select
                value={packageSize}
                onChange={(e) => setPackageSize(e.target.value as any)}
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none text-foreground font-body appearance-none"
              >
                <option value="Small">Small (Fits in bag)</option>
                <option value="Medium">Medium (Box)</option>
                <option value="Large">Large (Furniture/Bulk)</option>
              </select>
            </div>
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
            <MapPin size={12} /> {scenario === "traveling" ? "Final Drop-off" : "Delivery Location"}
          </label>
          <div className="space-y-3">
            <input
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="Main Delivery Address"
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
            />

            <AnimatePresence>
              {dropoffLocations.map((loc, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <MapPinIcon size={14} />
                    </div>
                    <input
                      value={loc}
                      onChange={(e) => handleUpdateDropoff(index, e.target.value)}
                      placeholder={`Additional Stop ${index + 1}`}
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveDropoff(index)}
                    className="p-2.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {dropoffLocations.length < 3 && (
              <button
                onClick={handleAddDropoff}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary px-2 py-1.5 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Drop-off Stop
              </button>
            )}
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarClock size={16} className="text-primary" /> Schedule for Later
              </label>

              {/* iOS Style Toggle */}
              <button
                onClick={() => setIsScheduled(!isScheduled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isScheduled ? 'bg-primary' : 'bg-muted-foreground/20'}`}
              >
                <motion.div
                  layout
                  className={`w-4 h-4 rounded-full bg-white shadow-sm ${isScheduled ? 'ml-5' : 'ml-0'}`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <AnimatePresence>
              {isScheduled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 border-t border-border mt-1"
                >
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Clock size={12} /> Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-body"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Missions will be visible to runners up to 12 hours before the scheduled time.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Budget */}
        <div>
          <div className="flex items-center justify-between mb-2 block">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <IndianRupee size={12} /> Budget Range
            </label>

            <AnimatePresence mode="wait">
              {isAiCalculating ? (
                <motion.div
                  key="calculating"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full"
                >
                  <Loader2 size={10} className="animate-spin" /> AI estimating...
                </motion.div>
              ) : aiSuggestion ? (
                <motion.button
                  key="suggestion"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={applyAiSuggestion}
                  className="flex items-center gap-1 text-[10px] text-primary-foreground font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-2 py-0.5 rounded-full shadow-sm ring-1 ring-purple-500/50 transition-all"
                >
                  <Sparkles size={10} className="animate-pulse" /> Use AI: ₹{aiSuggestion.min} - ₹{aiSuggestion.max}
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3 relative">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm">₹</span>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Min 200"
                className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body transition-colors"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm">₹</span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Max 500"
                className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 font-body transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Notify Favorites */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Heart size={16} className="text-red-500 fill-red-500" /> Notify Favorites First
            </label>
            <p className="text-[10px] text-muted-foreground mt-1">
              Give your saved runners a 5-minute head start.
            </p>
          </div>

          {/* iOS Style Toggle */}
          <button
            onClick={() => setNotifyFavorites(!notifyFavorites)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${notifyFavorites ? 'bg-red-500' : 'bg-muted-foreground/20'}`}
          >
            <motion.div
              layout
              className={`w-4 h-4 rounded-full bg-white shadow-sm ${notifyFavorites ? 'ml-5' : 'ml-0'}`}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Save as Template */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" /> Save as Template
            </label>
            <p className="text-[10px] text-muted-foreground mt-1">
              Quickly repost this exact mission later.
            </p>
          </div>

          <button
            onClick={() => setIsTemplate(!isTemplate)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${isTemplate ? 'bg-blue-500' : 'bg-muted-foreground/20'}`}
          >
            <motion.div
              layout
              className={`w-4 h-4 rounded-full bg-white shadow-sm ${isTemplate ? 'ml-5' : 'ml-0'}`}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Boost Mission */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500 fill-yellow-500" /> Boost Mission (+₹50)
            </label>
            <p className="text-[10px] text-muted-foreground mt-1">
              Highlight your mission and push-notify nearby runners instantly.
            </p>
          </div>

          <button
            onClick={() => setIsBoosted(!isBoosted)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${isBoosted ? 'bg-yellow-500' : 'bg-muted-foreground/20'}`}
          >
            <motion.div
              layout
              className={`w-4 h-4 rounded-full bg-white shadow-sm ${isBoosted ? 'ml-5' : 'ml-0'}`}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
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
