import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, ArrowRight, Sparkles } from "lucide-react";

interface TourStep {
    title: string;
    description: string;
    emoji: string;
}

const tourSteps: TourStep[] = [
    {
        emoji: "👋",
        title: "Welcome to Maiyom!",
        description: "Your hyperlocal delivery marketplace. Let us show you around in 30 seconds.",
    },
    {
        emoji: "📦",
        title: "Create a Mission",
        description: "Tap 'I Need Something' to post a delivery request. Set your budget, location, and timeline.",
    },
    {
        emoji: "🔄",
        title: "Switch Roles",
        description: "You can be both a Requester and a Runner. Use the role switcher in the top bar to toggle.",
    },
    {
        emoji: "💬",
        title: "Chat with Runners",
        description: "Once a runner makes an offer, chat with them directly to coordinate your delivery.",
    },
    {
        emoji: "🎉",
        title: "You're All Set!",
        description: "Start by creating your first mission or browsing the runner feed. Happy delivering!",
    },
];

const TOUR_KEY = "maiyom_tour_completed";

export default function OnboardingTour() {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(TOUR_KEY);
        if (!completed) {
            // Small delay so the page renders first
            const timer = setTimeout(() => setIsVisible(true), 600);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (step < tourSteps.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem(TOUR_KEY, "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const current = tourSteps[step];
    const isLast = step === tourSteps.length - 1;
    const progress = ((step + 1) / tourSteps.length) * 100;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleComplete} />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative bg-card rounded-3xl shadow-2xl border border-border p-8 max-w-sm w-full"
                    >
                        {/* Skip */}
                        <button
                            onClick={handleComplete}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
                        >
                            <X size={16} className="text-muted-foreground" />
                        </button>

                        {/* Progress bar */}
                        <div className="w-full h-1 bg-muted rounded-full mb-8 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Emoji */}
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="text-6xl mb-6 text-center"
                        >
                            {current.emoji}
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            key={`content-${step}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center mb-8"
                        >
                            <h3 className="text-xl font-display font-bold text-foreground mb-2">
                                {current.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {current.description}
                            </p>
                        </motion.div>

                        {/* Step indicators */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            {tourSteps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleComplete}
                                className="text-xs text-muted-foreground font-medium hover:text-foreground transition-colors"
                            >
                                Skip Tour
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNext}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-primary text-white font-semibold text-sm shadow-glow"
                            >
                                {isLast ? (
                                    <>
                                        Get Started <Sparkles size={16} />
                                    </>
                                ) : (
                                    <>
                                        Next <ArrowRight size={16} />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
