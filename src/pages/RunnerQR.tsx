import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { QrCode, ArrowLeft } from "lucide-react";

const RunnerQR = () => {
  const navigate = useNavigate();
  const { userName } = useApp();

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display font-semibold text-foreground">Delivery QR Code</h1>
      </div>

      <div className="px-5 py-10 flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Show this QR code to the requester to confirm delivery
        </p>

        {/* Mock QR Code */}
        <div className="w-56 h-56 bg-card rounded-2xl border-2 border-border shadow-elevated flex items-center justify-center mb-6">
          <div className="grid grid-cols-7 gap-1 p-4">
            {Array.from({ length: 49 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm ${
                  Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-lg font-display font-bold text-foreground mb-1">{userName}</p>
        <p className="text-xs text-muted-foreground mb-6">Verification Code: <span className="font-mono font-semibold text-foreground">MYM-4829</span></p>

        <div className="bg-secondary rounded-lg p-4 w-full text-center">
          <QrCode size={20} className="text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            The requester will scan this code to confirm they've received their items
          </p>
        </div>
      </div>
    </div>
  );
};

export default RunnerQR;
