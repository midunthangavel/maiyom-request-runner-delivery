import { motion } from "framer-motion";

interface EmptyStateProps {
    emoji: string;
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState = ({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4"
        >
            <span className="text-4xl">{emoji}</span>
        </motion.div>
        <h3 className="text-base font-display font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-[240px]">{subtitle}</p>
        {actionLabel && onAction && (
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onAction}
                className="mt-4 px-5 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow"
            >
                {actionLabel}
            </motion.button>
        )}
    </motion.div>
);

export default EmptyState;
