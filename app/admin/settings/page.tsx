"use client";

import { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Loader2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    storeName: "Zengy Go",
    storeEmail: "admin@zengygo.com",
    currency: "USD",
    timezone: "Asia/Kolkata",
    lowStockThreshold: 10,
    emailNotifications: true,
    orderNotifications: true,
    userNotifications: false,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 bg-[#fdfdfd] min-h-screen pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-4 border-zinc-900 pb-8">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">Configurations</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Zengy.go / System_Preferences / 2026</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="group flex items-center gap-3 px-8 py-4 bg-black text-white hover:bg-[#ffdf00] hover:text-black transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
          <span className="text-xs font-black uppercase tracking-widest">{saving ? "Processing..." : "Commit_Changes"}</span>
        </button>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className="bg-black text-white p-4 flex items-center gap-3 italic font-black uppercase text-xs tracking-widest animate-in slide-in-from-top-4">
          <CheckCircle2 size={16} className="text-green-400" />
          Settings Synchronized Successfully_
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-1">
            {[
              { icon: User, label: "Core_General", id: "general", active: true },
              { icon: Bell, label: "Alert_Triggers", id: "notifications" },
              { icon: Shield, label: "Access_Security", id: "security" },
              { icon: Palette, label: "Brand_Visuals", id: "appearance" },
            ].map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center justify-between group px-4 py-4 border-2 transition-all duration-200 ${
                  item.active ? "bg-black border-zinc-900 text-white" : "bg-white border-transparent hover:border-zinc-900 text-black/60 hover:text-black"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                <ChevronRight size={14} className={`transition-transform ${item.active ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* General Section */}
          <section className="bg-white border-2 border-zinc-900 p-8 relative">
            <div className="absolute -top-3 -left-1 bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase">Section_01</div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span> General_Identity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Store_Label</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-zinc-900 p-4 text-sm font-bold focus:bg-white outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Support_Contact</label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-zinc-900 p-4 text-sm font-bold focus:bg-white outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Transactional_Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-zinc-900 p-4 text-sm font-bold appearance-none outline-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Temporal_Zone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-zinc-900 p-4 text-sm font-bold appearance-none outline-none cursor-pointer"
                >
                  <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                  <option value="America/New_York">EST (UTC-5:00)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-black text-white p-8 rounded-br-[80px]">
            <h2 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full"></span> Alert_Matrix
            </h2>
            
            <div className="space-y-4">
              {[
                { id: 'emailNotifications', label: 'Primary Email Logs', desc: 'System-critical event synchronization' },
                { id: 'orderNotifications', label: 'Inbound Sales Alerts', desc: 'Real-time transaction monitoring' },
                { id: 'userNotifications', label: 'New Member Protocols', desc: 'User registration event tracking' },
              ].map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-4 border-l-4 border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{notif.label}</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase">{notif.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[notif.id as keyof typeof settings] as boolean}
                      onChange={(e) => setSettings({ ...settings, [notif.id]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/10 border border-white/20 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ffdf00]"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Security & Account */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="border-2 border-zinc-900 p-6 bg-white">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck size={14} /> Security_Protocol
              </h3>
              <div className="space-y-4">
                <button className="w-full bg-black text-white p-3 text-[10px] font-black uppercase tracking-tighter hover:bg-[#ffdf00] hover:text-black transition-colors">
                  Activate_2FA
                </button>
                <button className="w-full border-2 border-zinc-900 p-3 text-[10px] font-black uppercase tracking-tighter hover:bg-gray-100 transition-colors">
                  Reset_Auth_Keys
                </button>
              </div>
            </section>

            <section className="border-2 border-zinc-900 p-6 bg-white overflow-hidden relative">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-2xl italic tracking-tighter border-4 border-white outline outline-2 outline-black">
                  {session?.user?.name?.charAt(0) || "A"}
                </div>
                <div>
                  <p className="text-sm font-black uppercase italic leading-none mb-1">{session?.user?.name || "Admin_User"}</p>
                  <p className="text-[10px] font-bold opacity-40 mb-2">{session?.user?.email}</p>
                  <span className="text-[8px] font-black bg-black text-white px-2 py-0.5 uppercase tracking-widest">
                    Root_Access
                  </span>
                </div>
              </div>
              {/* Background text decoration */}
              <div className="absolute -bottom-4 -right-4 text-8xl font-black italic opacity-[0.03] select-none pointer-events-none">
                USER
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <footer className="mt-20 text-center border-t border-zinc-900/5 pt-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">
          High Performance Luxury Streetwear Management © 2026
        </p>
      </footer>
    </div>
  );
}