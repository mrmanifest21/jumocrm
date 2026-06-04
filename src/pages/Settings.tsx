import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Shield,
  Bell,
  Save,
  Building2,
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });

  const [company, setCompany] = useState({
    name: "OmegaElz",
    email: "info@omegaelz.co.za",
    phone: "+27 70 757 9866",
    website: "omegaelz.com",
    address: "South Africa",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "company", label: "Company", icon: Building2 },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-[#9E9E9E] mt-0.5">Manage your account and CRM preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#141414] border border-white/[0.06] rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[#00E676] text-black"
                : "text-[#9E9E9E] hover:text-white hover:bg-[#1A1A1A]"
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
              <span className="text-xl font-bold text-[#00E676]">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-base font-medium text-white">{user?.name || "User"}</h3>
              <p className="text-sm text-[#616161]">{user?.role || "Sales"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Full Name</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Email</label>
              <input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Phone</label>
              <input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+27 ..."
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Department</label>
              <input
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                placeholder="e.g. Sales"
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors"
            >
              <Save size={14} />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {activeTab === "company" && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00E676] flex items-center justify-center">
              <span className="text-2xl font-bold text-black">O</span>
            </div>
            <div>
              <h3 className="text-base font-medium text-white">OmegaElz</h3>
              <p className="text-sm text-[#616161]">Digital Solutions Company</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Company Name</label>
              <input
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Business Email</label>
              <input
                value={company.email}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Phone</label>
              <input
                value={company.phone}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Website</label>
              <input
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#616161] mb-1.5 block">Address</label>
            <input
              value={company.address}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]/40"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors"
            >
              <Save size={14} />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-medium text-white mb-4">Notification Preferences</h3>
          {[
            { label: "New lead notifications", desc: "Get notified when a new lead is added", default: true },
            { label: "Deal stage changes", desc: "Notifications when deals move stages", default: true },
            { label: "Task reminders", desc: "Daily reminders for pending tasks", default: true },
            { label: "Email notifications", desc: "Receive email alerts at info@omegaelz.co.za", default: true },
            { label: "Weekly summary", desc: "Weekly CRM performance report", default: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-[#616161]">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                <div className="w-10 h-5 bg-[#1A1A1A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00E676]" />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-medium text-white mb-4">Security Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
            <div>
              <label className="text-xs text-[#616161] mb-1.5 block">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <h4 className="text-sm font-medium text-white mb-3">Two-Factor Authentication</h4>
            <div className="flex items-center justify-between p-3 bg-[#0C0C0C] rounded-xl">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-[#00E676]" />
                <div>
                  <p className="text-sm text-white">2FA Status</p>
                  <p className="text-xs text-[#616161]">Not enabled</p>
                </div>
              </div>
              <button className="px-3 h-8 bg-[#00E676] text-black rounded-lg text-xs font-medium hover:bg-[#69F0AE] transition-colors">
                Enable
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors"
          >
            <Save size={14} />
            Update Password
          </button>
        </div>
      )}
    </div>
  );
}
