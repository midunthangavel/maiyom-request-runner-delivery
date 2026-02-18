import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, MapPin, Clock, IndianRupee, Star, Shield, MessageSquare, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { scenarioIcons } from "@/lib/mockData";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MissionTimeline from "@/components/MissionTimeline";
import { useToast } from "@/hooks/use-toast";

// City coordinates for mini map
const CITY_COORDS: Record<string, [number, number]> = {
  "Chennai Central": [13.0827, 80.2707],
  "Bengaluru Airport": [13.1986, 77.7066],
  "Chennai": [13.0827, 80.2707],
  "Mumbai": [19.0760, 72.8777],
};

const MiniMap = ({ location, city }: { location: string; city: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const coords = CITY_COORDS[city] || [13.0827, 80.2707];
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView(coords, 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
    const icon = L.divIcon({
      html: '<div style="width:28px;height:28px;background:hsl(28,95%,52%);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;">📍</div>',
      iconSize: [28, 28], iconAnchor: [14, 14], className: "",
    });
    L.marker(coords, { icon }).addTo(map);
    return () => { map.remove(); };
  }, [city]);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-card">
      <div ref={ref} className="h-40" />
      <div className="px-3 py-2 bg-card border-t border-border">
        <p className="text-xs text-muted-foreground truncate">📍 {location}</p>
      </div>
    </div>
  );
};

const MissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { missions, offers, runners, currentRole, setOffers, setMissions } = useApp();
  const { toast } = useToast();
  const mission = missions.find((m) => m.id === id);
  const missionOffers = offers.filter((o) => o.missionId === id);

  if (!mission) return <div className="p-5 text-muted-foreground">Mission not found</div>;

  const handleAcceptOffer = (offerId: string) => {
    setOffers((prev) => prev.map((o) => ({
      ...o,
      status: o.id === offerId ? "accepted" : o.missionId === id ? "rejected" : o.status,
    })));
    setMissions((prev) => prev.map((m) => m.id === id ? { ...m, status: "accepted" } : m));
    toast({ title: "✅ Offer accepted!", description: "The runner has been notified" });
  };

  const handleRejectOffer = (offerId: string) => {
    setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: "rejected" } : o));
    toast({ title: "Offer rejected", description: "The runner will be notified" });
  };

  const isRequester = currentRole === "requester";

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display font-semibold text-foreground">Mission Details</h1>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Mission Info */}
        <div className="bg-card rounded-lg border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{scenarioIcons[mission.scenario]}</span>
            <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {mission.category}
            </span>
            {mission.scenario === "urgent" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Urgent</span>
            )}
          </div>
          <h2 className="text-lg font-display font-bold text-foreground mb-1">{mission.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">{mission.description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={14} className="text-primary" />
              <span>{mission.deliveryLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={14} className="text-primary" />
              <span>{mission.arrivalTime}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <IndianRupee size={14} className="text-primary" />
              <span>₹{mission.budgetMin}–{mission.budgetMax}</span>
            </div>
          </div>

          {/* Escrow Badge */}
          {mission.status === "accepted" && (
            <div className="mt-3 flex items-center gap-2 bg-success/10 text-success rounded-lg px-3 py-2 text-xs font-medium">
              <Shield size={14} /> Payment Secured in Escrow
            </div>
          )}
        </div>

        {/* Mini Leaflet Map */}
        <MiniMap location={mission.deliveryLocation} city={mission.to} />

        {/* Status Timeline */}
        <MissionTimeline missionStatus={mission.status} />

        {/* Offers (Requester View) */}
        {isRequester && missionOffers.length > 0 && (
          <div>
            <h3 className="font-display font-semibold text-foreground mb-3">
              Runner Offers ({missionOffers.length})
            </h3>
            <div className="space-y-3">
              {missionOffers.map((offer) => {
                const runner = runners.find((r) => r.id === offer.runnerId);
                if (!runner) return null;
                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg border border-border p-4 shadow-card"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={runner.avatar} alt={runner.name} className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="font-semibold text-foreground text-sm">{runner.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star size={10} className="text-warning fill-warning" /> {runner.rating}
                          </span>
                          <span>•</span>
                          <span>{runner.completedMissions} missions</span>
                          <span className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded">
                            L{runner.verificationLevel}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">₹{offer.price}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{offer.note}</p>
                    {offer.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="flex-1 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-semibold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          className="flex-1 py-2 rounded-lg border border-border text-muted-foreground text-xs font-medium bg-card"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {offer.status === "accepted" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate("/tracking/" + mission.id)}
                          className="flex-1 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Navigation size={12} /> Track
                        </button>
                        <button
                          onClick={() => navigate(`/chat/conv1`)}
                          className="flex-1 py-2 rounded-lg border border-border text-foreground text-xs font-medium bg-card flex items-center justify-center gap-1"
                        >
                          <MessageSquare size={12} /> Chat
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Runner: Submit Offer */}
        {!isRequester && mission.status === "open" && (
          <button
            onClick={() => navigate(`/submit-offer/${mission.id}`)}
            className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow"
          >
            Submit Offer
          </button>
        )}
      </div>
    </div>
  );
};

export default MissionDetail;
