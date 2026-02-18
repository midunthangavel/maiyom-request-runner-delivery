import { motion, useScroll, useTransform } from 'framer-motion';
import { UserPlus, Search, MessageSquare, TrendingUp } from 'lucide-react';
import { useRef } from 'react';

export default function HowItWorks() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const lineHeight = useTransform(scrollYProgress, [0.2, 0.5], ["0%", "100%"]);

    const steps = [
        {
            icon: <UserPlus />,
            title: "Create Your Presence",
            description: "Set up your profile in minutes. Tell your story through videos, photos, and posts."
        },
        {
            icon: <Search />,
            title: "Get Discovered",
            description: "Your content appears in the feeds of people nearby. Smart matching based on your location."
        },
        {
            icon: <MessageSquare />,
            title: "Engage & Connect",
            description: "Like, comment, and message. Build real relationships through seamless chat."
        },
        {
            icon: <TrendingUp />,
            title: "Grow Together",
            description: "As your network grows, so do your opportunities. Open doors within your neighborhood."
        }
    ];

    return (
        <section id="how-it-works" className="py-24 overflow-hidden" ref={containerRef}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-6"
                    >
                        From Discovery to <br /> Connection in Seconds
                    </motion.h2>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) - Scroll Progress */}
                    <div className="hidden md:block absolute top-[2.75rem] left-[10%] right-[10%] h-[2px] bg-brand-primary/10 -z-10 rounded-full" />
                    <motion.div
                        style={{ width: lineHeight }}
                        className="hidden md:block absolute top-[2.75rem] left-[10%] h-[2px] bg-gradient-to-r from-brand-primary to-brand-accent -z-10 rounded-full"
                    />

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="w-14 h-14 rounded-full bg-[var(--bg-primary)] border-4 border-brand-primary/10 flex items-center justify-center text-brand-primary shadow-lg mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 transform group-hover:scale-110 z-10 relative">
                                    {step.icon}
                                </div>
                                <div className="relative">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-brand-primary/20 font-display font-black text-6xl select-none -z-10">
                                        0{index + 1}
                                    </div>
                                    <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3">{step.title}</h3>
                                    <p className="text-[var(--text-secondary)] text-sm">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Call to Active Process visualization */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="mt-20 glass rounded-[2.5rem] p-10 flex items-center justify-center relative overflow-hidden"
                >
                    <div className="flex flex-col items-center gap-6 relative z-10">
                        <div className="flex items-center gap-4 bg-brand-primary/10 px-6 py-2 rounded-full border border-brand-primary/20">
                            <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse" />
                            <span className="text-brand-primary font-bold tracking-widest text-xs uppercase">Live Connection Engine</span>
                        </div>
                        <p className="text-[var(--text-primary)] font-display font-semibold text-xl text-center">Bringing Coimbatore neighbors together right now.</p>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-accent/20 blur-[100px] rounded-full" />
                    <div className="absolute -left-20 -top-20 w-64 h-64 bg-brand-primary/20 blur-[100px] rounded-full" />
                </motion.div>
            </div>
        </section>
    );
}
