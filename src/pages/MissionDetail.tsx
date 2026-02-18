import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, MapPin, Clock, IndianRupee, Star, Shield, MessageSquare, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { scenarioIcons } from "@/lib/constants";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MissionTimeline from "@/components/MissionTimeline";
import { useToast } from "@/hooks/use-toast";
import { useMission, useOffers } from "@/hooks/useSupabase";
import { formatDistanceToNow } from "date-fns";

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
  // const { missions, offers, runners, currentRole, setOffers, setMissions } = useApp(); // Removed mock usage
  const { currentRole, userProfile } = useApp();
  const { toast } = useToast();

  const { data: mission, isLoading: loadingMission } = useMission(id || "");
  const { data: missionOffers = [], isLoading: loadingOffers } = useOffers(id || "");
  // Note: runners data would need to be fetched ideally, or we join in the offers query. 
  // For now assuming offers might contain runner info or we fetch separately. 
  // But standard pattern in Supabase join would be best. 
  // Let's assume useOffers returns offers with runner details joined or we ignore runner details for now 
  // until we update the hook to join profiles.

  // Actually, let's just checking if useOffers returns runner info. 
  // The current useOffers hook probably just returns from 'offers' table.
  // We might need to update useOffers to join 'profiles'.

  const isRequester = currentRole === "requester" && mission?.requester_id === userProfile?.id;

  if (loadingMission) return <div className="p-5 text-center">Loading mission...</div>;

  if (!mission) return <div className="p-5 text-muted-foreground">Mission not found</div>;

  const handleAcceptOffer = (offerId: string) => {
    // Implement Supabase mutation for accepting offer
    // For now just console log
    console.log("Accepting offer", offerId);
    toast({ title: "Construction", description: "Accept logic needs mutation hook" });
  };

  const handleRejectOffer = (offerId: string) => {
    // Implement Supabase mutation
    console.log("Rejecting offer", offerId);
  };


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
              <span>{mission.delivery_location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={14} className="text-primary" />
              <span>{mission.arrival_time}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <IndianRupee size={14} className="text-primary" />
              <span>₹{mission.budget_min}–{mission.budget_max}</span>
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
        <MiniMap location={mission.delivery_location} city={mission.to_location} />

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
                const runner = offer.runner;
                if (!runner) return null;
                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg border border-border p-4 shadow-card"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={offer.runner?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (offer.runner?.name || "Runner")} alt={offer.runner?.name || "Runner"} className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="font-semibold text-foreground text-sm">{offer.runner?.name || "Runner"}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star size={10} className="text-warning fill-warning" /> {offer.runner?.rating || 5.0}
                          </span>
                          <span>•</span>
                          <span>{offer.runner?.completed_missions || 0} missions</span>
                          <span className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded">
                            L{offer.runner?.verification_level || 1}
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
                          onClick={() => navigate(`/chat/${mission.id}`)}
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
