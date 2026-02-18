import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Calendar, MapPin, Fingerprint, Mail, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AuthStep = "welcome" | "signin" | "signup" | "profile";

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const Auth = () => {
  const [step, setStep] = useState<AuthStep>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Profile fields
  const [profileName, setProfileName] = useState("");
  const [profileCity, setProfileCity] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error signing in", description: error.message });
    } else {
      navigate("/home");
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setIsLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error signing up", description: error.message });
    } else if (data.user) {
      // Move to profile setup
      setStep("profile");
      toast({ title: "Account created!", description: "Please complete your profile." });
    }
  };

  const handleCreateProfile = async () => {
    setIsLoading(true);
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) return;

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      name: profileName,
      city: profileCity,
      role: "requester", // Default
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileName}`
    });

    setIsLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error creating profile", description: error.message });
    } else {
      navigate("/home");
    }
  };

  const handleBack = () => {
    if (step === "signin" || step === "signup") setStep("welcome");
    else if (step === "profile") setStep("signup");
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col bg-background">
      {/* Header */}
      <div className="pt-16 pb-6 px-6 text-center relative">
        {step !== "welcome" && (
          <button
            onClick={handleBack}
            className="absolute left-5 top-16 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft size={22} className="text-foreground" />
          </button>
        )}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow"
        >
          <span className="text-3xl">🏃</span>
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-foreground">Maiyom</h1>
        <p className="text-muted-foreground mt-1 text-sm">Community-powered delivery for India</p>
      </div>

      {/* Steps */}
      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {/* ═══════════════════ WELCOME ═══════════════════ */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-display font-semibold text-foreground">Get Started</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign in or create an account to continue</p>
              </div>

              <button
                onClick={() => setStep("signin")}
                className="w-full py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2.5 shadow-glow"
              >
                Sign In
              </button>

              <button
                onClick={() => setStep("signup")}
                className="w-full py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-muted transition-colors"
              >
                Create Account
              </button>
            </motion.div>
          )}

          {/* ═══════════════════ SIGN IN ═══════════════════ */}
          {step === "signin" && (
            <motion.div
              key="signin"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your credentials</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Mail size={16} className="text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="hello@example.com"
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Lock size={16} className="text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignIn}
                disabled={isLoading || !email || !password}
                className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"} <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ═══════════════════ SIGN UP ═══════════════════ */}
          {step === "signup" && (
            <motion.div
              key="signup"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">Create Account</h2>
                <p className="text-sm text-muted-foreground mt-1">Join the Maiyom community</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Mail size={16} className="text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="hello@example.com"
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Lock size={16} className="text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignUp}
                disabled={isLoading || !email || password.length < 6}
                className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"} <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ═══════════════════ PROFILE SETUP ═══════════════════ */}
          {step === "profile" && (
            <motion.div
              key="profile"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5 pb-8"
            >
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">Create Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell us about yourself</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <input
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      placeholder="John Doe"
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">City</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <MapPin size={16} className="text-muted-foreground" />
                    <input
                      value={profileCity}
                      onChange={e => setProfileCity(e.target.value)}
                      placeholder="Chennai"
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateProfile}
                disabled={isLoading || !profileName || !profileCity}
                className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Complete Setup"} <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 py-6 text-center">
        <p className="text-[10px] text-muted-foreground">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
};
export default Auth;

