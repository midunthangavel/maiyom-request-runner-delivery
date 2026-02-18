import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Phone } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { mockChatMessages } from "@/lib/mockData";
import { motion } from "framer-motion";

const Chat = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { conversations } = useNotifications();

  // Find the conversation matching the URL param
  const conversation = conversations.find((c) => c.id === id);

  const [messages, setMessages] = useState(mockChatMessages);
  const [input, setInput] = useState("");

  const participantName = conversation?.participantName || "Chat";
  const participantAvatar =
    conversation?.participantAvatar ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  const missionTitle = conversation?.missionTitle;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `c${Date.now()}`, senderId: "u1", text: input, timestamp: "Now" },
    ]);
    setInput("");
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
          {missionTitle && (
            <p className="text-[10px] text-primary/80 font-medium truncate">📦 {missionTitle}</p>
          )}
          {!missionTitle && <p className="text-[10px] text-success">Online</p>}
        </div>
        <button className="p-2 rounded-full bg-card border border-border">
          <Phone size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isMe = msg.senderId === "u1";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMe
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
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
            className="p-2.5 bg-gradient-primary rounded-full text-primary-foreground"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
