import PageShell from "@/components/PageShell";
import { ArrowLeft, Shield, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

const Verification = () => {
    const navigate = useNavigate();
    const { userProfile } = useApp();
    const verificationLevel = userProfile?.verification_level || 1;
    const phone = userProfile?.phone;
    const isAadhaarVerified = userProfile?.aadhaar_verified;

    return (
        <PageShell hideNav>
            <div className="px-5 pt-6">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ArrowLeft size={20} className="text-foreground" />
                    </button>
                    <h1 className="font-display font-semibold text-foreground">Verification</h1>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-center mb-6 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                        <Shield size={32} />
                    </div>
                    <h2 className="font-display font-bold text-lg mb-1">Level {verificationLevel} Verified</h2>
                    <p className="text-sm text-muted-foreground">You are a {verificationLevel >= 2 ? "trusted" : "new"} member of the community.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Completed</h3>
                        {phone ? (
                            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-green-500" />
                                <div>
                                    <p className="font-medium text-sm">Phone Number</p>
                                    <p className="text-xs text-muted-foreground">{phone}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic pl-1">No verifications completed yet.</p>
                        )}
                        {isAadhaarVerified && (
                            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 mt-3">
                                <CheckCircle2 size={20} className="text-green-500" />
                                <div>
                                    <p className="font-medium text-sm">Aadhaar KYC</p>
                                    <p className="text-xs text-muted-foreground">Verified</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold mb-3">Pending</h3>
                        <div className="space-y-4">
                            {!phone && (
                                <div className="bg-card border border-border rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <AlertCircle size={20} className="text-warning mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Phone Number</p>
                                            <p className="text-xs text-muted-foreground">Required for better trust.</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
                                        <Upload size={14} /> Link Phone
                                    </button>
                                </div>
                            )}

                            {!isAadhaarVerified && (
                                <div className="bg-card border border-border rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <AlertCircle size={20} className="text-warning mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Aadhaar KYC</p>
                                            <p className="text-xs text-muted-foreground">Required for Level 3 and higher transaction limits.</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
                                        <Upload size={14} /> Upload Aadhaar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default Verification;
