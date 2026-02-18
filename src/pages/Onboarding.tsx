import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
    {
        emoji: "🚀",
        title: "Welcome to Maiyom",
        subtitle: "Your hyperlocal delivery marketplace",
        description: "Get anything delivered by trusted local runners — from medicines to birthday surprises.",
        gradient: "from-orange-500 to-amber-500",
    },
    {
        emoji: "📦",
        title: "Post a Mission",
        subtitle: "Tell us what you need",
        description: "Describe your item, set your budget, and runners nearby will send offers within minutes.",
        gradient: "from-violet-500 to-purple-500",
    },
    {
        emoji: "🏃",
        title: "Track in Real-Time",
        subtitle: "Know exactly where your delivery is",
        description: "Watch your runner on a live map with ETA updates. Chat directly if needed.",
        gradient: "from-emerald-500 to-teal-500",
    },
    {
        emoji: "🛡️",
        title: "Safe & Verified",
        subtitle: "Escrow payments + KYC verification",
        description: "Your money is held safely until delivery is confirmed. All runners are ID-verified.",
        gradient: "from-blue-500 to-cyan-500",
    },
];

const Onboarding = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const isLast = current === slides.length - 1;

    const handleNext = () => {
        if (isLast) {
            localStorage.setItem("maiyom_onboarded", "true");
            navigate("/auth");
        } else {
            setCurrent((prev) => prev + 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem("maiyom_onboarded", "true");
        navigate("/auth");
    };

    return (
        <div className="min-h-screen max-w-lg mx-auto bg-background flex flex-col">
            {/* Skip button */}
            <div className="flex justify-end px-5 pt-5">
                {!isLast && (
                    <button
                        onClick={handleSkip}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Skip
                    </button>
                )}
            </div>

            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -60 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="text-center"
                    >
                        {/* Animated emoji circle */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                            className={`w-32 h-32 rounded-full bg-gradient-to-br ${slides[current].gradient} mx-auto mb-8 flex items-center justify-center shadow-lg`}
                        >
                            <span className="text-6xl">{slides[current].emoji}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-display font-bold text-foreground mb-2"
                        >
                            {slides[current].title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm font-medium text-primary mb-3"
                        >
                            {slides[current].subtitle}
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto"
                        >
                            {slides[current].description}
                        </motion.p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots + Button */}
            <div className="px-8 pb-10 safe-bottom">
                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {slides.map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                width: i === current ? 24 : 8,
                                backgroundColor: i === current ? "hsl(28, 95%, 52%)" : "hsl(var(--muted))",
                            }}
                            transition={{ duration: 0.3 }}
                            className="h-2 rounded-full"
                        />
                    ))}
                </div>

                {/* CTA Button */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow"
                >
                    {isLast ? "Get Started" : "Next"}
                </motion.button>
            </div>
        </div>
    );
};

export default Onboarding;
