import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface TimelineStep {
    label: string;
    status: "completed" | "active" | "upcoming";
    time?: string;
}

interface MissionTimelineProps {
    missionStatus: string;
}

const getSteps = (status: string): TimelineStep[] => {
    const steps: TimelineStep[] = [
        { label: "Posted", status: "upcoming" },
        { label: "Offers In", status: "upcoming" },
        { label: "Accepted", status: "upcoming" },
        { label: "In Transit", status: "upcoming" },
        { label: "Delivered", status: "upcoming" },
    ];

    const statusMap: Record<string, number> = {
        open: 0,
        offered: 1,
        accepted: 2,
        "in-transit": 3,
        delivered: 4,
    };

    const activeIndex = statusMap[status] ?? 0;

    return steps.map((step, i) => ({
        ...step,
        status: i < activeIndex ? "completed" : i === activeIndex ? "active" : "upcoming",
        time: i <= activeIndex ? ["Just now", "5 min ago", "3 min ago", "2 min ago", "Now"][i] : undefined,
    }));
};

const MissionTimeline = ({ missionStatus }: MissionTimelineProps) => {
    const steps = getSteps(missionStatus);

    return (
        <div className="bg-card rounded-lg border border-border p-4 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Mission Progress</h3>
            <div className="space-y-0">
                {steps.map((step, i) => (
                    <div key={step.label} className="flex items-start gap-3">
                        {/* Dot + Line */}
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.status === "completed"
                                        ? "bg-success"
                                        : step.status === "active"
                                            ? "bg-primary shadow-glow"
                                            : "bg-muted"
                                    }`}
                            >
                                {step.status === "completed" ? (
                                    <Check size={12} className="text-white" />
                                ) : step.status === "active" ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full bg-white"
                                    />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                )}
                            </motion.div>
                            {i < steps.length - 1 && (
                                <div
                                    className={`w-0.5 h-8 ${step.status === "completed" ? "bg-success" : "bg-muted"
                                        }`}
                                />
                            )}
                        </div>

                        {/* Label */}
                        <div className="pt-0.5">
                            <p
                                className={`text-sm font-medium ${step.status === "upcoming"
                                        ? "text-muted-foreground/50"
                                        : step.status === "active"
                                            ? "text-primary font-semibold"
                                            : "text-foreground"
                                    }`}
                            >
                                {step.label}
                            </p>
                            {step.time && (
                                <p className="text-[10px] text-muted-foreground">{step.time}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MissionTimeline;
