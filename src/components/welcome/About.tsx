import { motion, useScroll, useTransform } from 'framer-motion';
import { Video, Zap, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';

export default function About() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -20]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const parallaxY = [y1, y2, y3];

    const pillars = [
        {
            icon: <Video className="text-brand-primary" size={32} />,
            title: "Video-First Discovery",
            description: "See the faces behind every profile. From students offering tutoring to vendors showcasing their craft, video brings authenticity to every interaction."
        },
        {
            icon: <Zap className="text-brand-primary" size={32} />,
            title: "Hyperlocal by Design",
            description: "Your feed shows what's happening within 5-10km. Find services, opportunities, and connections right in your neighborhood—not across the world."
        },
        {
            icon: <ShieldCheck className="text-brand-primary" size={32} />,
            title: "Built on Trust",
            description: "Every profile tells a story. With verified badges, role indicators, and community-driven engagement, Maiyom makes it safe to connect and transact locally."
        }
    ];

    return (
        <section id="about" className="py-24 bg-brand-secondary/[0.02] dark:bg-brand-secondary/[0.1] transition-colors duration-300" ref={containerRef}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-6"
                    >
                        The Social Network Your <br className="hidden md:block" /> Neighborhood Needs
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="max-w-3xl mx-auto text-lg text-[var(--text-secondary)] leading-relaxed"
                    >
                        In a world of global platforms, we're building something different—something local.
                        Maiyom is India's first hyperlocal social marketplace where discovery meets opportunity.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {pillars.map((pillar, index) => (
                        <motion.div
                            key={index}
                            style={{ y: parallaxY[index] }}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="glass p-8 rounded-[2rem] hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6 pt-1 group-hover:scale-110 transition-transform">
                                {pillar.icon}
                            </div>
                            <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-3">{pillar.title}</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{pillar.description}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 p-8 rounded-[2.5rem] bg-brand-secondary text-white relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-2xl font-display font-bold mb-4">Think Instagram meets LinkedIn, powered by trust.</h3>
                            <p className="text-white/70">Whether you're a student, a local business, or someone exploring, Maiyom brings your community together in ways that matter.</p>
                        </div>
                        <a href="#waitlist" className="btn-primary whitespace-nowrap">Explore the Possibilities</a>
                    </div>
                    {/* Decorative grid */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </motion.div>
            </div>
        </section>
    );
}
