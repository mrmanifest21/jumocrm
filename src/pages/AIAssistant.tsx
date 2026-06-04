import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Sparkles,
  Send,
  User,
  Loader2,
  Zap,
  BarChart3,
  Users,
  CheckSquare,
  FolderKanban,
  Trash2,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const suggestedPrompts = [
  { icon: BarChart3, text: "What's my pipeline value?" },
  { icon: Users, text: "Show me my top contacts" },
  { icon: CheckSquare, text: "What tasks are due soon?" },
  { icon: FolderKanban, text: "Summarize my projects" },
];

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string; timestamp?: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.ai.getConversations.useQuery();

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, timestamp: new Date().toISOString() },
      ]);
      refetchConversations();
    },
  });

  const deleteConversation = trpc.ai.deleteConversation.useMutation({
    onSuccess: () => {
      refetchConversations();
      if (conversationId) {
        setConversationId(undefined);
        setChatHistory([]);
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim() || chatMutation.isPending) return;
    const userMsg = message.trim();
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: userMsg, timestamp: new Date().toISOString() },
    ]);
    setMessage("");
    chatMutation.mutate({ message: userMsg, conversationId });
  };

  const loadConversation = (conv: any) => {
    setConversationId(conv.id);
    setChatHistory(conv.messages ?? []);
  };

  const startNewChat = () => {
    setConversationId(undefined);
    setChatHistory([]);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Sidebar - Conversation History */}
      <div className="hidden lg:flex flex-col w-64 bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations?.map((conv) => (
            <div
              key={conv.id}
              onClick={() => loadConversation(conv)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group ${
                conversationId === conv.id ? "bg-[#00E676]/10" : "hover:bg-[#1A1A1A]"
              }`}
            >
              <Sparkles size={14} className={conversationId === conv.id ? "text-[#00E676]" : "text-[#616161]"} />
              <span className={`text-xs truncate flex-1 ${conversationId === conv.id ? "text-[#00E676]" : "text-[#9E9E9E]"}`}>
                {conv.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation.mutate({ id: conv.id });
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#616161] hover:text-[#EF5350] transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {(!conversations || conversations.length === 0) && (
            <p className="text-xs text-[#616161] text-center py-4">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-[#00E676]/10 flex items-center justify-center">
            <Sparkles size={16} className="text-[#00E676]" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">OmegaAI</h2>
            <p className="text-[10px] text-[#616161]">Your intelligent CRM assistant</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#00E676]/10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-[10px] text-[#00E676]">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 flex items-center justify-center mb-4">
                <Zap size={28} className="text-[#00E676]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">How can I help you today?</h3>
              <p className="text-sm text-[#616161] mb-6 text-center max-w-sm">
                Ask me anything about your CRM data — pipeline, contacts, tasks, revenue, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => {
                      setMessage(prompt.text);
                    }}
                    className="flex items-center gap-2 p-3 bg-[#0C0C0C] border border-white/[0.06] rounded-xl hover:border-[#00E676]/30 transition-all text-left"
                  >
                    <prompt.icon size={16} className="text-[#00E676] shrink-0" />
                    <span className="text-xs text-[#9E9E9E]">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-[#00E676]/10 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles size={14} className="text-[#00E676]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-[#00E676] text-black rounded-br-md"
                        : "bg-[#0C0C0C] border border-white/[0.06] text-[#E0E0E0] rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] flex items-center justify-center shrink-0 mt-1">
                      <User size={14} className="text-[#9E9E9E]" />
                    </div>
                  )}
                </motion.div>
              ))}
              {chatMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#00E676]/10 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-[#00E676]" />
                  </div>
                  <div className="bg-[#0C0C0C] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 size={16} className="text-[#00E676] animate-spin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask OmegaAI about your CRM data..."
              className="flex-1 h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || chatMutation.isPending}
              className="w-11 h-11 bg-[#00E676] text-black rounded-xl flex items-center justify-center hover:bg-[#69F0AE] transition-colors disabled:opacity-30 disabled:hover:bg-[#00E676]"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
