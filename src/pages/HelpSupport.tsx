import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MessageCircle, PhoneCall, Mail, ChevronDown, CheckCircle2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
    {
        question: "How do I become a verified runner?",
        answer: "Go to your Profile and tap on Verification. Complete your Aadhaar KYC to instantly get verified and reach Level 3.",
    },
    {
        question: "Is my payment safe?",
        answer: "Yes! When a mission is accepted, the requester's payment is held securely in escrow and only released to the runner once delivery is confirmed.",
    },
    {
        question: "What if the runner doesn't show up?",
        answer: "If the runner fails to deliver within the timeframe, you can cancel the mission and receive a full refund from escrow.",
    },
    {
        question: "How do I withdraw my earnings?",
        answer: "Go to the Wallet screen and click Withdraw. Earnings are deposited to your linked bank account within 2-4 business days.",
    },
];

const HelpSupport = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [ticketSent, setTicketSent] = useState(false);

    const filteredFaqs = FAQS.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendTicket = (e: React.FormEvent) => {
        e.preventDefault();
        setTicketSent(true);
        setTimeout(() => setTicketSent(false), 3000);
    };

    return (
        <PageShell>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1">
                    <ArrowLeft size={20} className="text-foreground" />
                </button>
                <h1 className="font-display font-semibold text-foreground flex-1">Help & Support</h1>
            </div>

            <div className="px-5 py-5 space-y-6">
                {/* Search */}
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-3 shadow-sm">
                    <Search size={18} className="text-muted-foreground" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search help articles..."
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 font-body"
                    />
                </div>

                {/* Contact Options */}
                <div>
                    <h2 className="text-sm font-semibold text-foreground mb-3">Contact Us</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors">
                            <MessageCircle size={24} className="text-primary mb-2" />
                            <span className="text-[10px] font-medium text-foreground">Live Chat</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors">
                            <PhoneCall size={24} className="text-primary mb-2" />
                            <span className="text-[10px] font-medium text-foreground">Call Us</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors">
                            <Mail size={24} className="text-primary mb-2" />
                            <span className="text-[10px] font-medium text-foreground">Email</span>
                        </button>
                    </div>
                </div>

                {/* FAQs */}
                <div>
                    <h2 className="text-sm font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {filteredFaqs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No matching questions found.</p>
                        ) : (
                            filteredFaqs.map((faq, index) => (
                                <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-foreground">{faq.question}</span>
                                        <ChevronDown
                                            size={16}
                                            className={`text-muted-foreground transition-transform ${openFaqIndex === index ? "translate-y-[1px] rotate-180" : ""}`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openFaqIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-3 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border mt-1">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Create Support Ticket */}
                <div>
                    <h2 className="text-sm font-semibold text-foreground mb-3">Submit a Ticket</h2>
                    <form onSubmit={handleSendTicket} className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Issue Type</label>
                            <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors">
                                <option>Payment Issue</option>
                                <option>Account Verification</option>
                                <option>Mission Dispute</option>
                                <option>Technical Bug</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Explain the issue in detail..."
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={ticketSent}
                            className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {ticketSent ? <><CheckCircle2 size={16} /> Ticket Submitted</> : "Submit Ticket"}
                        </button>
                    </form>
                </div>
            </div>
        </PageShell>
    );
};

export default HelpSupport;
