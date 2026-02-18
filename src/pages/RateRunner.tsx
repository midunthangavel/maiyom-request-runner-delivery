import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { motion } from "framer-motion";
import { saveReview } from "@/lib/reviewStore";

const tags = ["Fast delivery", "Friendly", "Good communication", "Careful handling", "On time", "Went extra mile"];

const RateRunner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    saveReview({
      runnerId: "r1",
      missionId: id || "unknown",
      rating,
      tags: selectedTags,
      comment,
      reviewerName: "You",
    });
    setSubmitted(true);
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
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=arjun"
            alt="Runner"
            className="w-16 h-16 rounded-full bg-muted mx-auto mb-3"
          />
          <p className="font-semibold text-foreground">Arjun Mehta</p>
          <p className="text-xs text-muted-foreground">Mission completed</p>
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

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow disabled:opacity-40"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default RateRunner;
