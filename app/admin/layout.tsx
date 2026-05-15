"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "OVERVIEW", icon: LayoutDashboard },
  { href: "/admin/products", label: "INVENTORY", icon: Package },
  { href: "/admin/orders", label: "SHIPMENTS", icon: ShoppingCart },
  { href: "/admin/users", label: "REGISTRY", icon: Users },
  { href: "/admin/categories", label: "CLASSES", icon: Tag },
  { href: "/admin/analytics", label: "INTEL", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin && session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
        <div className="text-center p-12 border-4 border-zinc-900 bg-white">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Access_Denied</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-4 opacity-40">Insufficient_Privileges_Detected</p>
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-8 px-8 py-3 bg-black text-white font-black uppercase text-xs italic tracking-widest"
          >
            Return_to_Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-black font-sans selection:bg-[#ffdf00]">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-black text-white border-2 border-zinc-900"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r-4 border-zinc-900 z-40 transform transition-transform duration-500 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-8 border-b-4 border-zinc-900">
          <Link href="/admin" className="group">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-2xl italic tracking-tighter transition-transform group-hover:skew-x-[-12deg]">
                Z
              </div>
              <div>
                <span className="block text-2xl font-zentry special-font  -tracking-normal uppercase leading-none">Zengy.go</span>
                <span className="text-[10px] font-bold uppercase   tracking-[0.3em] opacity-30">Admin_Terminal</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="p-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-4 transition-all duration-200 group ${
                  isActive
                    ? "bg-black text-white translate-x-2"
                    : "text-black/60 hover:text-black hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isActive ? "italic" : ""}`}>
                    {item.label}
                  </span>
                </div>
                {isActive && <ChevronRight size={14} className="animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 border-t-4 border-zinc-900 bg-white">
          <Link
            href="/admin/settings"
            className="flex items-center gap-4 px-4 py-3 text-black/60 hover:text-black transition-colors"
          >
            <Settings size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Config_System</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-4 px-4 py-3 bg-gray-100 text-red-600 hover:bg-red-600 hover:text-white transition-all w-full group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen relative">
        {/* Top header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b-4 border-zinc-900 px-8 py-6 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black font-zentry special-font -tracking-normal uppercase leading-none">
               <b> {navItems.find((item) => item.href === pathname)?.label || "Terminal"}</b>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Activity size={12} className="text-green-500 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">
                  Node_Active: {session?.user?.name || "Root_Admin"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right mr-2">
                <p className="text-[15px] font-zentry special-font tracking-wider  leading-none"><b>{session?.user?.name}</b></p>
                <p className="text-[8px] font-bold uppercase opacity-30 tracking-widest">LVL_01_ADMIN</p>
              </div>
              <div className="w-12 h-12 border-2 border-zinc-900 p-1 bg-white">
                <div className="w-full h-full bg-black text-white flex items-center justify-center font-black italic text-lg border-2 border-white outline outline-1 outline-black">
                  {session?.user?.name?.charAt(0) || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content wrapper */}
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>

        {/* Background visual detail */}
        <div className="fixed bottom-10 right-10 text-[180px] font-black italic opacity-[0.02] select-none pointer-events-none uppercase tracking-tighter leading-none">
          Zengy
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}