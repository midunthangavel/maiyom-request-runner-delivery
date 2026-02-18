import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors"
            aria-label="Toggle theme"
        >
            <motion.div
                key={isDark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
            >
                {isDark ? (
                    <Moon size={18} className="text-foreground" />
                ) : (
                    <Sun size={18} className="text-foreground" />
                )}
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
