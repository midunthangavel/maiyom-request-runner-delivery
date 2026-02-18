import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function Waitlist() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <section id="waitlist" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="glass p-12 md:p-20 rounded-[3rem] relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">

                    <div className="flex-1 text-center lg:text-left">
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-6"
                        >
                            Be Among the First to <br /> Experience Maiyom
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-[var(--text-secondary)] mb-8"
                        >
                            We're putting the final touches on something special. Maiyom launches in March 2026, starting right here in Coimbatore.
                        </motion.p>

                        <ul className="space-y-4 text-left inline-block lg:block">
                            {[
                                "Early access before public launch",
                                "Exclusive 'Founder Member' badge",
                                "Behind-the-scenes updates",
                                "Shape the product with feedback"
                            ].map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex items-center gap-3 text-[var(--text-secondary)] font-semibold"
                                >
                                    <CheckCircle2 size={20} className="text-brand-primary" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full max-w-md"
                    >
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass p-10 rounded-[2rem] text-center shadow-2xl border border-brand-primary/20"
                            >
                                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={40} className="text-brand-primary" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">You're on the list!</h3>
                                <p className="text-[var(--text-secondary)]">We'll reach out soon with your early access invite.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="glass p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                    className="w-full px-6 py-4 rounded-2xl bg-brand-secondary/5 dark:bg-white/5 border-2 border-transparent focus:border-brand-primary/20 outline-none transition-all font-semibold text-[var(--text-primary)]"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    className="w-full px-6 py-4 rounded-2xl bg-brand-secondary/5 dark:bg-white/5 border-2 border-transparent focus:border-brand-primary/20 outline-none transition-all font-semibold text-[var(--text-primary)]"
                                />
                                <select className="w-full px-6 py-4 rounded-2xl bg-brand-secondary/5 dark:bg-white/5 border-2 border-transparent focus:border-brand-primary/20 outline-none transition-all font-semibold text-[var(--text-secondary)]">
                                    <option value="" disabled selected>I am a...</option>
                                    <option value="student">Student / Freelancer</option>
                                    <option value="business">Business Owner</option>
                                    <option value="professional">Professional</option>
                                    <option value="exploring">Just Exploring</option>
                                </select>
                                <button type="submit" className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-lg mt-4">
                                    Join the Waitlist
                                    <Send size={20} />
                                </button>
                                <p className="text-[10px] text-center text-[var(--text-secondary)] font-medium">
                                    No spam, ever. Just updates on our journey and your early access invite.
                                </p>
                            </form>
                        )}
                    </motion.div>

                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-full -z-10 flex justify-between px-20 opacity-20 pointer-events-none">
                <div className="w-96 h-96 bg-brand-primary blur-[160px] rounded-full" />
                <div className="w-96 h-96 bg-brand-accent blur-[160px] rounded-full" />
            </div>
        </section>
    );
}
