import PageShell from "@/components/PageShell";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Clock, Target, Award, ChevronRight } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

const weeklyEarnings = [
    { day: "Mon", amount: 320 },
    { day: "Tue", amount: 450 },
    { day: "Wed", amount: 280 },
    { day: "Thu", amount: 520 },
    { day: "Fri", amount: 690 },
    { day: "Sat", amount: 410 },
    { day: "Sun", amount: 350 },
];

const missionTrends = [
    { week: "W1", missions: 8 },
    { week: "W2", missions: 12 },
    { week: "W3", missions: 10 },
    { week: "W4", missions: 15 },
    { week: "W5", missions: 18 },
    { week: "W6", missions: 14 },
    { week: "W7", missions: 21 },
    { week: "W8", missions: 19 },
];

const categoryBreakdown = [
    { name: "Medicine", value: 35, color: "hsl(142, 71%, 45%)" },
    { name: "Food", value: 28, color: "hsl(28, 95%, 52%)" },
    { name: "Documents", value: 20, color: "hsl(217, 91%, 60%)" },
    { name: "Electronics", value: 12, color: "hsl(271, 91%, 65%)" },
    { name: "Others", value: 5, color: "hsl(0, 0%, 60%)" },
];

const performanceStats = [
    { label: "Completion Rate", value: "96%", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Avg Delivery Time", value: "32 min", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Missions", value: "127", icon: Award, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Growth", value: "+23%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">₹{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

const MissionTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{payload[0].value} missions</p>
            </div>
        );
    }
    return null;
};

const Analytics = () => {
    const navigate = useNavigate();
    const totalWeekly = weeklyEarnings.reduce((sum, d) => sum + d.amount, 0);

    return (
        <PageShell>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1">
                    <ArrowLeft size={20} className="text-foreground" />
                </button>
                <h1 className="font-display font-semibold text-foreground">Analytics</h1>
            </div>

            <div className="px-5 py-5 space-y-6">
                {/* Performance Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {performanceStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-card rounded-xl border border-border p-4 shadow-card"
                        >
                            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                                <stat.icon size={18} className={stat.color} />
                            </div>
                            <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Weekly Earnings Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-xl border border-border p-5 shadow-card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Weekly Earnings</h3>
                            <p className="text-xs text-muted-foreground">This week's breakdown</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-display font-bold text-foreground">₹{totalWeekly.toLocaleString()}</p>
                            <p className="text-[11px] text-emerald-500 font-medium">+12% vs last week</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={weeklyEarnings} barCategoryGap="25%">
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="hsl(28, 95%, 52%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Mission Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-xl border border-border p-5 shadow-card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Mission Trends</h3>
                            <p className="text-xs text-muted-foreground">Weekly completions</p>
                        </div>
                        <span className="text-[11px] text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                            ↑ Trending Up
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={missionTrends}>
                            <defs>
                                <linearGradient id="missionGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(28, 95%, 52%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(28, 95%, 52%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="week"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis hide />
                            <Tooltip content={<MissionTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="missions"
                                stroke="hsl(28, 95%, 52%)"
                                strokeWidth={2.5}
                                fill="url(#missionGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Category Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card rounded-xl border border-border p-5 shadow-card"
                >
                    <h3 className="text-sm font-semibold text-foreground mb-4">Earnings by Category</h3>
                    <div className="flex items-center gap-6">
                        <div className="w-32 h-32 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={32}
                                        outerRadius={56}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {categoryBreakdown.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2.5">
                            {categoryBreakdown.map((cat) => (
                                <div key={cat.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                    <span className="text-xs text-foreground flex-1">{cat.name}</span>
                                    <span className="text-xs font-semibold text-foreground">{cat.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageShell>
    );
};

export default Analytics;
