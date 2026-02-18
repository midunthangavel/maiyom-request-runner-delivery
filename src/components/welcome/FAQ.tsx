import { motion } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
    const faqs = [
        {
            question: "What exactly is Maiyom?",
            answer: "Maiyom is a hyperlocal social platform that combines video discovery with professional connections. It helps you find people, services, and opportunities in your immediate neighborhood."
        },
        {
            question: "When is Maiyom launching?",
            answer: "We're launching in March 2026, starting with Coimbatore, Tamil Nadu. Expansion to other cities will follow based on community feedback."
        },
        {
            question: "Is Maiyom free to use?",
            answer: "Yes! Maiyom will be free to download and use. We'll have optional premium features for businesses who want extra visibility and advanced tools."
        },
        {
            question: "How does Maiyom differ from Instagram?",
            answer: "Three key differences: Hyperlocal focus (within 5-10km), Business-friendly tools designed for transactions, and a Trust-first verification system."
        }
    ];

    return (
        <section className="py-24 bg-brand-secondary/[0.02] dark:bg-brand-secondary/[0.1] transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-6"
                    >
                        Questions? We've <br /> Got Answers.
                    </motion.h2>
                </div>

                <Accordion.Root type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Accordion.Item key={index} value={`item-${index}`} className="glass rounded-2xl overflow-hidden border-none shadow-sm">
                            <Accordion.Header>
                                <Accordion.Trigger className="w-full flex items-center justify-between p-6 text-left font-display font-bold text-[var(--text-primary)] hover:bg-brand-secondary/[0.02] dark:hover:bg-white/5 transition-colors group">
                                    {faq.question}
                                    <ChevronDown className="text-brand-primary group-data-[state=open]:rotate-180 transition-transform duration-300" />
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content className="p-6 pt-0 text-[var(--text-secondary)] text-sm leading-relaxed overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
                                {faq.answer}
                            </Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            </div>
        </section>
    );
}
