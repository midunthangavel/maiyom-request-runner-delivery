import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Calendar, MapPin, Fingerprint, Mail, Lock, Loader2, User, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type AuthStep = "welcome" | "signin" | "signup" | "profile-role" | "profile-details" | "profile-identity";

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
  const [role, setRole] = useState<"requester" | "runner" | "both">("requester");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useApp();

  // 1. Auto-Redirect if logged in
  useEffect(() => {
    if (isAuthenticated) {
      // If we are deep in onboarding, don't redirect yet? 
      // actually, if we are authenticated but profile is missing, we might need to stay here.
      // But for now let's assume if they are authenticated and visiting /auth, they want to go home
      // UNLESS they just signed up and are in the middle of onboarding.
      // We can check if step is welcome/signin.
      if (step === "welcome" || step === "signin") {
        const from = (location.state as any)?.from?.pathname || "/home";
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, location, step]);


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
      // Navigation handled by useEffect or AuthGate
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
      setStep("profile-role");
      toast({ title: "Account created!", description: "Let's set up your profile." });
    }
  };


  const handleCompleteProfile = async () => {
    // Validate Aadhaar format (12 digits) if provided
    if (aadhaar && !/^\d{12}$/.test(aadhaar.replace(/\s/g, ""))) {
      toast({ variant: "destructive", title: "Invalid Aadhaar", description: "Aadhaar number must be exactly 12 digits." });
      return;
    }

    // Validate PAN format (ABCDE1234F) if provided
    if (pan && !/^[A-Z]{5}\d{4}[A-Z]$/.test(pan.toUpperCase())) {
      toast({ variant: "destructive", title: "Invalid PAN", description: "PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)." });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("No authenticated user found.");

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        name: fullName,
        username,
        role,
        city,
        address,
        dob: dob ? new Date(dob).toISOString().split('T')[0] : null,
        aadhaar_number: aadhaar ? aadhaar.replace(/\s/g, "") : null,
        pan_number: pan ? pan.toUpperCase() : null,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || fullName}`,
        aadhaar_verified: false, // Default
      });

      if (error) throw error;

      toast({ title: "Welcome to Maiyom!", description: "Profile setup complete." });
      navigate("/home");
    } catch (error: any) {
      console.error("Profile creation failed:", error);
      toast({
        variant: "destructive",
        title: "Error creating profile",
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "signin" || step === "signup") setStep("welcome");
    else if (step === "profile-role") setStep("signup"); // Potentially dangerous if user already created account, but they can just sign in
    else if (step === "profile-details") setStep("profile-role");
    else if (step === "profile-identity") setStep("profile-details");
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
          layoutId="brand-logo"
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow"
        >
          <span className="text-3xl">🏃</span>
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-foreground">Maiyom</h1>
        <p className="text-muted-foreground mt-1 text-sm">Community-powered delivery for India</p>
      </div>

      {/* Steps */}
      <div className="flex-1 px-6 pb-8">
        <AnimatePresence mode="wait">
          {/* ════════════ WELCOME ════════════ */}
          {step === "welcome" && (
            <motion.div key="welcome" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-display font-semibold text-foreground">Get Started</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign in or create an account to continue</p>
              </div>
              <button onClick={() => setStep("signin")} className="w-full py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow">Sign In</button>
              <button onClick={() => setStep("signup")} className="w-full py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors">Create Account</button>
            </motion.div>
          )}

          {/* ════════════ SIGN IN ════════════ */}
          {step === "signin" && (
            <motion.div key="signin" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-display font-semibold text-foreground">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your credentials</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Mail size={16} className="text-muted-foreground" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="hello@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Lock size={16} className="text-muted-foreground" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="••••••••" />
                  </div>
                </div>
              </div>
              <button onClick={handleSignIn} disabled={isLoading} className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"} <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ════════════ SIGN UP ════════════ */}
          {step === "signup" && (
            <motion.div key="signup" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-display font-semibold text-foreground">Create Account</h2>
                <p className="text-sm text-muted-foreground mt-1">Join the Maiyom community</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Mail size={16} className="text-muted-foreground" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="hello@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Lock size={16} className="text-muted-foreground" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="Min 6 characters" />
                  </div>
                </div>
              </div>
              <button onClick={handleSignUp} disabled={isLoading || password.length < 6} className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"} <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ════════════ PROFILE: ROLE ════════════ */}
          {step === "profile-role" && (
            <motion.div key="role" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-display font-semibold text-foreground">Choose your Role</h2>
                <p className="text-sm text-muted-foreground mt-1">How will you use Maiyom?</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {["requester", "runner", "both"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r as any)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      role === r ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80"
                    )}
                  >
                    <h3 className="font-semibold capitalize text-foreground">{r}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r === "requester" && "I want to send packages and get things done."}
                      {r === "runner" && "I want to earn money by delivering items."}
                      {r === "both" && "I want to do both!"}
                    </p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("profile-details")} className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Continue <ArrowRight size={16} className="inline ml-1" /></button>
            </motion.div>
          )}

          {/* ════════════ PROFILE: DETAILS ════════════ */}
          {step === "profile-details" && (
            <motion.div key="details" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-display font-semibold text-foreground">About You</h2>
                <p className="text-sm text-muted-foreground mt-1">Basic details for your profile</p>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-card border border-border rounded-lg p-2.5 text-sm" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Username</label>
                    <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-card border border-border rounded-lg p-2.5 text-sm" placeholder="@johnny" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-2.5">
                    <Calendar size={16} className="text-muted-foreground" />
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">City</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-2.5">
                    <MapPin size={16} className="text-muted-foreground" />
                    <input value={city} onChange={e => setCity(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="Chennai" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-card border border-border rounded-lg p-2.5 text-sm min-h-[60px]" placeholder="123, Gandhi Road..." />
                </div>
              </div>
              <button onClick={() => setStep("profile-identity")} disabled={!fullName || !username || !city} className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">Continue <ArrowRight size={16} /></button>
            </motion.div>
          )}

          {/* ════════════ PROFILE: IDENTITY ════════════ */}
          {step === "profile-identity" && (
            <motion.div key="identity" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-display font-semibold text-foreground">Identity Verification</h2>
                <p className="text-sm text-muted-foreground mt-1">Secure your account (Optional for now)</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Aadhaar Number</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <Fingerprint size={16} className="text-muted-foreground" />
                    <input value={aadhaar} onChange={e => setAadhaar(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="XXXX XXXX XXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">PAN Number</label>
                  <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                    <CreditCard size={16} className="text-muted-foreground" />
                    <input value={pan} onChange={e => setPan(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="ABCDE1234F" />
                  </div>
                </div>
              </div>
              <button onClick={handleCompleteProfile} disabled={isLoading} className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-glow">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Finish Setup"} <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;

