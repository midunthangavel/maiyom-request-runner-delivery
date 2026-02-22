import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { motion } from "framer-motion";
import { ArrowLeft, Search, MessageSquare, Edit, Users } from "lucide-react";
import { useState } from "react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";

const ChatList = () => {
    const navigate = useNavigate();
    const { conversations, markConversationRead } = useNotifications();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"Direct" | "Community">("Direct");

    const filtered = conversations.filter((c) => {
        const matchesSearch = !search ||
            c.participantName.toLowerCase().includes(search.toLowerCase()) ||
            c.missionTitle?.toLowerCase().includes(search.toLowerCase());

        const matchesTab = activeTab === "Direct" ? !c.isGroup : c.isGroup;

        return matchesSearch && matchesTab;
    });

    const handleConversationTap = (id: string) => {
        markConversationRead(id);
        navigate(`/chat/${id}`);
    };

    return (
        <PageShell>
            <div className="px-5 pt-6 pb-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-display font-bold text-foreground">Messages</h1>
                    <button className="p-2 rounded-full bg-card border border-border">
                        <Edit size={18} className="text-foreground" />
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 mb-4">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search conversations..."
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 font-body"
                    />
                </div>

                {/* Tabs */}
                <div className="flex bg-muted p-1 rounded-xl mb-2 relative">
                    <motion.div
                        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-card rounded-lg shadow-sm"
                        animate={{ left: activeTab === "Direct" ? 4 : "50%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    <button
                        onClick={() => setActiveTab("Direct")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${activeTab === "Direct" ? "text-foreground" : "text-muted-foreground"}`}
                    >
                        <MessageSquare size={16} /> Direct
                    </button>
                    <button
                        onClick={() => setActiveTab("Community")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${activeTab === "Community" ? "text-foreground" : "text-muted-foreground"}`}
                    >
                        <Users size={16} /> Community
                    </button>
                </div>
            </div>

            {/* Conversations List */}
            <div className="px-5">
                {filtered.length === 0 ? (
                    <EmptyState
                        emoji="💬"
                        title={search ? "No conversations found" : "No messages yet"}
                        subtitle={search ? "Try a different search term" : "Start a conversation from a mission detail page"}
                    />
                ) : (
                    <div className="space-y-1">
                        {filtered.map((conv) => (
                            <motion.button
                                key={conv.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleConversationTap(conv.id)}
                                className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all"
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={conv.participantAvatar}
                                        alt={conv.participantName}
                                        className="w-14 h-14 rounded-full bg-muted"
                                    />
                                    {conv.unreadCount > 0 && (
                                        <div className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1 border-2 border-background">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-sm ${conv.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"} truncate`}>
                                            {conv.participantName}
                                        </p>
                                        <span className={`text-[11px] flex-shrink-0 ${conv.unreadCount > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                                            {conv.time}
                                        </span>
                                    </div>
                                    {conv.missionTitle && !conv.isGroup && (
                                        <p className="text-[10px] text-primary/80 font-medium mt-0.5 truncate">📦 {conv.missionTitle}</p>
                                    )}
                                    {conv.isGroup && (
                                        <p className="text-[10px] text-primary/80 font-medium mt-0.5 truncate">👥 {conv.members?.length || 0} members</p>
                                    )}
                                    <p className={`text-xs mt-0.5 line-clamp-1 ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    );
};

export default ChatList;
