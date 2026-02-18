import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Camera, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SubmitOffer = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const { setOffers, missions } = useApp();
  const { toast } = useToast();
  const mission = missions.find((m) => m.id === missionId);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!price) return;
    setOffers((prev) => [
      ...prev,
      {
        id: `o${Date.now()}`,
        missionId: missionId!,
        runnerId: "r1",
        price: Number(price),
        note,
        status: "pending",
        createdAt: "Just now",
      },
    ]);
    toast({ title: "📤 Offer submitted!", description: "The requester will review shortly" });
    navigate(-1);
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display font-semibold text-foreground">Submit Offer</h1>
      </div>

      <div className="px-5 py-5 space-y-5">
        {mission && (
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">For mission</p>
            <p className="text-sm font-semibold text-foreground">{mission.title}</p>
            <p className="text-xs text-muted-foreground">Budget: ₹{mission.budgetMin}–{mission.budgetMax}</p>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <IndianRupee size={12} /> Your Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter your price"
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-body"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground w-full justify-center bg-card">
          <Camera size={16} /> Upload Item Photo
        </button>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note to Requester</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="E.g., Found the item at nearby store..."
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary resize-none font-body"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!price}
          className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow disabled:opacity-40"
        >
          Submit Offer
        </button>
      </div>
    </div>
  );
};

export default SubmitOffer;
