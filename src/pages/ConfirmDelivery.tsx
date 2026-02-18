import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, QrCode, CheckCircle2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";

const ConfirmDelivery = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setMissions } = useApp();
  const [scanning, setScanning] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleScan = () => {
    setScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setScanning(false);
      setConfirmed(true);
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "delivered" } : m))
      );
    }, 2000);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen max-w-lg mx-auto bg-background flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} className="text-success" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-display font-bold text-foreground mb-2"
        >
          Delivery Confirmed!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground mb-2 text-center"
        >
          Payment of ₹350 has been released to the runner
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-1.5 text-xs font-medium mb-8"
        >
          <Shield size={12} /> Escrow Released
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={() => navigate(`/rate/${id}`)}
          className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow"
        >
          Rate Your Runner
        </motion.button>
        <button
          onClick={() => navigate("/home")}
          className="mt-3 text-sm text-muted-foreground"
        >
          Skip for now
        </button>
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
        <h1 className="font-display font-semibold text-foreground">Confirm Delivery</h1>
      </div>

      <div className="px-5 py-8 flex flex-col items-center">
        {/* QR Scanner Area */}
        <div className="w-64 h-64 rounded-2xl border-2 border-dashed border-primary/30 bg-card flex flex-col items-center justify-center mb-6 relative overflow-hidden">
          {scanning ? (
            <>
              <motion.div
                animate={{ y: [-100, 100] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="absolute left-4 right-4 h-0.5 bg-primary shadow-glow"
              />
              <p className="text-sm text-primary font-medium z-10">Scanning...</p>
            </>
          ) : (
            <>
              <QrCode size={64} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground text-center px-4">
                Scan the runner's QR code to confirm delivery
              </p>
            </>
          )}
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow disabled:opacity-60 mb-4"
        >
          {scanning ? "Scanning..." : "Scan QR Code"}
        </button>

        <div className="w-full flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleScan}
          className="w-full py-3 rounded-lg border border-border bg-card text-foreground font-medium text-sm"
        >
          Enter Code Manually
        </button>

        <p className="text-[10px] text-muted-foreground mt-6 text-center">
          Only confirm delivery after you've received your items and verified them
        </p>
      </div>
    </div>
  );
};

export default ConfirmDelivery;
