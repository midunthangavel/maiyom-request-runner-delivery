import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, Phone, CheckCircle2, Share2, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Chennai area coordinates for demo
const DELIVERY_POINT: [number, number] = [13.0827, 80.2707];
const RUNNER_START: [number, number] = [13.0674, 80.2376];

const ROUTE_POINTS: [number, number][] = [
  RUNNER_START,
  [13.069, 80.242],
  [13.0715, 80.248],
  [13.074, 80.253],
  [13.076, 80.258],
  [13.0785, 80.262],
  [13.08, 80.266],
  [13.0815, 80.269],
  DELIVERY_POINT,
];

const Tracking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentRole } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const runnerMarker = useRef<L.Marker | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const [routeIndex, setRouteIndex] = useState(0);
  const [eta, setEta] = useState(12);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [shared, setShared] = useState(false);

  const progress = Math.round((routeIndex / (ROUTE_POINTS.length - 1)) * 100);
  const arrived = routeIndex >= ROUTE_POINTS.length - 1;

  // Watch user's real GPS
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {
        // Fallback to a nearby location if geolocation denied
        setUserLocation([13.0827, 80.2707]);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([13.075, 80.255], 14);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Route polyline (dashed — remaining)
    L.polyline(ROUTE_POINTS, {
      color: "hsl(28, 95%, 52%)",
      weight: 4,
      opacity: 0.3,
      dashArray: "8, 8",
    }).addTo(map);

    // Walked route (solid)
    const walkedLine = L.polyline([], {
      color: "hsl(28, 95%, 52%)",
      weight: 4,
      opacity: 1,
    }).addTo(map);

    // Delivery marker
    const deliveryIcon = L.divIcon({
      html: `<div style="width:36px;height:36px;background:hsl(160,60%,42%);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">📍</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: "",
    });
    L.marker(DELIVERY_POINT, { icon: deliveryIcon })
      .addTo(map)
      .bindPopup("<b>Delivery Point</b><br/>Chennai Central, Platform 3");

    // Runner marker with pulse
    const runnerIcon = L.divIcon({
      html: `<div style="width:40px;height:40px;background:hsl(28,95%,52%);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:18px;position:relative;">
        <div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid hsl(28,95%,52%);opacity:0.4;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        🏃
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      className: "",
    });
    const marker = L.marker(RUNNER_START, { icon: runnerIcon }).addTo(map);
    runnerMarker.current = marker;

    // Fit bounds
    const bounds = L.latLngBounds([RUNNER_START, DELIVERY_POINT]);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapInstance.current = map;
    (map as any)._walkedLine = walkedLine;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Add / update user location marker
  useEffect(() => {
    if (!mapInstance.current || !userLocation) return;
    if (!userMarker.current) {
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:hsl(217,91%,60%);border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px hsla(217,91%,60%,0.25),0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: "",
      });
      userMarker.current = L.marker(userLocation, { icon: userIcon }).addTo(mapInstance.current);
      userMarker.current.bindPopup("<b>You</b>");
    } else {
      userMarker.current.setLatLng(userLocation);
    }
  }, [userLocation]);

  // Animate runner along route
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIndex((prev) => {
        const next = prev + 1;
        if (next >= ROUTE_POINTS.length) {
          clearInterval(interval);
          return prev;
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!runnerMarker.current || !mapInstance.current) return;
    const point = ROUTE_POINTS[routeIndex];
    runnerMarker.current.setLatLng(point);

    const walkedLine = (mapInstance.current as any)._walkedLine as L.Polyline;
    if (walkedLine) {
      walkedLine.setLatLngs(ROUTE_POINTS.slice(0, routeIndex + 1));
    }

    const remaining = ROUTE_POINTS.length - 1 - routeIndex;
    setEta(Math.max(1, Math.round(remaining * 1.5)));
  }, [routeIndex]);

  const handleShare = () => {
    const text = `Track my delivery live on Maiyom! ETA: ~${eta} min`;
    if (navigator.share) {
      navigator.share({ title: "Maiyom Live Tracking", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-[1000] bg-background/80 backdrop-blur-md border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="font-display font-semibold text-foreground flex-1">Live Tracking</h1>
          {!arrived && (
            <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
              ETA ~{eta} min
            </span>
          )}
        </div>
        {/* Route Progress Bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] font-semibold text-primary">{progress}%</span>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 min-h-[55vh] z-0" />

      {/* Status Banner */}
      <AnimatePresence mode="wait">
        {arrived ? (
          <motion.div
            key="arrived"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-3 bg-success/10 flex items-center gap-2 justify-center"
          >
            <CheckCircle2 size={18} className="text-success" />
            <span className="text-sm font-semibold text-success">Runner has arrived!</span>
          </motion.div>
        ) : (
          <motion.div
            key="onway"
            className="px-5 py-2 bg-secondary flex items-center justify-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <span className="text-xs font-medium text-secondary-foreground">Runner is on the way</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Runner Info + Actions */}
      <div className="px-5 py-4 bg-card border-t border-border safe-bottom">
        <div className="flex items-center gap-3 mb-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=arjun"
            alt="Runner"
            className="w-12 h-12 rounded-full bg-muted"
          />
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">Arjun Mehta</p>
            <p className="text-xs text-muted-foreground">⭐ 4.8 • 142 missions</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-secondary rounded-full">
              <Phone size={16} className="text-secondary-foreground" />
            </button>
            <button onClick={() => navigate("/chat/conv1")} className="p-2.5 bg-secondary rounded-full">
              <MessageSquare size={16} className="text-secondary-foreground" />
            </button>
            <button onClick={handleShare} className="p-2.5 bg-secondary rounded-full relative">
              <Share2 size={16} className="text-secondary-foreground" />
              <AnimatePresence>
                {shared && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: -8 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary bg-card border border-border rounded px-2 py-0.5 whitespace-nowrap shadow"
                  >
                    Copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {arrived && (
          <button
            onClick={() => navigate(`/confirm-delivery/${id}`)}
            className="w-full py-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow"
          >
            Confirm Delivery
          </button>
        )}
      </div>
    </div>
  );
};

export default Tracking;
