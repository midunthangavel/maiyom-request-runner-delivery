import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { AppNotification, Conversation } from "@/types"; // We will add Conversation to types.ts first if not present


interface NotificationState {
    notifications: AppNotification[];
    conversations: Conversation[]; // Derived from active missions/offers
    unreadAlerts: number;
    unreadMessages: number; // For now, just a sum of dummy unreads or real logic
    totalUnread: number;
    markAlertRead: (id: string) => Promise<void>;
    markAllAlertsRead: () => Promise<void>;
    markConversationRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationState | null>(null);

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
    return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { userProfile } = useApp();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        if (!userProfile?.id) {
            setNotifications([]);
            setConversations([]);
            return;
        }

        // 1. Fetch Notifications
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", userProfile.id)
                .order("created_at", { ascending: false });

            if (data) {
                setNotifications(data.map(n => ({
                    ...n,
                    createdAt: n.created_at, // Map snake_case to camelCase
                    userId: n.user_id,
                    actionUrl: n.action_url
                })) as unknown as AppNotification[]);
            }
        };

        fetchNotifications();

        // 2. Fetch Conversations (Active Missions where user is involved)
        const fetchConversations = async () => {
            // A. Missions I requested
            const { data: myMissions } = await supabase
                .from('missions')
                .select(`
                    id, title, status, requester_id,
                    offers!inner(runner_id, status)
                `)
                .eq('requester_id', userProfile.id)
                .eq('offers.status', 'accepted');

            // B. Missions I am running
            const { data: myJobs } = await supabase
                .from('offers')
                .select(`
                    mission_id,
                    missions (id, title, requester_id, status)
                `)
                .eq('runner_id', userProfile.id)
                .eq('status', 'accepted');

            // Collect all participant IDs we need to resolve
            const participantIds = new Set<string>();

            if (myMissions) {
                for (const m of myMissions) {
                    const acceptedOffer = Array.isArray(m.offers) ? m.offers[0] : m.offers;
                    if (acceptedOffer?.runner_id) participantIds.add(acceptedOffer.runner_id);
                }
            }
            if (myJobs) {
                for (const job of myJobs) {
                    const m = job.missions;
                    // @ts-ignore
                    if (m?.requester_id) participantIds.add(m.requester_id);
                }
            }

            // Batch-fetch profile names
            let profilesMap: Record<string, { name: string; avatar_url?: string }> = {};
            if (participantIds.size > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, name, avatar_url')
                    .in('id', Array.from(participantIds));
                if (profiles) {
                    for (const p of profiles) {
                        profilesMap[p.id] = { name: p.name, avatar_url: p.avatar_url };
                    }
                }
            }

            const conversationsList: Conversation[] = [];

            // Process My Missions (I am Requester)
            if (myMissions) {
                for (const m of myMissions) {
                    const acceptedOffer = Array.isArray(m.offers) ? m.offers[0] : m.offers;
                    if (acceptedOffer) {
                        const profile = profilesMap[acceptedOffer.runner_id];
                        conversationsList.push({
                            id: m.id,
                            participantName: profile?.name || "Runner",
                            participantAvatar: profile?.avatar_url,
                            lastMessage: "Mission in progress...",
                            time: "Now",
                            unreadCount: 0,
                            missionTitle: m.title,
                            status: m.status as any
                        });
                    }
                    if (m.status === "disputed") {
                        conversationsList.push({
                            id: "support_" + m.id,
                            participantName: "Maiyom Safety Team",
                            participantAvatar: "https://api.dicebear.com/7.x/shapes/svg?seed=support",
                            lastMessage: `Support ticket for: ${m.title}`,
                            time: "Now",
                            unreadCount: 1,
                            missionTitle: m.title,
                            status: "active" as any
                        });
                    }
                }
            }

            // Process My Jobs (I am Runner)
            if (myJobs) {
                for (const job of myJobs) {
                    const m = job.missions as any;
                    if (m) {
                        // @ts-ignore
                        const profile = profilesMap[m.requester_id];
                        conversationsList.push({
                            id: m.id, // @ts-ignore
                            participantName: profile?.name || "Requester",
                            participantAvatar: profile?.avatar_url,
                            lastMessage: "You are the runner",
                            time: "Now",
                            unreadCount: 0, // @ts-ignore
                            missionTitle: m.title, // @ts-ignore
                            status: m.status as any
                        });

                        if (m.status === "disputed") {
                            conversationsList.push({
                                id: "support_" + m.id,
                                participantName: "Maiyom Safety Team",
                                participantAvatar: "https://api.dicebear.com/7.x/shapes/svg?seed=support",
                                lastMessage: `Support ticket for: ${m.title}`,
                                time: "Now",
                                unreadCount: 1,
                                missionTitle: m.title,
                                status: "active" as any
                            });
                        }
                    }
                }
            }

            // Inject Mock Community Groups
            conversationsList.push({
                id: "group_chennai_runners",
                participantName: "Chennai Runners Club",
                participantAvatar: "https://api.dicebear.com/7.x/shapes/svg?seed=chennai",
                lastMessage: "Rajesh: Traffic alert near OMR! Avoid the toll plaza.",
                time: "10:30 AM",
                unreadCount: 3,
                status: "group",
                isGroup: true,
                groupName: "Chennai Runners Club",
                members: ["user1", "user2", "user3"]
            });

            conversationsList.push({
                id: "group_urgent_help",
                participantName: "Urgent Delivery Help",
                participantAvatar: "https://api.dicebear.com/7.x/shapes/svg?seed=urgent",
                lastMessage: "Sara: Can someone take over my pickup? Have a flat tire.",
                time: "Yesterday",
                unreadCount: 0,
                status: "group",
                isGroup: true,
                groupName: "Urgent Delivery Help",
                members: ["user1", "user4"]
            });

            // Remove duplicates if any
            const unique = conversationsList.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);
            setConversations(unique);
        };
        fetchConversations();

        // 3. Subscription for Notifications
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userProfile.id}`,
                },
                (payload) => {
                    const newNotif = payload.new as any;
                    setNotifications((prev) => [{
                        ...newNotif,
                        createdAt: newNotif.created_at,
                        userId: newNotif.user_id,
                        actionUrl: newNotif.action_url
                    } as unknown as AppNotification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [userProfile?.id]);

    const unreadAlerts = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    const unreadMessages = 0; // consistent with simplified chat for now

    const totalUnread = unreadAlerts + unreadMessages;

    const markAlertRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

        // DB update
        await supabase.from("notifications").update({ read: true }).eq("id", id);
    };

    const markAllAlertsRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        if (userProfile?.id) {
            await supabase.from("notifications").update({ read: true }).eq("user_id", userProfile.id);
        }
    };

    const markConversationRead = (id: string) => {
        // Just local state for now, logic would depend on a 'last_read_at' in a real chat system
        setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        );
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                conversations,
                unreadAlerts,
                unreadMessages,
                totalUnread,
                markAlertRead,
                markAllAlertsRead,
                markConversationRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
