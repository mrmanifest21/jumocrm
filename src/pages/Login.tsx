import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Sparkles, Eye, EyeOff, Copy, CheckCircle2, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

function getOAuthUrl() {
  const authUrl = new URL(
    import.meta.env.VITE_KIMI_AUTH_URL || "https://pixie-lora-api-dev.tossteam.cn/oauth/authorize"
  );
  authUrl.searchParams.set("client_id", import.meta.env.VITE_APP_ID || "");
  authUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/oauth/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "profile");
  authUrl.searchParams.set("state", btoa(window.location.pathname));
  return authUrl.toString();
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
  });

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      loginMutation.mutate({ username: formData.username, password: formData.password });
    } else {
      registerMutation.mutate({
        username: formData.username,
        password: formData.password,
        name: formData.name || undefined,
        email: formData.email || undefined,
      });
    }
  };

  const fillAdmin = (admin: string, pass: string) => {
    setFormData({ ...formData, username: admin, password: pass });
    setMode("login");
    setError("");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4">
      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%)" }}
      />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(0,230,118,0.05) 0%, transparent 70%)" }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#00E676] flex items-center justify-center mb-4">
            <span className="text-black font-bold text-2xl">O</span>
          </div>
          <h1 className="text-xl font-semibold text-white">OmegaElz CRM</h1>
          <p className="text-sm text-[#616161] mt-1">Sign in to your account</p>
        </div>

        {/* Admin Login Cards */}
        <div className="bg-[#141414] border border-[#00E676]/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-[#00E676]" />
            <span className="text-xs font-medium text-[#00E676]">Quick Admin Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => fillAdmin("admin1", "admin123")}
              className="flex flex-col items-center gap-1.5 p-3 bg-[#0C0C0C] border border-white/[0.06] rounded-xl hover:border-[#00E676]/40 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-[#00E676]/10 flex items-center justify-center">
                <Users size={14} className="text-[#00E676]" />
              </div>
              <span className="text-xs font-medium text-white">Daniel (Admin 1)</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#616161]">admin1 / admin123</span>
                {copied === "admin1" ? (
                  <CheckCircle2 size={10} className="text-[#00E676]" />
                ) : (
                  <Copy size={10} className="text-[#616161] hover:text-[#00E676]" onClick={(e) => { e.stopPropagation(); copyToClipboard("admin1", "admin1"); }} />
                )}
              </div>
            </button>
            <button onClick={() => fillAdmin("admin2", "admin456")}
              className="flex flex-col items-center gap-1.5 p-3 bg-[#0C0C0C] border border-white/[0.06] rounded-xl hover:border-[#00E676]/40 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-[#00E676]/10 flex items-center justify-center">
                <Users size={14} className="text-[#00E676]" />
              </div>
              <span className="text-xs font-medium text-white">Temosho (Admin 2)</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#616161]">admin2 / admin456</span>
                {copied === "admin2" ? (
                  <CheckCircle2 size={10} className="text-[#00E676]" />
                ) : (
                  <Copy size={10} className="text-[#616161] hover:text-[#00E676]" onClick={(e) => { e.stopPropagation(); copyToClipboard("admin2", "admin2"); }} />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
          {/* OAuth Button */}
          <a href={getOAuthUrl()}
            className="flex items-center justify-center gap-2 w-full h-11 bg-[#1A1A1A] border border-white/[0.06] rounded-xl text-sm text-white hover:bg-[#252525] transition-colors mb-4"
          >
            <Sparkles size={16} className="text-[#00E676]" />
            Sign in with OAuth
          </a>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-[#616161]">or use password</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            <button onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 h-9 rounded-lg text-xs font-medium transition-colors ${mode === "login" ? "bg-[#00E676] text-black" : "bg-[#1A1A1A] text-[#9E9E9E] hover:text-white"}`}
            >Sign In</button>
            <button onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 h-9 rounded-lg text-xs font-medium transition-colors ${mode === "register" ? "bg-[#00E676] text-black" : "bg-[#1A1A1A] text-[#9E9E9E] hover:text-white"}`}
            >Register</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input placeholder="Username" value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40" required />

            {mode === "register" && (
              <>
                <input placeholder="Full Name (optional)" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40" />
                <input placeholder="Email (optional)" type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40" />
              </>
            )}

            <div className="relative">
              <input placeholder="Password" type={showPassword ? "text" : "password"} value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-11 px-4 pr-10 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#616161] hover:text-white">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-xs text-[#EF5350]">{error}</p>}

            <button type="submit" disabled={isPending}
              className="w-full h-11 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors disabled:opacity-50 mt-2">
              {isPending ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#616161] mt-6">OmegaElz CRM v1.0 &middot; South Africa</p>
      </motion.div>
    </div>
  );
}
