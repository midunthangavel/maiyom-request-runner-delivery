import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (!isStandalone) {
            if (isIosDevice) {
                // iOS doesn't support beforeinstallprompt, show custom instruction
                const hasSeenPrompt = localStorage.getItem('pwaPromptSeen');
                if (!hasSeenPrompt) {
                    setTimeout(() => setShowPrompt(true), 3000);
                }
            } else {
                // Android / Chrome supports beforeinstallprompt
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    setDeferredPrompt(e);

                    const hasSeenPrompt = localStorage.getItem('pwaPromptSeen');
                    if (!hasSeenPrompt) {
                        setShowPrompt(true);
                    }
                });
            }
        }
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
        setShowPrompt(false);
        localStorage.setItem('pwaPromptSeen', 'true');
    };

    const handleClose = () => {
        setShowPrompt(false);
        localStorage.setItem('pwaPromptSeen', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-card border border-border rounded-xl p-4 shadow-xl flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">Install Maiyom</h4>
                    {isIOS ? (
                        <p className="text-xs text-muted-foreground mt-1">
                            Tap the share icon <span className="inline-block border border-border rounded bg-muted/50 px-1 mx-0.5">􀈂</span> below and select "Add to Home Screen" to install the app.
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                            Install our app for a better, faster, full-screen mobile experience.
                        </p>
                    )}

                    {!isIOS && (
                        <button
                            onClick={handleInstallClick}
                            className="mt-3 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg"
                        >
                            Install App
                        </button>
                    )}
                </div>

                <button
                    onClick={handleClose}
                    className="p-1 -mr-1 -mt-1 text-muted-foreground hover:bg-muted rounded-md"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
