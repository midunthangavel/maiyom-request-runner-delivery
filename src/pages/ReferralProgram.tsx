import PageShell from "@/components/PageShell";
import { ArrowLeft, Gift, Share2, Copy, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import PageTransition from "@/components/PageTransition";

const ReferralProgram = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const referralCode = "MAIYOM-5K9X";

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <PageTransition>
            <PageShell>
                <div className="px-5 pt-6 pb-24 glass-panel min-h-screen">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => navigate(-1)} className="p-1">
                            <ArrowLeft size={20} className="text-foreground" />
                        </button>
                        <h1 className="text-xl font-display font-bold text-foreground">Refer & Earn</h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-card text-center mb-6"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                            <Gift size={32} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-foreground mb-2">Invite Friends, Earn ₹100</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Share your code. When a friend completes their first delivery, you both get ₹100 in your wallet.
                        </p>

                        <div className="bg-muted rounded-xl p-4 flex items-center justify-between border border-border/50">
                            <div className="text-left">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Your Code</p>
                                <p className="font-mono text-lg font-bold text-foreground tracking-widest">{referralCode}</p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
                            >
                                {copied ? <CheckCircle2 size={20} className="text-success" /> : <Copy size={20} className="text-muted-foreground" />}
                            </button>
                        </div>

                        <button className="w-full mt-4 py-3.5 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-glow clay-btn">
                            <Share2 size={16} /> Share Code
                        </button>
                    </motion.div>

                    <h3 className="font-display font-semibold text-foreground mb-3 px-1">Your Progress</h3>
                    <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-4">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground">Friends Joined</span>
                            <span className="text-foreground">1 / 5</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-success w-1/5 rounded-full" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Invite 4 more friends to unlock a ₹500 bonus!
                        </p>
                    </div>
                </div>
            </PageShell>
        </PageTransition>
    );
};

export default ReferralProgram;
