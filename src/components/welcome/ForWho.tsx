import { motion } from 'framer-motion';
import { GraduationCap, Store, Compass } from 'lucide-react';

export default function ForWho() {
    const categories = [
        {
            icon: <GraduationCap size={40} />,
            title: "For Students & Freelancers",
            subtitle: "Showcase Your Skills, Find Your First Client",
            description: "Whether you're a designer, tutor, or developer—Maiyom gives you a platform to display your work and connect with neighbors who need your talents.",
            tags: ["Designers", "Tutors", "Coders", "Photographers"]
        },
        {
            icon: <Store size={40} />,
            title: "For Local Businesses & Vendors",
            subtitle: "Reach Your Neighborhood Without the Budget",
            description: "Stop relying on word of mouth alone. Show your products and story to thousands of potential customers living right around you.",
            tags: ["Restaurants", "Salons", "Repair Services", "Boutiques"],
            featured: true
        },
        {
            icon: <Compass size={40} />,
            title: "For Everyone Exploring Local",
            subtitle: "Discover What's Happening Around You",
            description: "New to the area? Looking for reliable services? Maiyom is your window into the neighborhood—real people, real connections.",
            tags: ["New Residents", "Professionals", "Curious Neighbors"]
        }
    ];

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-6"
                    >
                        Built for Everyone Who <br /> Builds Community
                    </motion.h2>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className={`relative overflow-hidden p-10 rounded-[2.5rem] border ${cat.featured ? 'bg-brand-secondary text-white border-brand-secondary' : 'glass text-[var(--text-primary)]'}`}
                        >
                            <div className={`${cat.featured ? 'text-brand-accent' : 'text-brand-primary'} mb-8`}>
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">{cat.title}</h3>
                            <p className={`text-sm font-bold mb-6 ${cat.featured ? 'text-brand-accent' : 'text-brand-primary'} italic`}>{cat.subtitle}</p>
                            <p className={`text-sm leading-relaxed mb-8 ${cat.featured ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}>
                                {cat.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {cat.tags.map((tag, tIndex) => (
                                    <span
                                        key={tIndex}
                                        className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${cat.featured ? 'bg-white/10 text-white/80' : 'bg-brand-secondary/5 dark:bg-white/5 text-[var(--text-secondary)]'}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            {cat.featured && (
                                <div className="absolute top-6 right-6 px-3 py-1 bg-brand-accent text-brand-secondary text-[10px] font-black rounded-full rotate-12 shadow-lg">
                                    POPULAR
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
