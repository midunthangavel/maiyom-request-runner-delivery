import { motion, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight, MapPin, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const fullText = 'Neighborhood';
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleTyping = () => {
            // const i = loopNum % 1; // Only one word for now, but scalable

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 150);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500); // Pause at end
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    // Parallax Effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    const blob1X = useSpring(useTransform(mouseX, [0, window.innerWidth], [-50, 50]), { stiffness: 50, damping: 20 });
    const blob1Y = useSpring(useTransform(mouseY, [0, window.innerHeight], [-50, 50]), { stiffness: 50, damping: 20 });
    const blob2X = useSpring(useTransform(mouseX, [0, window.innerWidth], [50, -50]), { stiffness: 50, damping: 20 });
    const blob2Y = useSpring(useTransform(mouseY, [0, window.innerHeight], [50, -50]), { stiffness: 50, damping: 20 });


    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Blobs */}
            <motion.div
                style={{ x: blob1X, y: blob1Y }}
                className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-brand-primary/10 blur-3xl rounded-full"
            />
            <motion.div
                style={{ x: blob2X, y: blob2Y }}
                className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-brand-accent/10 blur-3xl rounded-full"
            />

            <div className="max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-brand-primary font-semibold text-sm mb-8">
                        <MapPin size={16} />
                        <span>Launching March 2026 | Starting in Coimbatore</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 text-[var(--text-primary)]">
                        Where Your <span className="text-gradient">
                            {text}
                            <span className="animate-blink">|</span>
                        </span> <br />
                        Comes Alive
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--text-secondary)] mb-10">
                        Discover local talent, connect with businesses around you, and turn every interaction into opportunity.
                        Maiyom is the social platform built for India's communities.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate("/onboarding")} className="btn-primary-welcome flex items-center gap-2 group">
                            Try App Now
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a href="#about" className="btn-secondary-welcome flex items-center gap-2">
                            <PlayCircle size={20} />
                            Learn More
                        </a>
                    </div>
                </motion.div>

                {/* Hero Visual Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="mt-20 relative max-w-5xl mx-auto"
                >
                    <div className="glass rounded-[2rem] p-4 p-[2px] bg-gradient-to-b from-white/40 to-white/5">
                        <div className="bg-[#1a1a1a] rounded-[1.8rem] overflow-hidden shadow-2xl aspect-video md:aspect-[21/9] relative flex items-center justify-center">
                            {/* Placeholder for video/illustration */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-transparent to-brand-secondary/20 animate-pulse" />
                            <div className="relative text-center px-6">
                                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform">
                                    <PlayCircle size={40} className="text-white" />
                                </div>
                                <p className="text-white/60 font-medium">Coming Soon: App Preview</p>
                            </div>
                        </div>
                    </div>

                    {/* Floating UI Elements */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="hidden lg:block absolute -top-10 -left-10 glass p-4 rounded-2xl shadow-xl flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                            <MapPin size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-[var(--text-primary)]">Near You</p>
                            <p className="text-[10px] text-[var(--text-secondary)]">Graphic Designer - 500m</p>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="hidden lg:block absolute bottom-10 -right-10 glass p-4 rounded-2xl shadow-xl flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                            <ArrowRight size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-[var(--text-primary)]">Connection</p>
                            <p className="text-[10px] text-[var(--text-secondary)]">New mission starting...</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
