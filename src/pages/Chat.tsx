import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Phone } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

const Chat = () => {
  const navigate = useNavigate();
  const { id: missionId } = useParams<{ id: string }>(); // Assuming Update route to use missionId
  const { userProfile } = useApp();
  // const { conversations } = useNotifications();

  // In a real app, we'd fetch the mission/runner details here if we don't have them in context
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const participantName = "Runner/Requester"; // To be fetched dynamically
  const participantAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + missionId;

  // Fetch initial messages and subscribe
  useEffect(() => {
    if (!missionId || !userProfile) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data.map((m) => ({
          id: m.id,
          senderId: m.sender_id,
          text: m.text,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: m.sender_id === userProfile.id
        })));
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${missionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `mission_id=eq.${missionId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          const isMe = newMsg.sender_id === userProfile.id;
          // Only add if not already added (optimistic update might duplicate)
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              senderId: newMsg.sender_id,
              text: newMsg.text,
              timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe
            }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [missionId, userProfile]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !userProfile || !missionId) return;

    const text = input.trim();
    setInput(""); // Clear input immediately

    // Optimistic Update
    // const optimisticId = "opt-" + Date.now();
    // setMessages(prev => [...prev, {
    //     id: optimisticId,
    //     senderId: userProfile.id,
    //     text: text,
    //     timestamp: "Sending...",
    //     isMe: true
    // }]);

    try {
      await supabase.from("messages").insert({
        mission_id: missionId,
        sender_id: userProfile.id,
        text: text
      });
      // The subscription will handle the UI update
    } catch (error) {
      console.error("Failed to send message", error);
      // Remove optimistic message if failed
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <img
          src={participantAvatar}
          alt={participantName}
          className="w-9 h-9 rounded-full bg-muted"
        />
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">{participantName}</p>
          <p className="text-[10px] text-success">Online</p>
        </div>
        <button className="p-2 rounded-full bg-card border border-border">
          <Phone size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.isMe
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card border-t border-border px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 font-body"
          />
          <button
            onClick={handleSend}
            className="p-2.5 bg-gradient-primary rounded-full text-primary-foreground shadow-glow"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
