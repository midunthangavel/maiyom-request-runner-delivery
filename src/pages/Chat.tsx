import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Phone, Paperclip, Image as ImageIcon, FileText, Download, X, Mic } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  type?: 'text' | 'image' | 'file' | 'audio';
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
  timestamp: string;
  isMe: boolean;
}

const Chat = () => {
  const navigate = useNavigate();
  const { id: missionId } = useParams<{ id: string }>();
  const { userProfile } = useApp();
  const { conversations } = useNotifications();

  const isSupport = missionId?.startsWith("support_");
  const actualMissionId = isSupport ? missionId?.replace("support_", "") : missionId;

  const conversation = conversations.find(c => c.id === actualMissionId);
  const isGroup = !isSupport && conversation?.isGroup;

  const participantName = isSupport ? "Maiyom Safety Team" : (conversation?.participantName || "Runner/Requester");
  const participantAvatar = isSupport ? "https://api.dicebear.com/7.x/shapes/svg?seed=support" : (conversation?.participantAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + actualMissionId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages and subscribe
  useEffect(() => {
    if (!missionId || !userProfile) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("mission_id", actualMissionId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data.map((m) => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: isGroup && m.sender_id !== userProfile.id ? "Member " + m.sender_id.slice(0, 4) : undefined,
          text: m.text,
          type: m.type || 'text',
          fileUrl: m.file_url,
          fileName: m.file_url, // Or file_name if you added it to DB
          audioUrl: m.audio_url,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: m.sender_id === userProfile.id
        })));
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${actualMissionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `mission_id=eq.${actualMissionId}`,
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
              senderName: isGroup && !isMe ? "Member " + newMsg.sender_id.slice(0, 4) : undefined,
              text: newMsg.text,
              type: newMsg.type || 'text',
              fileUrl: newMsg.file_url,
              fileName: newMsg.file_name,
              audioUrl: newMsg.audio_url,
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
      if (isSupport && messages.length === 0) {
        // If first message in support, we already changed status. Usually admins will see it.
      }

      await supabase.from("messages").insert({
        mission_id: actualMissionId,
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
          <p className="text-[10px] text-success">{isSupport ? "Average response: 2m" : isGroup ? `${conversation?.members?.length} members` : "Online"}</p>
        </div>
        {!isGroup && !isSupport && (
          <a href="tel:+919876543210" className="p-2 rounded-full bg-card border border-border">
            <Phone size={16} className="text-muted-foreground" />
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
        {/* Inject Mock Group intro message if empty */}
        {messages.length === 0 && (isGroup || isSupport) && (
          <div className="text-center text-xs text-muted-foreground my-4">
            {isSupport ? "You are now connected with a Maiyom Safety Executive. How can we help you?" : `Welcome to the ${participantName} community!`}
          </div>
        )}

        {messages.map((msg, index) => {
          const showSenderName = isGroup && !msg.isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
            >
              {showSenderName && (
                <span className="text-[10px] text-muted-foreground ml-1 mb-1 font-medium">
                  {msg.senderName || "Unknown"}
                </span>
              )}
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.isMe
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
              >
                {msg.type === 'image' && msg.fileUrl && (
                  <img src={msg.fileUrl} alt="Attachment" className="w-full rounded-lg mb-2 object-cover max-h-48" />
                )}
                {msg.type === 'file' && (
                  <div className="flex items-center gap-2 bg-background/20 p-2 rounded-lg mb-2 border border-border/10">
                    <FileText size={20} className={msg.isMe ? "text-primary-foreground" : "text-primary"} />
                    <span className="flex-1 truncate text-xs font-medium">{msg.fileName || "Document.pdf"}</span>
                    <Download size={16} className={msg.isMe ? "text-primary-foreground" : "text-primary cursor-pointer"} />
                  </div>
                )}
                {msg.type === 'audio' && (
                  <div className="flex items-center gap-2 bg-background/20 p-2 rounded-full mb-1 border border-border/10 w-44">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.isMe ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <div className="flex-1 flex items-center gap-0.5 opacity-70">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`w-1 rounded-full ${msg.isMe ? "bg-primary-foreground" : "bg-primary"}`} style={{ height: `${Math.random() * 12 + 4}px` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium pr-1">{msg.isMe ? "0:04" : "0:12"}</span>
                  </div>
                )}
                {msg.text && <p>{msg.text}</p>}
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
      <div className="relative sticky bottom-0 bg-card border-t border-border px-4 py-3 safe-bottom">
        <AnimatePresence>
          {attachmentMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 left-4 bg-popover border border-border rounded-xl shadow-lg p-2 flex gap-2 z-20"
            >
              <button
                onClick={() => {
                  setAttachmentMenuOpen(false);
                  supabase.from("messages").insert({ mission_id: actualMissionId, sender_id: userProfile?.id, text: "", type: "image", file_url: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=400" });
                }}
                className="flex flex-col items-center gap-1 p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <span className="text-[10px] font-medium text-foreground">Photo</span>
              </button>
              <button
                onClick={() => {
                  setAttachmentMenuOpen(false);
                  supabase.from("messages").insert({ mission_id: actualMissionId, sender_id: userProfile?.id, text: "", type: "file", file_name: "Delivery_Instructions.pdf" });
                }}
                className="flex flex-col items-center gap-1 p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <span className="text-[10px] font-medium text-foreground">File</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
            className={`p-2 rounded-full transition-colors ${attachmentMenuOpen ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
          >
            {attachmentMenuOpen ? <X size={20} /> : <Paperclip size={20} />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isRecording ? "Recording..." : "Type a message..."}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 font-body transition-colors ${isRecording ? 'bg-destructive/10 text-destructive placeholder:text-destructive' : 'bg-muted'}`}
            disabled={isRecording}
          />
          {input.trim() === "" ? (
            <button
              onPointerDown={() => setIsRecording(true)}
              onPointerUp={() => {
                setIsRecording(false);
                if (userProfile?.id && actualMissionId) {
                  supabase.from("messages").insert({ mission_id: actualMissionId, sender_id: userProfile.id, text: "", type: "audio", audio_url: "dummy.mp3" });
                }
              }}
              className={`p-2.5 rounded-full shadow-glow shrink-0 transition-all ${isRecording ? "bg-destructive text-destructive-foreground scale-110" : "bg-card border border-primary text-primary"}`}
            >
              <Mic size={16} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              className="p-2.5 bg-gradient-primary rounded-full text-primary-foreground shadow-glow shrink-0 transition-all"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
