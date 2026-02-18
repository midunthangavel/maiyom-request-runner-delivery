import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import {
    AppNotification,
    Conversation,
    mockNotifications,
    mockConversations,
} from "@/lib/mockData";

interface NotificationState {
    notifications: AppNotification[];
    conversations: Conversation[];
    unreadAlerts: number;
    unreadMessages: number;
    totalUnread: number;
    markAlertRead: (id: string) => void;
    markAllAlertsRead: () => void;
    markConversationRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationState | null>(null);

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
    return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);

    const unreadAlerts = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    const unreadMessages = useMemo(
        () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
        [conversations]
    );

    const totalUnread = unreadAlerts + unreadMessages;

    const markAlertRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAlertsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markConversationRead = (id: string) => {
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
