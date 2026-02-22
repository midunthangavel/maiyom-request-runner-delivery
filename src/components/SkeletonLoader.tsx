import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-shimmer-fast bg-muted rounded-md ${className}`}
                />
            ))}
        </>
    );
};

export const CardSkeleton = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl border border-border overflow-hidden shadow-sm"
    >
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <Skeleton className="h-8 w-1/3 rounded-lg" />
            </div>
        </div>
    </motion.div>
);
