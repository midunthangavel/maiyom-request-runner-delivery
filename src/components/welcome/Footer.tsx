import { Instagram, Linkedin, Mail, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-brand-secondary dark:bg-slate-950 text-white py-20 overflow-hidden relative transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
                                <span className="text-white font-bold text-xl">M</span>
                            </div>
                            <span className="text-2xl font-display font-bold tracking-tight">Maiyom</span>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                            Connecting neighborhoods for good. A Business Social Network (B2B & B2C) built for India's vibrant communities.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-display font-bold mb-6">Phase 1.1</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li><a href="#" className="hover:text-brand-accent transition-colors">Maiyom is a hyperlocal Mission Runner platform connecting Requesters with nearby Runners. Users post tasks (deliveries, urgent needs, events) which verified Runners accept, track, and complete. Features include real-time maps, secure payments, in-app chat, and a flexible dual-role system empowering communities to help each other while earning.</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li><a href="#" className="hover:text-brand-accent transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-brand-accent transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-brand-accent transition-colors">Trust & Safety</a></li>
                            <li><a href="#" className="hover:text-brand-accent transition-colors">Community Guidelines</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-bold mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-brand-primary shrink-0" />
                                <span>4/56, Chettipalayam, Mangalam, Tiruppur, Tamil Nadu, 641663, India</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-brand-primary shrink-0" />
                                <span>midunthangavel@gamil.com</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/30 font-medium">
                    <p>© 2026 Maiyom Pvt. Ltd.</p>
                    <div className="flex items-center gap-6">
                        <span>Made in India for India</span>
                        <a href="#waitlist" className="hover:text-white transition-colors">Back to top</a>
                    </div>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full" />
        </footer>
    );
}
