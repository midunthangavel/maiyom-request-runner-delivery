import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "maiyom_install_dismissed";

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Don't show if already dismissed recently
        const dismissed = localStorage.getItem(DISMISSED_KEY);
        if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setVisible(false);
        localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center items-end pointer-events-none"
                >
                    <div className="bg-background/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl w-full max-w-md pointer-events-auto ring-1 ring-black/5 dark:ring-white/10">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                                <Download size={24} className="text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h3 className="font-semibold text-lg leading-tight text-foreground">Install Maiyom</h3>
                                <p className="text-sm text-muted-foreground mt-1">Get the full experience nicely on your home screen.</p>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="p-2 -mr-2 -mt-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={handleDismiss}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary transition-colors"
                            >
                                Not now
                            </button>
                            <button
                                onClick={handleInstall}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                Install App
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPrompt;
