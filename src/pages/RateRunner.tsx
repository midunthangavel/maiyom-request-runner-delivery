import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, Loader2, IndianRupee, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateReview, useMission, useOffers, useUpdateProfile } from "@/hooks/useSupabase";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const tags = ["Fast delivery", "Friendly", "Good communication", "Careful handling", "On time", "Went extra mile"];
const TIP_OPTIONS = [10, 20, 50];

const RateRunner = () => {
  const navigate = useNavigate();
  const { id: missionId } = useParams();
  const { userProfile } = useApp();
  const { toast } = useToast();
  const createReview = useCreateReview();

  const { data: mission } = useMission(missionId || "");
  const { data: missionOffers = [] } = useOffers(missionId || "");

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const updateProfile = useUpdateProfile();

  // Find the accepted runner for this mission
  const acceptedOffer = missionOffers.find((o) => o.status === "accepted");
  const runner = acceptedOffer?.runner;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    if (!userProfile?.id || !missionId) return;

    const runnerId = acceptedOffer?.runner_id;
    if (!runnerId) {
      toast({ variant: "destructive", title: "Error", description: "Could not identify the runner for this mission." });
      return;
    }

    const finalTip = tipAmount === -1 ? Number(customTip) : (tipAmount || 0);

    if (finalTip > 0 && (userProfile.wallet_balance || 0) < finalTip) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: "Your wallet balance is too low for this tip." });
      return;
    }

    try {
      // 1. Create Review
      await createReview.mutateAsync({
        runner_id: runnerId,
        requester_id: userProfile.id,
        mission_id: missionId,
        rating,
        tags: selectedTags,
        comment,
      });

      // 2. Handle Tip Transfer
      if (finalTip > 0) {
        // Deduct from Requester
        await updateProfile.mutateAsync({
          id: userProfile.id,
          updates: { wallet_balance: (userProfile.wallet_balance || 0) - finalTip }
        });

        // Add to Runner (Mocking a simple wallet addition here, usually via a function/RPC)
        const currentRunnerBalance = runner?.wallet_balance || 0;
        await updateProfile.mutateAsync({
          id: runnerId,
          updates: { wallet_balance: currentRunnerBalance + finalTip }
        });
      }

      toast({
        title: "Review Submitted 🎉",
        description: finalTip ? `Thank you for rating and the ₹${finalTip} tip!` : "Thank you for rating the runner!",
      });

      if (isFavorite) {
        toast({ title: "Runner Favorited ❤️", description: "They will be notified first for your next missions!" });
      }

      navigate("/missions");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to submit review." });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen max-w-lg mx-auto bg-background flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
        >
          <span className="text-5xl">🎉</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-display font-bold text-foreground mb-2"
        >
          Thanks for your review!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground mb-8 text-center"
        >
          Your feedback helps runners improve and builds trust in the community.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate("/home")}
          className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow"
        >
          Back to Home
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display font-semibold text-foreground">Rate Your Runner</h1>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Runner */}
        <div className="text-center">
          <img
            src={runner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${runner?.name || "runner"}`}
            alt="Runner"
            className="w-16 h-16 rounded-full bg-muted mx-auto mb-3"
          />
          <h2 className="text-xl font-display font-bold text-foreground mb-1">
            {runner?.name || "Runner"}
          </h2>
          <p className="text-sm text-muted-foreground mb-2">How was your delivery?</p>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${isFavorite ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-card text-muted-foreground border border-border hover:bg-muted"}`}
          >
            <Heart size={14} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
            {isFavorite ? "Saved to Favorites" : "Add to Favorites"}
          </button>
        </div>

        {/* Stars */}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground mb-3">How was your experience?</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileTap={{ scale: 1.3 }}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  size={32}
                  className={`transition-colors ${star <= (hoveredStar || rating)
                    ? "text-warning fill-warning"
                    : "text-muted-foreground/30"
                    }`}
                />
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {rating === 0 && "Tap a star to rate"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Great"}
            {rating === 5 && "Excellent! 🌟"}
          </p>
        </div>

        {/* Tags */}
        {rating > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-medium text-foreground mb-2">What stood out?</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTags.includes(tag)
                    ? "bg-primary/10 border-primary text-primary font-medium"
                    : "border-border text-muted-foreground bg-card"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comment */}
        {rating > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-sm font-medium text-foreground mb-2">Anything else? (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience..."
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary resize-none placeholder:text-muted-foreground/50 font-body"
            />
          </motion.div>
        )}

        {/* Tipping Section */}
        {rating > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5"><IndianRupee size={16} /> Add a Tip (Optional)</p>
              <p className="text-xs text-muted-foreground font-medium">Wallet: ₹{userProfile?.wallet_balance || 0}</p>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {TIP_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setTipAmount(amount); setCustomTip(""); }}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all ${tipAmount === amount
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-card border-border text-foreground hover:bg-muted"
                    }`}
                >
                  ₹{amount}
                </button>
              ))}
              <button
                onClick={() => setTipAmount(-1)}
                className={`py-2 rounded-lg text-sm font-semibold border transition-all ${tipAmount === -1
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
              >
                Other
              </button>
            </div>

            <AnimatePresence>
              {tipAmount === -1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || createReview.isPending}
          className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow disabled:opacity-40"
        >
          {createReview.isPending ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

export default RateRunner;
