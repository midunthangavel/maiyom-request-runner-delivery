import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, Phone, CheckCircle2, Share2, Navigation, ShieldAlert, AlertTriangle, Camera, Loader2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useMission, useUpdateMission } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
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
  const { currentRole, userProfile } = useApp();
  const { data: mission, isLoading: loadingMission } = useMission(id || "");
  const updateMission = useUpdateMission();
  const { toast } = useToast();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const runnerMarker = useRef<L.Marker | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const [routeIndex, setRouteIndex] = useState(0);
  const [eta, setEta] = useState(12);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [shared, setShared] = useState(false);

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState(["", "", "", ""]);
  const otpType = mission?.status === "accepted" ? "pickup" : "delivery";

  // SOS State
  const [showSosModal, setShowSosModal] = useState(false);

  // Photo State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const progress = Math.round((routeIndex / (ROUTE_POINTS.length - 1)) * 100);
  const arrived = routeIndex >= ROUTE_POINTS.length - 1;
  const isRunner = currentRole === "runner";
  const isRequester = currentRole === "requester";

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

  const handleOtpVerify = async () => {
    const enteredOtp = otpInput.join("");
    if (!mission) return;

    if (otpType === "pickup" && enteredOtp === mission.pickup_otp) {
      // Transition to In Transit with Photo Proof
      await updateMission.mutateAsync({
        id: mission.id,
        updates: { status: "in_transit", pickup_photo_url: photoUrl || undefined }
      });
      setShowOtpModal(false);
      setOtpInput(["", "", "", ""]);
      setPhotoUrl(null);
      toast({ title: "Pickup Confirmed ✅", description: "You are now in transit!" });
    } else if (otpType === "delivery" && enteredOtp === mission.delivery_otp) {
      // Transition to Delivered with Photo Proof
      await updateMission.mutateAsync({
        id: mission.id,
        updates: { status: "delivered", delivery_photo_url: photoUrl || undefined }
      });
      setShowOtpModal(false);
      setPhotoUrl(null);
      toast({ title: "Delivery Complete 🎉", description: "Mission accomplished!" });
      setTimeout(() => navigate(`/confirm-delivery/${id}`), 1500);
    } else {
      toast({ variant: "destructive", title: "Invalid OTP", description: "Please check the code and try again." });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1); // Only allow 1 char
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleTakePhoto = () => {
    setIsUploading(true);
    // Simulate camera/upload delay
    setTimeout(() => {
      setPhotoUrl("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop");
      setIsUploading(false);
    }, 1500);
  };

  const handlePhotoContinue = () => {
    setShowPhotoModal(false);
    setShowOtpModal(true);
  };

  if (loadingMission) return <div className="p-5">Loading...</div>;

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-[1000] bg-background/80 backdrop-blur-md border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="font-display font-semibold text-foreground flex-1">Live Tracking</h1>

          <button onClick={() => setShowSosModal(true)} className="p-1.5 bg-destructive/10 text-destructive rounded-full hover:bg-destructive/20 transition-colors">
            <ShieldAlert size={18} />
          </button>

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

      {/* Status Banner / OTP Display for Requester */}
      <AnimatePresence mode="wait">
        {arrived ? (
          <motion.div
            key="arrived"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 py-3 bg-success/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success" />
              <span className="text-sm font-semibold text-success">Runner has arrived!</span>
            </div>
            {isRequester && mission?.status === "in_transit" && (
              <div className="flex items-center gap-2 bg-success text-success-foreground px-3 py-1 rounded shadow-sm text-xs font-bold">
                OTP: {mission.delivery_otp}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="onway"
            className="px-5 py-3 bg-secondary flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <span className="text-sm font-medium text-secondary-foreground">
                {mission?.status === "accepted" ? "Runner is heading to pickup" : "Runner is on the way"}
              </span>
            </div>
            {isRequester && mission?.status === "accepted" && (
              <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded shadow-sm text-xs font-bold">
                OTP: {mission.pickup_otp}
              </div>
            )}
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
            <button onClick={() => navigate(`/chat/${id}`)} className="p-2.5 bg-secondary rounded-full">
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

        {isRunner && mission?.status === "accepted" && (
          <button
            onClick={() => setShowPhotoModal(true)}
            className="w-full py-3 mt-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center justify-center gap-2"
          >
            <Camera size={18} /> Confirm Pickup
          </button>
        )}

        {isRunner && mission?.status === "in_transit" && arrived && (
          <button
            onClick={() => setShowPhotoModal(true)}
            className="w-full py-3 mt-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center justify-center gap-2"
          >
            <Camera size={18} /> Confirm Delivery
          </button>
        )}

        {isRequester && arrived && mission?.status === "delivered" && (
          <button
            onClick={() => navigate(`/confirm-delivery/${id}`)}
            className="w-full py-3 mt-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow"
          >
            Rate & Confirm
          </button>
        )}
      </div>

      {/* Photo Proof Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl flex flex-col items-center"
            >
              <h3 className="text-xl font-display font-bold text-center mb-2">
                Photo Proof
              </h3>
              <p className="text-sm text-center text-muted-foreground mb-6">
                Take a clear photo of the item at the {otpType} location.
              </p>

              {photoUrl ? (
                <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative border border-border">
                  <img src={photoUrl} alt="Proof" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotoUrl(null)}
                    className="absolute top-2 right-2 bg-background/80 p-1.5 rounded-full backdrop-blur-sm"
                  >
                    <AlertTriangle size={16} className="text-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleTakePhoto}
                  disabled={isUploading}
                  className="w-full h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 mb-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={32} className="text-primary animate-spin" />
                      <span className="text-sm font-medium text-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera size={32} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Tap to open Camera</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePhotoContinue}
                  disabled={!photoUrl}
                  className="flex-1 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-display font-bold text-center mb-2">
                {otpType === "pickup" ? "Verify Pickup" : "Verify Delivery"}
              </h3>
              <p className="text-sm text-center text-muted-foreground mb-6">
                Ask the requester for their 4-digit {otpType} OTP to secure this step.
              </p>

              <div className="flex justify-center gap-3 mb-8">
                {otpInput.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="number"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-16 text-center text-2xl font-bold bg-background border-2 border-border rounded-xl focus:border-primary outline-none transition-colors"
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOtpVerify}
                  disabled={otpInput.join("").length !== 4}
                  className="flex-1 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSosModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-card border border-destructive/20 rounded-2xl p-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-center mb-2 text-foreground">
                Emergency SOS
              </h3>
              <p className="text-sm text-center text-muted-foreground mb-6">
                Are you in an emergency? This will immediately alert Maiyom Support and share your live location.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSosModal(false);
                    toast({ variant: "destructive", title: "SOS Activated", description: "Admin support has been alerted. Calling 112..." });
                    window.open("tel:112");
                  }}
                  className="w-full py-3.5 rounded-xl bg-destructive text-destructive-foreground font-semibold shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Call Emergency (112)
                </button>

                <button
                  onClick={() => setShowSosModal(false)}
                  className="w-full py-3 rounded-xl border border-border text-foreground font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tracking;
