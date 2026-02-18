import { motion } from 'framer-motion';
import { Smartphone, Search, Map, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: <Smartphone className="text-brand-primary" />,
            title: "Reels & Stories",
            description: "Share your moments, showcase your work, or highlight your business through engaging short videos."
        },
        {
            icon: <Search className="text-brand-primary" />,
            title: "Smart Search",
            description: "Find exactly what you need. From IT services to home repairs—browse 20+ specialized categories."
        },
        {
            icon: <Map className="text-brand-primary" />,
            title: "Nearby Explorer",
            description: "See who's around you on an interactive map. Filter by category, distance, and service type."
        },
        {
            icon: <Briefcase className="text-brand-primary" />,
            title: "Service Listings",
            description: "Post your availability or find locally. Students can freelance, and businesses can hire with ease."
        },
        {
            icon: <MessageSquare className="text-brand-primary" />,
            title: "Direct Messaging",
            description: "Connect instantly via in-app chat or seamlessly transition to WhatsApp for trusted communication."
        },
        {
            icon: <CheckCircle className="text-brand-primary" />,
            title: "Verified Profiles",
            description: "Know who you're dealing with. Role badges (User, Provider, Business) bring transparency to all."
        }
    ];

    return (
        <section id="features" className="py-24 bg-brand-secondary/5 dark:bg-brand-secondary/10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-6"
                    >
                        Everything You Need, <br /> Nothing You Don't
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass p-8 rounded-[2rem] hover:border-brand-primary/20 hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 pt-1 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
