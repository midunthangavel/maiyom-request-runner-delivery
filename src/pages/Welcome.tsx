import Navbar from '@/components/welcome/Navbar';
import Hero from '@/components/welcome/Hero';
import About from '@/components/welcome/About';
import HowItWorks from '@/components/welcome/HowItWorks';
import Features from '@/components/welcome/Features';
import ForWho from '@/components/welcome/ForWho';
import Waitlist from '@/components/welcome/Waitlist';
import FAQ from '@/components/welcome/FAQ';
import Footer from '@/components/welcome/Footer';
import InstallPrompt from '@/components/InstallPrompt';

function Welcome() {
    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />
            <main>
                <Hero />
                <About />
                <HowItWorks />
                <Features />
                <ForWho />
                <Waitlist />
                <FAQ />
            </main>
            <Footer />
            <InstallPrompt />
        </div>
    );
}

export default Welcome;
