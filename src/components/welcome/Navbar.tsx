import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3 transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <span className="text-2xl font-display font-bold text-[var(--text-primary)] tracking-tight">Maiyom</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
                    <a href="#about" className="hover:text-brand-primary transition-colors text-[var(--text-primary)]">About</a>
                    <a href="#how-it-works" className="hover:text-brand-primary transition-colors text-[var(--text-primary)]">How it Works</a>
                    <a href="#features" className="hover:text-brand-primary transition-colors text-[var(--text-primary)]">Features</a>
                    <ThemeToggle />
                    <button onClick={() => navigate("/onboarding")} className="btn-primary-welcome">Try App Now</button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <ThemeToggle />
                    <button className="text-[var(--text-primary)]" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden absolute top-24 left-6 right-6 glass rounded-2xl p-6 flex flex-col gap-4 text-center font-semibold text-[var(--text-primary)] transition-colors duration-300"
                >
                    <a href="#about" onClick={() => setIsOpen(false)}>About</a>
                    <a href="#how-it-works" onClick={() => setIsOpen(false)}>How it Works</a>
                    <a href="#features" onClick={() => setIsOpen(false)}>Features</a>
                    <button className="btn-primary-welcome" onClick={() => { setIsOpen(false); navigate("/onboarding"); }}>Try App Now</button>
                </motion.div>
            )}
        </nav>
    );
}
