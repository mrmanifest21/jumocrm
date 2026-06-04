import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Inbox, Send, Mail, Trash2, Plus, X, Search, ArrowLeft, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Messages() {
  const { user } = useAuth();
  const userId = user?.id || 0;
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [compose, setCompose] = useState({ subject: "", body: "", recipientId: "2" });

  const { data, refetch, isLoading } = trpc.message.list.useQuery(
    { recipientId: userId, folder },
    { enabled: userId > 0, refetchInterval: 10000 }
  );

  const markRead = trpc.message.markRead.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => setError(err.message),
  });

  const deleteMsg = trpc.message.delete.useMutation({
    onSuccess: () => { refetch(); setSelectedMessage(null); },
    onError: (err) => setError(err.message),
  });

  const sendMsg = trpc.message.send.useMutation({
    onSuccess: () => {
      setShowCompose(false);
      setCompose({ subject: "", body: "", recipientId: "2" });
      setError("");
      refetch();
    },
    onError: (err) => setError("Send failed: " + err.message),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!compose.subject.trim() || !compose.body.trim()) {
      setError("Subject and body are required");
      return;
    }
    if (userId === 0) {
      setError("You must be logged in to send messages");
      return;
    }
    sendMsg.mutate({
      senderId: userId,
      senderName: user?.name || "Admin",
      recipientId: Number(compose.recipientId),
      subject: compose.subject,
      body: compose.body,
    });
  };

  const selected = data?.messages.find((m) => m.id === selectedMessage);
  const filteredMessages = data?.messages.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return m.subject.toLowerCase().includes(s) || m.senderName.toLowerCase().includes(s) || m.body.toLowerCase().includes(s);
  }) ?? [];

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="space-y-4 h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Messages</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-[#00E676]/20 text-[#00E676] rounded-full text-xs font-medium">{unreadCount} new</span>
          )}
        </div>
        <button onClick={() => { setShowCompose(true); setError(""); }}
          className="flex items-center gap-2 px-4 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors">
          <Plus size={16} /> Compose
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400 flex items-center gap-2">
          <X size={14} /> {error}
        </div>
      )}

      {userId === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-400">
          You must be logged in to view and send messages. Please log in first.
        </div>
      )}

      <div className="flex gap-4 h-full">
        {/* Message List */}
        <div className={`bg-[#141414] border border-white/[0.06] rounded-2xl flex flex-col ${selectedMessage ? "hidden lg:flex w-[380px]" : "flex-1 w-full"}`}>
          <div className="p-4 border-b border-white/[0.06] space-y-3">
            <div className="flex gap-2">
              <button onClick={() => setFolder("inbox")}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-colors ${folder === "inbox" ? "bg-[#00E676] text-black" : "bg-[#1A1A1A] text-[#9E9E9E] hover:text-white"}`}>
                <Inbox size={13} /> Inbox
              </button>
              <button onClick={() => setFolder("sent")}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-colors ${folder === "sent" ? "bg-[#00E676] text-black" : "bg-[#1A1A1A] text-[#9E9E9E] hover:text-white"}`}>
                <Send size={13} /> Sent
              </button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
              <input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-[#0C0C0C] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Mail size={32} className="text-[#616161] mb-2" />
                <p className="text-sm text-[#616161]">No messages in {folder}</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <button key={msg.id} onClick={() => { setSelectedMessage(msg.id); if (!msg.isRead && folder === "inbox") markRead.mutate({ id: msg.id }); }}
                  className={`w-full text-left p-4 border-b border-white/[0.04] hover:bg-[#1A1A1A] transition-colors ${selectedMessage === msg.id ? "bg-[#1A1A1A]" : ""} ${!msg.isRead && folder === "inbox" ? "border-l-[3px] border-l-[#00E676]" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00E676]/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-[#00E676]">{msg.senderName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!msg.isRead && folder === "inbox" ? "font-medium text-white" : "text-[#9E9E9E]"}`}>{msg.subject}</p>
                        {!msg.isRead && folder === "inbox" && <div className="w-2 h-2 rounded-full bg-[#00E676] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#616161] truncate mt-0.5">{msg.body.replace(/\n/g, " ").substring(0, 60)}...</p>
                      <p className="text-[10px] text-[#616161] mt-1">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("en-ZA") : ""}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <AnimatePresence>
          {selectedMessage && selected && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex-1 bg-[#141414] border border-white/[0.06] rounded-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <button onClick={() => setSelectedMessage(null)} className="lg:hidden flex items-center gap-1 text-[#616161] hover:text-white text-sm">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={() => deleteMsg.mutate({ id: selected.id })} className="p-2 text-[#616161] hover:text-[#EF5350] transition-colors ml-auto">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00E676]/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-[#00E676]">{selected.senderName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{selected.senderName}</p>
                    <p className="text-xs text-[#616161]">{selected.createdAt ? new Date(selected.createdAt).toLocaleString("en-ZA") : ""}</p>
                  </div>
                </div>
                <h2 className="text-lg font-medium text-white mb-4">{selected.subject}</h2>
                <div className="bg-[#0C0C0C] rounded-xl p-4">
                  <p className="text-sm text-[#9E9E9E] whitespace-pre-line">{selected.body}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><MessageCircle size={18} className="text-[#00E676]" /> New Message</h2>
                <button onClick={() => { setShowCompose(false); setError(""); }} className="text-[#616161] hover:text-white"><X size={20} /></button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400 mb-4">{error}</div>
              )}

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="text-xs text-[#616161] mb-1.5 block">To</label>
                  <select value={compose.recipientId} onChange={(e) => setCompose({ ...compose, recipientId: e.target.value })}
                    className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40">
                    <option value="2">Temosho (admin2)</option>
                    <option value="1">Daniel Menji (admin1)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#616161] mb-1.5 block">Subject</label>
                  <input placeholder="Subject" value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })}
                    className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40" required />
                </div>
                <div>
                  <label className="text-xs text-[#616161] mb-1.5 block">Message</label>
                  <textarea placeholder="Write your message..." value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })}
                    className="w-full h-32 px-4 py-3 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40 resize-none" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCompose(false); setError(""); }}
                    className="flex-1 h-11 border border-white/[0.12] text-[#9E9E9E] rounded-xl text-sm font-medium hover:bg-[#1A1A1A] transition-colors">Cancel</button>
                  <button type="submit" disabled={sendMsg.isPending}
                    className="flex-1 h-11 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <Send size={14} /> {sendMsg.isPending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
