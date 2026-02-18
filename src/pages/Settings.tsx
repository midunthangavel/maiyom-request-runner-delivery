import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useApp } from "@/contexts/AppContext";
import { useLanguage, localeNames, Locale } from "@/contexts/LanguageContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Bell, Globe, Lock, HelpCircle, Info,
    Moon, Sun, ChevronRight, Trash2, Check, X
} from "lucide-react";

const Settings = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { setAuthenticated } = useApp();
    const { locale, setLocale, t } = useLanguage();
    const isDark = theme === "dark";
    const [showLangPicker, setShowLangPicker] = useState(false);

    const sections = [
        {
            title: t("settings.preferences"),
            items: [
                {
                    icon: isDark ? Sun : Moon,
                    label: t("settings.darkMode"),
                    iconColor: isDark ? "text-warning" : "text-muted-foreground",
                    toggle: true,
                    toggled: isDark,
                    onToggle: () => setTheme(isDark ? "light" : "dark"),
                },
                { icon: Bell, label: t("settings.notifications"), iconColor: "text-primary", action: true },
                {
                    icon: Globe,
                    label: t("settings.language"),
                    iconColor: "text-blue-500",
                    subtitle: localeNames[locale],
                    action: true,
                    onToggle: () => setShowLangPicker(true),
                },
            ],
        },
        {
            title: t("settings.account"),
            items: [
                { icon: Lock, label: t("settings.privacy"), iconColor: "text-emerald-500", action: true },
            ],
        },
        {
            title: t("settings.support"),
            items: [
                { icon: HelpCircle, label: t("settings.helpCenter"), iconColor: "text-violet-500", action: true },
                { icon: Info, label: t("settings.about"), iconColor: "text-muted-foreground", subtitle: "v1.0.0", action: true },
            ],
        },
    ];

    return (
        <div className="min-h-screen max-w-lg mx-auto bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1">
                    <ArrowLeft size={20} className="text-foreground" />
                </button>
                <h1 className="font-display font-semibold text-foreground">{t("settings.title")}</h1>
            </div>

            <div className="px-5 py-5 space-y-6">
                {sections.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            {section.title}
                        </h3>
                        <div className="bg-card rounded-lg border border-border overflow-hidden divide-y divide-border">
                            {section.items.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onToggle}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
                                >
                                    <item.icon size={18} className={item.iconColor} />
                                    <span className="flex-1 text-sm text-foreground text-left">{item.label}</span>
                                    {item.subtitle && (
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    )}
                                    {item.toggle && (
                                        <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${item.toggled ? "bg-primary" : "bg-muted"}`}>
                                            <div className={`w-5 h-5 bg-card rounded-full shadow transition-transform ${item.toggled ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                    )}
                                    {item.action && !item.toggle && (
                                        <ChevronRight size={16} className="text-muted-foreground" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Danger zone */}
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        {t("settings.dangerZone")}
                    </h3>
                    <div className="bg-card rounded-lg border border-destructive/20 overflow-hidden">
                        <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-destructive/5 transition-colors">
                            <Trash2 size={18} className="text-destructive" />
                            <span className="text-sm text-destructive text-left">{t("settings.deleteAccount")}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Language Picker Modal */}
            <AnimatePresence>
                {showLangPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/40" onClick={() => setShowLangPicker(false)} />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="relative bg-card rounded-2xl border border-border w-full max-w-sm shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                <h3 className="font-display font-semibold text-foreground">{t("settings.language")}</h3>
                                <button onClick={() => setShowLangPicker(false)} className="p-1">
                                    <X size={18} className="text-muted-foreground" />
                                </button>
                            </div>
                            <div className="p-2">
                                {(["en", "ta", "hi"] as Locale[]).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => { setLocale(lang); setShowLangPicker(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-colors ${locale === lang ? "bg-primary/10" : "hover:bg-muted/50"
                                            }`}
                                    >
                                        <span className={`text-sm font-medium ${locale === lang ? "text-primary" : "text-foreground"}`}>
                                            {localeNames[lang]}
                                        </span>
                                        {locale === lang && <Check size={18} className="text-primary" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
