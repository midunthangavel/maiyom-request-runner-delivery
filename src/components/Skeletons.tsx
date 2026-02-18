import { motion } from "framer-motion";

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => (
    <div className={`rounded animate-shimmer ${className}`} />
);

export const MissionCardSkeleton = () => (
    <div className="bg-card rounded-lg border border-border p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-14 h-5 rounded-full" />
            </div>
            <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
        <div className="flex items-center gap-3 pt-1">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-20 h-3" />
        </div>
        <div className="flex items-center justify-between pt-1">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-16 h-5 rounded-full" />
        </div>
    </div>
);

export const ChatListSkeleton = () => (
    <div className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-12 h-3" />
                    </div>
                    <Skeleton className="w-3/4 h-3" />
                </div>
            </div>
        ))}
    </div>
);

export const ProfileSkeleton = () => (
    <div className="px-5 pt-6 space-y-5">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3" />
            <Skeleton className="w-32 h-5 mx-auto mb-2" />
            <Skeleton className="w-24 h-3 mx-auto" />
        </div>
        <Skeleton className="w-full h-20 rounded-lg" />
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-12 rounded-lg" />
            ))}
        </div>
    </div>
);

export const FeedSkeleton = () => (
    <div className="space-y-3">
        {[1, 2, 3].map((i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
            >
                <MissionCardSkeleton />
            </motion.div>
        ))}
    </div>
);
