import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Navigation, IndianRupee, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { scenarioIcons } from "@/lib/constants";
import type { Mission } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMissions } from "@/hooks/useSupabase";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
    open: "bg-success/10 text-success border-success/20",
    offered: "bg-warning/10 text-warning border-warning/20",
    accepted: "bg-primary/10 text-primary border-primary/20",
    in_transit: "bg-accent/10 text-accent border-accent/20",
};

const MissionMap = () => {
    const navigate = useNavigate();
    const { data: missions = [] } = useMissions();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    // Filter missions with coordinates
    const mappableMissions = missions.filter(
        (m) => m.lat && m.lng && m.status !== "delivered"
    );

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Center on Chennai by default
        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
        }).setView([13.0827, 80.2707], 12);

        // Dark-friendly tile layer
        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            { maxZoom: 19 }
        ).addTo(map);

        // Add zoom control to bottom-right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Add mission markers
        mappableMissions.forEach((mission) => {
            if (!mission.lat || !mission.lng) return;

            const emoji = scenarioIcons[mission.scenario] || "📍";
            const isUrgent = mission.scenario === "urgent";

            const icon = L.divIcon({
                html: `<div style="
          width: 40px; height: 40px;
          background: ${isUrgent ? "hsl(0, 84%, 60%)" : "hsl(28, 95%, 52%)"};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-size: 18px;
          cursor: pointer;
          transition: transform 0.2s;
        ">${emoji}</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                className: "",
            });

            const marker = L.marker([mission.lat, mission.lng], { icon }).addTo(map);

            marker.on("click", () => {
                setSelectedMission(mission);
                map.flyTo([mission.lat!, mission.lng!], 15, { duration: 0.5 });
            });
        });

        // Click on map (not marker) to deselect
        map.on("click", () => setSelectedMission(null));

        mapInstance.current = map;

        // Fit bounds if we have markers
        if (mappableMissions.length > 0) {
            const bounds = L.latLngBounds(
                mappableMissions
                    .filter((m) => m.lat && m.lng)
                    .map((m) => [m.lat!, m.lng!] as [number, number])
            );
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    const handleRecenter = () => {
        if (mapInstance.current && mappableMissions.length > 0) {
            const bounds = L.latLngBounds(
                mappableMissions
                    .filter((m) => m.lat && m.lng)
                    .map((m) => [m.lat!, m.lng!] as [number, number])
            );
            mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            setSelectedMission(null);
        }
    };

    return (
        <div className="h-screen max-w-lg mx-auto bg-background relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[1000] bg-background/80 backdrop-blur-md border-b border-border px-5 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ArrowLeft size={20} className="text-foreground" />
                    </button>
                    <h1 className="font-display font-semibold text-foreground flex-1">Nearby Missions</h1>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">{mappableMissions.length} active</span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div ref={mapRef} className="h-full w-full" />

            {/* Recenter Button */}
            <button
                onClick={handleRecenter}
                className="absolute bottom-28 right-4 z-[1000] p-3 bg-card border border-border rounded-full shadow-elevated"
            >
                <Navigation size={20} className="text-primary" />
            </button>

            {/* Legend */}
            <div className="absolute top-16 right-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-card">
                <div className="space-y-1.5">
                    {(["traveling", "event", "urgent"] as const).map((s) => (
                        <div key={s} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="text-sm">{scenarioIcons[s]}</span>
                            <span className="capitalize">{s}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Mission Card */}
            <AnimatePresence>
                {selectedMission && (
                    <motion.div
                        key={selectedMission.id}
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute bottom-6 left-4 right-4 z-[1000]"
                    >
                        <div
                            onClick={() => navigate(`/mission/${selectedMission.id}`)}
                            className="bg-card border border-border rounded-xl p-4 shadow-elevated cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{scenarioIcons[selectedMission.scenario]}</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[selectedMission.status] || ""}`}>
                                        {selectedMission.status === "open" ? "Open" : selectedMission.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </span>
                                    {selectedMission.scenario === "urgent" && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                                            Urgent
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(selectedMission.created_at), { addSuffix: true })}</span>
                            </div>

                            <h3 className="font-display font-semibold text-foreground mb-1">{selectedMission.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{selectedMission.description}</p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} className="text-primary" />
                                        {selectedMission.delivery_location.split(",")[0]}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {selectedMission.arrival_time}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                                    <IndianRupee size={14} className="text-primary" />
                                    ₹{selectedMission.budget_min}–{selectedMission.budget_max}
                                </div>
                            </div>

                            {selectedMission.distance && (
                                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                                    <span className="text-xs text-primary font-medium">{selectedMission.distance} away</span>
                                    <span className="text-xs font-medium text-primary">View Details →</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MissionMap;
