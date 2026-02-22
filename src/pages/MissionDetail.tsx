import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, MapPin, Clock, IndianRupee, Star, Shield, MessageSquare, Navigation, Package, Truck, Receipt, PlusCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { scenarioIcons } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MissionTimeline from "@/components/MissionTimeline";
import { useToast } from "@/hooks/use-toast";
import { useMission, useOffers, useAcceptOffer, useRejectOffer, useCounterOffer, useAcceptCounterOffer, useUpdateMission } from "@/hooks/useSupabase";
import { formatDistanceToNow } from "date-fns";
import { Trophy } from "lucide-react";
import PageTransition from "@/components/PageTransition";

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

  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();
  const counterOffer = useCounterOffer();
  const acceptCounterOffer = useAcceptCounterOffer();
  const updateMission = useUpdateMission();

  const isRequester = currentRole === "requester" && mission?.requester_id === userProfile?.id;

  if (loadingMission) return <div className="p-5 text-center">Loading mission...</div>;

  if (!mission) return <div className="p-5 text-muted-foreground">Mission not found</div>;

  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState("");

  // Additional Costs State
  const [showAddCost, setShowAddCost] = useState(false);
  const [costAmount, setCostAmount] = useState("");
  const [costDesc, setCostDesc] = useState("");

  const handleAddCost = async () => {
    if (!costAmount || !costDesc || isNaN(Number(costAmount))) return;
    try {
      const currentCosts = mission.additional_costs || [];
      const newCost = { amount: Number(costAmount), description: costDesc };
      await updateMission.mutateAsync({
        id: mission.id,
        updates: { additional_costs: [...currentCosts, newCost] }
      });
      setShowAddCost(false);
      setCostAmount("");
      setCostDesc("");
      toast({ title: "Receipt Added 🧾", description: "Cost added to the final bill." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add cost." });
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptOffer.mutateAsync({ offerId, missionId: mission.id });
      toast({ title: "✅ Offer Accepted", description: "The runner has been notified." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to accept offer." });
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await rejectOffer.mutateAsync({ offerId, missionId: mission.id });
      toast({ title: "Offer Rejected", description: "The runner has been notified." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to reject offer." });
    }
  };

  const handleSendCounter = async (offerId: string) => {
    if (!counterPrice || isNaN(Number(counterPrice))) return;
    try {
      await counterOffer.mutateAsync({ offerId, missionId: mission.id, counterPrice: Number(counterPrice) });
      setCounteringOfferId(null);
      setCounterPrice("");
      toast({ title: "Counter-offer Sent 🤝", description: `You countered at ₹${counterPrice}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send counter-offer." });
    }
  };

  const handleAcceptCounter = async (offerId: string, acceptedPrice: number) => {
    try {
      await acceptCounterOffer.mutateAsync({ offerId, missionId: mission.id, acceptedPrice });
      toast({ title: "Deal Agreed! 🎉", description: `You accepted ₹${acceptedPrice}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to accept counter-offer." });
    }
  };

  const handleDispute = async () => {
    try {
      await updateMission.mutateAsync({ id: mission.id, updates: { status: "disputed" } });
      toast({ title: "Mission Frozen 🛑", description: "Navigating to Live Support Chat..." });
      navigate(`/chat/support_${mission.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to report issue." });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen max-w-lg mx-auto bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 glass-panel border-b border-border px-5 py-3 flex items-center gap-3">
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
              {mission.vehicle_requirement && mission.vehicle_requirement !== "Any" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 flex items-center gap-1 shrink-0">
                  <Truck size={10} /> {mission.vehicle_requirement}
                </span>
              )}
              {mission.package_size && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 flex items-center gap-1 shrink-0">
                  <Package size={10} /> {mission.package_size} Pkg
                </span>
              )}
            </div>
            <h2 className="text-lg font-display font-bold text-foreground mb-1">{mission.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{mission.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="truncate">{mission.delivery_location}</span>
                  {mission.dropoff_locations && mission.dropoff_locations.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {mission.dropoff_locations.map((loc, idx) => (
                        <span key={idx} className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 truncate">
                          <div className="w-1.5 h-1.5 rounded-full bg-border shrink-0" /> {loc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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

            {/* Additional Costs Display */}
            {mission.additional_costs && mission.additional_costs.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Receipt size={12} /> Additional Costs (Pending Approval)
                </h4>
                {mission.additional_costs.map((cost, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1.5 border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-muted-foreground text-xs">{cost.description}</span>
                    <span className="font-semibold text-foreground text-xs">₹{cost.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t border-border mt-1 pt-2">
                  <span>Total Extra</span>
                  <span className="text-primary">₹{mission.additional_costs.reduce((sum, c) => sum + c.amount, 0)}</span>
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
              {mission.status === "accepted" || mission.status === "in_transit" ? (
                <div className="flex items-center gap-1.5 bg-success/10 text-success rounded-lg px-2.5 py-1.5 text-[10px] font-medium">
                  <Shield size={12} /> Payment in Escrow
                </div>
              ) : mission.status === "disputed" ? (
                <div className="flex items-center gap-1.5 bg-destructive/10 text-destructive rounded-lg px-2.5 py-1.5 text-[10px] font-medium border border-destructive/20 animate-pulse">
                  <Shield size={12} /> Safety Hold (Disputed)
                </div>
              ) : <div />}

              {["accepted", "in_transit"].includes(mission.status) && (
                <button onClick={handleDispute} className="text-[10px] text-destructive hover:underline font-semibold bg-destructive/5 px-2 py-1 rounded">
                  Report Issue
                </button>
              )}
            </div>
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

                  const tierColors: Record<string, string> = {
                    "Bronze": "text-orange-700 bg-orange-700/10 border-orange-700/20",
                    "Silver": "text-slate-400 bg-slate-400/10 border-slate-400/20",
                    "Gold": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
                    "Platinum": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
                  };

                  const activeTierColor = runner.tier ? tierColors[runner.tier] : tierColors["Bronze"];

                  return (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-lg border border-border p-4 shadow-card"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <img src={runner.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (runner.name || "Runner")} alt={runner.name || "Runner"} className="w-10 h-10 rounded-full bg-muted mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-foreground text-sm">{runner.name || "Runner"}</div>
                            <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${activeTierColor}`}>
                              <Trophy size={10} /> {runner.tier || "Bronze"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Star size={10} className="text-warning fill-warning" /> {runner.rating || 5.0}
                            </span>
                            <span>•</span>
                            <span>{runner.completed_missions || 0} missions</span>
                            <span className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded">
                              L{runner.verification_level || 1}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">₹{offer.price}</div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">{offer.note}</p>

                      {offer.status === "countered" && (
                        <div className="bg-primary/10 border border-primary text-primary p-3 rounded-lg mb-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold">You offered: ₹{offer.counter_price}</p>
                            <p className="text-[10px]">Waiting for runner's response</p>
                          </div>
                          <Clock size={16} className="text-primary animate-pulse" />
                        </div>
                      )}

                      {offer.status === "pending" && (
                        <>
                          {counteringOfferId === offer.id ? (
                            <div className="bg-muted p-3 rounded-lg flex items-center gap-2 mb-2">
                              <div className="relative flex-1">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                <input
                                  type="number"
                                  value={counterPrice}
                                  onChange={(e) => setCounterPrice(e.target.value)}
                                  placeholder="Counter offer"
                                  className="w-full pl-7 pr-3 py-2 rounded-md border border-border text-sm outline-none focus:border-primary"
                                />
                              </div>
                              <button onClick={() => handleSendCounter(offer.id)} className="px-3 py-2 bg-gradient-primary text-primary-foreground text-xs font-semibold rounded-md whitespace-nowrap">
                                Send
                              </button>
                              <button onClick={() => setCounteringOfferId(null)} className="px-3 py-2 text-xs font-medium text-muted-foreground">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptOffer(offer.id)}
                                className="flex-1 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-semibold glow-on-hover hover-lift shadow-glow"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => setCounteringOfferId(offer.id)}
                                className="flex-1 py-2 rounded-lg border border-primary text-primary text-xs font-semibold bg-primary/5"
                              >
                                Counter
                              </button>
                              <button
                                onClick={() => handleRejectOffer(offer.id)}
                                className="px-4 py-2 rounded-lg border border-border text-muted-foreground text-xs font-medium bg-card"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </>
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

          {/* Runner: Actions */}
          {!isRequester && (
            <div className="space-y-3">
              {/* Find my offer */}
              {(() => {
                const myOffer = missionOffers.find(o => o.runner_id === userProfile?.id);

                if (myOffer?.status === "countered") {
                  return (
                    <div className="bg-warning/10 border border-warning/30 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 text-warning mb-2">
                        <MessageSquare size={16} />
                        <span className="font-semibold text-sm">Requester counter-offered:</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-bold line-through text-muted-foreground">₹{myOffer.price}</div>
                        <div className="text-2xl font-bold text-foreground">₹{myOffer.counter_price}</div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">Will you accept this new price to secure the mission?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptCounter(myOffer.id, myOffer.counter_price!)}
                          className="flex-1 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow glow-on-hover hover-lift"
                        >
                          Accept ₹{myOffer.counter_price}
                        </button>
                        <button
                          onClick={() => handleRejectOffer(myOffer.id)}
                          className="flex-1 py-2.5 rounded-lg border border-border bg-card text-foreground font-semibold text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                }

                if (myOffer?.status === "pending") {
                  return (
                    <div className="bg-secondary/20 border border-secondary text-secondary-foreground p-3 rounded-lg text-center text-sm font-medium">
                      Offer Submitted (₹{myOffer.price}). Waiting for Requester.
                    </div>
                  )
                }

                if (myOffer?.status === "accepted") {
                  return (
                    <div className="flex flex-col gap-3">
                      {mission.status === "in_transit" && (
                        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                          {!showAddCost ? (
                            <button
                              onClick={() => setShowAddCost(true)}
                              className="w-full py-2.5 rounded-lg border border-dashed border-primary text-primary text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                            >
                              <PlusCircle size={16} /> Add Receipt / Extra Cost
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <Receipt size={14} className="text-primary" /> Add Cost
                                </h4>
                                <button onClick={() => setShowAddCost(false)}><X size={14} className="text-muted-foreground" /></button>
                              </div>
                              <input
                                value={costDesc} onChange={(e) => setCostDesc(e.target.value)}
                                placeholder="Description (e.g. Pharmacy Bill)"
                                className="w-full text-sm px-3 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary"
                              />
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                <input
                                  type="number" value={costAmount} onChange={(e) => setCostAmount(e.target.value)}
                                  placeholder="Amount"
                                  className="w-full text-sm pl-8 pr-3 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary"
                                />
                              </div>
                              <button
                                onClick={handleAddCost} disabled={!costDesc || !costAmount}
                                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                              >
                                Submit Cost
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate("/tracking/" + mission.id)}
                          className="flex-1 py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center justify-center gap-2 glow-on-hover hover-lift clay-btn"
                        >
                          <Navigation size={16} /> Start / Track
                        </button>
                        <button
                          onClick={() => navigate(`/chat/${mission.id}`)}
                          className="flex-1 py-3.5 rounded-lg border border-border bg-card text-foreground font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={16} /> Chat
                        </button>
                      </div>
                    </div>
                  )
                }

                // No offer from me
                if (mission.status === "open") {
                  return (
                    <button
                      onClick={() => navigate(`/submit-offer/${mission.id}`)}
                      className="w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow glow-on-hover hover-lift clay-btn"
                    >
                      Submit Offer
                    </button>
                  )
                }

                return null;
              })()}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
export default MissionDetail;
