import { useEffect, useRef } from "react";
import PageShell from "@/components/PageShell";
import { ArrowLeft, Flame, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageTransition from "@/components/PageTransition";

const RunnerMap = () => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Center map around Chennai initially
        const map = L.map(mapRef.current, { zoomControl: false }).setView([13.0827, 80.2707], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);

        // Mock high-demand zones (Heatmap points)
        const hotspots = [
            { coords: [13.0827, 80.2707] as [number, number], intensity: "High", radius: 1500, color: "#ef4444" }, // Red
            { coords: [13.0418, 80.2341] as [number, number], intensity: "Medium", radius: 1200, color: "#f97316" }, // Orange
            { coords: [12.9815, 80.2180] as [number, number], intensity: "Medium", radius: 2000, color: "#f97316" },
            { coords: [13.0850, 80.2100] as [number, number], intensity: "High", radius: 1000, color: "#ef4444" },
        ];

        hotspots.forEach(spot => {
            L.circle(spot.coords, {
                color: spot.color,
                fillColor: spot.color,
                fillOpacity: 0.4,
                radius: spot.radius,
                weight: 0
            }).addTo(map);
        });

        return () => {
            map.remove();
        };
    }, []);

    return (
        <PageTransition>
            <PageShell>
                <div className="h-screen flex flex-col relative">
                    {/* Floating Header */}
                    <div className="absolute top-0 left-0 right-0 z-[1000] p-5 pt-8 pointer-events-none">
                        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3 pointer-events-auto shadow-elevated border border-white/20">
                            <button onClick={() => navigate(-1)} className="p-1">
                                <ArrowLeft size={20} className="text-foreground" />
                            </button>
                            <div>
                                <h1 className="text-lg font-display font-bold text-foreground">Live Hotspots</h1>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Updating live
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Full Screen Map */}
                    <div ref={mapRef} className="flex-1 z-0" />

                    {/* Bottom Card */}
                    <div className="absolute bottom-20 left-5 right-5 z-[1000] pointer-events-none">
                        <div className="bg-card rounded-2xl p-5 shadow-elevated border border-border pointer-events-auto neumorphic-card">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Flame size={16} className="text-destructive" /> High Demand Areas
                            </h3>
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-destructive/60" /> Very High (+₹50 Surg)</span>
                                <span className="font-medium">Anna Nagar</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500/60" /> High (+₹20 Surg)</span>
                                <span className="font-medium">T Nagar</span>
                            </div>

                            <button className="w-full mt-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2">
                                <TrendingUp size={16} /> Navigate to Hotspot
                            </button>
                        </div>
                    </div>

                </div>
            </PageShell>
        </PageTransition>
    );
};

export default RunnerMap;
