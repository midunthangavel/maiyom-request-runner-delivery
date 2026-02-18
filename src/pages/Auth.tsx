import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, Shield, MapPin, Camera, Mic, FolderOpen, ChevronLeft, Calendar, CreditCard, Fingerprint } from "lucide-react";

type AuthStep = "welcome" | "phone" | "otp" | "role" | "permissions" | "profile";

// Google "G" logo SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Apple logo SVG
const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const Auth = () => {
  const [step, setStep] = useState<AuthStep>("welcome");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedRole, setSelectedRole] = useState<"requester" | "runner" | "both">("requester");
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);

  // Profile fields
  const [profileName, setProfileName] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileAadhaar, setProfileAadhaar] = useState("");
  const [profilePan, setProfilePan] = useState("");

  // Permissions state
  const [permissionsGranted, setPermissionsGranted] = useState({
    location: false,
    storage: false,
    camera: false,
    microphone: false,
  });

  const { setAuthenticated, setCurrentRole, setAuthMethod, setUserName, setUserProfile } = useApp();
  const navigate = useNavigate();

  const handlePhoneSubmit = () => {
    if (phone.length >= 10) setStep("otp");
  };

  const handleOtpSubmit = () => {
    if (otp.length === 4) setStep("role");
  };

  const handleSocialAuth = (provider: "google" | "apple") => {
    setSocialLoading(provider);
    setAuthMethod(provider);
    // Simulate social auth loading
    setTimeout(() => {
      setProfileName(provider === "google" ? "Rahul Kumar" : "Rahul K.");
      setSocialLoading(null);
      setStep("role");
    }, 1500);
  };

  const handleRoleNext = () => {
    setCurrentRole(selectedRole === "both" ? "requester" : selectedRole);
    setStep("permissions");
  };

  const handleRequestPermissions = async () => {
    const newPerms = { ...permissionsGranted };

    // Request location
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      newPerms.location = true;
      setProfileLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
    } catch {
      newPerms.location = false;
    }

    // Request camera & microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      newPerms.camera = true;
      newPerms.microphone = true;
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      newPerms.camera = false;
      newPerms.microphone = false;
    }

    // Storage (always "granted" in web context)
    newPerms.storage = true;

    setPermissionsGranted(newPerms);
    setStep("profile");
  };

  const handleSkipPermissions = () => {
    setStep("profile");
  };

  const handleFinish = () => {
    const finalName = profileName || "Rahul Kumar";
    setUserName(finalName);
    setUserProfile({
      name: finalName,
      dob: profileDob,
      city: profileCity,
      location: profileLocation,
      aadhaar: profileAadhaar,
      pan: profilePan,
    });
    setAuthenticated(true);
    navigate("/home");
  };

  const isRunnerRole = selectedRole === "runner" || selectedRole === "both";
  const canFinishProfile = profileName.trim().length > 0 && profileDob && profileCity.trim().length > 0;

  const handleBack = () => {
    const backMap: Record<AuthStep, AuthStep> = {
      welcome: "welcome",
      phone: "welcome",
      otp: "phone",
      role: "welcome",
      permissions: "role",
      profile: "permissions",
    };
    setStep(backMap[step]);
  };

  // Format aadhaar with spaces: 1234 5678 9012
  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // Format PAN: uppercase, max 10 chars
  const formatPan = (val: string) => {
    return val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
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

        {/* Step indicator */}
        {step !== "welcome" && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {["phone", "otp", "role", "permissions", "profile"].map((s, i) => {
              const steps: AuthStep[] = ["phone", "otp", "role", "permissions", "profile"];
              const currentIdx = steps.indexOf(step);
              const dotIdx = i;
              return (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all duration-300 ${dotIdx <= currentIdx
                      ? "w-6 bg-gradient-primary"
                      : "w-1.5 bg-border"
                    }`}
                />
              );
            })}
          </div>
        )}
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
              <div className="text-center mb-2">
                <h2 className="text-xl font-display font-semibold text-foreground">Get Started</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
              </div>

              {/* Google Button */}
              <button
                onClick={() => handleSocialAuth("google")}
                disabled={socialLoading !== null}
                className="btn-social btn-google"
              >
                {socialLoading === "google" ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{socialLoading === "google" ? "Signing in..." : "Continue with Google"}</span>
              </button>

              {/* Apple Button */}
              <button
                onClick={() => handleSocialAuth("apple")}
                disabled={socialLoading !== null}
                className="btn-social btn-apple"
              >
                {socialLoading === "apple" ? (
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
                ) : (
                  <AppleIcon />
                )}
                <span>{socialLoading === "apple" ? "Signing in..." : "Continue with Apple"}</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Phone Button */}
              <button
                onClick={() => {
                  setAuthMethod("phone");
                  setStep("phone");
                }}
                className="w-full py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-muted transition-colors"
              >
                <Phone size={18} />
                Continue with Phone
              </button>
            </motion.div>
          )}

          {/* ═══════════════════ PHONE ═══════════════════ */}
          {step === "phone" && (
            <motion.div
              key="phone"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">Enter your phone</h2>
                <p className="text-sm text-muted-foreground mt-1">We'll send you a verification code</p>
              </div>
              <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-3">
                <span className="text-sm font-medium text-muted-foreground">+91</span>
                <div className="w-px h-6 bg-border" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="flex-1 bg-transparent text-foreground text-lg font-medium outline-none placeholder:text-muted-foreground/50 font-body"
                />
                <Phone size={18} className="text-muted-foreground" />
              </div>
              <button
                onClick={handlePhoneSubmit}
                disabled={phone.length < 10}
                className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity shadow-glow"
              >
                Send OTP <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ═══════════════════ OTP ═══════════════════ */}
          {step === "otp" && (
            <motion.div
              key="otp"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">Verify OTP</h2>
                <p className="text-sm text-muted-foreground mt-1">Sent to +91 {phone}</p>
              </div>
              <div className="flex gap-3 justify-center">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const newOtp = otp.split("");
                      newOtp[i] = val;
                      setOtp(newOtp.join(""));
                      if (val && e.target.nextElementSibling) {
                        (e.target.nextElementSibling as HTMLInputElement).focus();
                      }
                    }}
                    className="w-14 h-14 text-center text-2xl font-bold bg-card border border-border rounded-lg text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-body"
                  />
                ))}
              </div>
              <button
                onClick={handleOtpSubmit}
                disabled={otp.length < 4}
                className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 shadow-glow"
              >
                Verify <Shield size={16} />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Didn't receive? <button className="text-primary font-medium">Resend</button>
              </p>
            </motion.div>
          )}

          {/* ═══════════════════ ROLE SELECTION ═══════════════════ */}
          {step === "role" && (
            <motion.div
              key="role"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">How will you use Maiyom?</h2>
                <p className="text-sm text-muted-foreground mt-1">You can always switch later</p>
              </div>
              <div className="space-y-3">
                {([
                  { key: "requester", emoji: "📦", title: "Requester", desc: "Post missions and get things delivered" },
                  { key: "runner", emoji: "🏃", title: "Runner", desc: "Fulfill missions and earn money" },
                  { key: "both", emoji: "🔄", title: "Both", desc: "Switch between roles anytime" },
                ] as const).map((role) => (
                  <button
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${selectedRole === role.key
                        ? "border-primary bg-secondary shadow-card"
                        : "border-border bg-card hover:border-primary/30"
                      }`}
                  >
                    <span className="text-2xl">{role.emoji}</span>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{role.title}</div>
                      <div className="text-xs text-muted-foreground">{role.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleRoleNext}
                className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-glow"
              >
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ═══════════════════ PERMISSIONS ═══════════════════ */}
          {step === "permissions" && (
            <motion.div
              key="permissions"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">Enable Permissions</h2>
                <p className="text-sm text-muted-foreground mt-1">These help us provide the best experience</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: MapPin,
                    label: "Location",
                    desc: "Find nearby missions & runners",
                    granted: permissionsGranted.location,
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                  },
                  {
                    icon: FolderOpen,
                    label: "Storage",
                    desc: "Save photos & delivery proofs",
                    granted: permissionsGranted.storage,
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                  },
                  {
                    icon: Camera,
                    label: "Camera",
                    desc: "Take item photos & scan QR codes",
                    granted: permissionsGranted.camera,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                  },
                  {
                    icon: Mic,
                    label: "Microphone",
                    desc: "Voice messages & calls",
                    granted: permissionsGranted.microphone,
                    color: "text-violet-500",
                    bg: "bg-violet-500/10",
                  },
                ].map((perm) => (
                  <div
                    key={perm.label}
                    className="flex items-center gap-3.5 p-3.5 bg-card border border-border rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-lg ${perm.bg} flex items-center justify-center flex-shrink-0`}>
                      <perm.icon size={20} className={perm.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{perm.label}</div>
                      <div className="text-xs text-muted-foreground">{perm.desc}</div>
                    </div>
                    {perm.granted && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleRequestPermissions}
                className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-glow"
              >
                Allow All & Continue <ArrowRight size={16} />
              </button>
              <button
                onClick={handleSkipPermissions}
                className="w-full py-2.5 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
              >
                Skip for now
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
                <h2 className="text-xl font-display font-semibold text-foreground">Complete Your Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell us a bit about yourself</p>
              </div>

              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-glow">
                  {profileName ? profileName.charAt(0).toUpperCase() : "?"}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g., Rahul Kumar"
                  className="auth-input"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Calendar size={12} /> Date of Birth
                </label>
                <input
                  type="date"
                  value={profileDob}
                  onChange={(e) => setProfileDob(e.target.value)}
                  className="auth-input"
                />
              </div>

              {/* City */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <MapPin size={12} /> City / Place
                </label>
                <input
                  value={profileCity}
                  onChange={(e) => setProfileCity(e.target.value)}
                  placeholder="e.g., Chennai"
                  className="auth-input"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Location</label>
                <div className="flex items-center gap-2">
                  <input
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    placeholder={permissionsGranted.location ? "Auto-detected" : "Enter manually"}
                    className="auth-input flex-1"
                    readOnly={permissionsGranted.location && profileLocation !== ""}
                  />
                  {permissionsGranted.location && profileLocation && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={14} className="text-emerald-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Runner-specific fields */}
              {isRunnerRole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-5 pt-2"
                >
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">Runner Verification</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Aadhaar */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Fingerprint size={12} /> Aadhaar Card Number
                    </label>
                    <input
                      value={profileAadhaar}
                      onChange={(e) => setProfileAadhaar(formatAadhaar(e.target.value))}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                      className="auth-input tracking-widest"
                    />
                    <p className="text-[10px] text-muted-foreground/70 mt-1">12-digit Aadhaar number for identity verification</p>
                  </div>

                  {/* PAN */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <CreditCard size={12} /> PAN Card Number
                    </label>
                    <input
                      value={profilePan}
                      onChange={(e) => setProfilePan(formatPan(e.target.value))}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="auth-input tracking-widest uppercase"
                    />
                    <p className="text-[10px] text-muted-foreground/70 mt-1">Required for earnings & tax compliance</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleFinish}
                disabled={!canFinishProfile}
                className="w-full py-3.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 shadow-glow"
              >
                Get Started <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center">
        <p className="text-[10px] text-muted-foreground">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
