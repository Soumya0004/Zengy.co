"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2,
  Shield,
  Download,
  X,
  Mail,
  User,
  Calendar,
  ShoppingCart,
  ChevronRight
} from "lucide-react";
import Image from "next/image";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: string;
  orders?: string[];
  address?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, { role: newRole });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("TERMINATE USER ACCESS? THIS ACTION IS PERMANENT.")) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#fdfdfd] gap-4">
        <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase italic">User_Base_Sync...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-[#fdfdfd] min-h-screen text-black p-2 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-zinc-900 pb-8">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">Registry</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 italic">
            Zengy.go / Identity_Management / {users.length}_Members
          </p>
        </div>
        <button
          onClick={() => {}} // Export Logic
          className="flex items-center gap-3 px-8 py-4 bg-black text-white hover:bg-[#ffdf00] hover:text-black transition-all duration-300 group"
        >
          <Download size={18} className="group-hover:translate-y-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Export_Database</span>
        </button>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total_Members", value: users.length, icon: User, color: "bg-white" },
          { label: "Admin_Level", value: users.filter(u => u.role === "admin").length, icon: Shield, color: "bg-black text-white" },
          { label: "Active_shoppers", value: users.filter(u => u.orders && u.orders.length > 0).length, icon: ShoppingCart, color: "bg-[#ffdf00]" }
        ].map((stat, i) => (
          <div key={i} className={`border-2 border-zinc-900 p-6 flex justify-between items-end ${stat.color}`}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 opacity-60">{stat.label}</p>
              <p className="text-4xl font-black italic tracking-tighter leading-none">{stat.value}</p>
            </div>
            <stat.icon size={24} strokeWidth={2.5} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
          <input
            type="text"
            placeholder="Search by Identity or Alias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-900 outline-none font-bold text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-900 font-black uppercase text-[10px] appearance-none outline-none cursor-pointer"
          >
            <option value="all">Access: All_Roles</option>
            <option value="admin">Admin_Only</option>
            <option value="user">Regular_Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border-2 border-zinc-900 bg-white overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-[9px] font-black tracking-widest italic">
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">Communication</th>
              <th className="px-6 py-4">Access_Level</th>
              <th className="px-6 py-4 hidden md:table-cell">Registry_Date</th>
              <th className="px-6 py-4 hidden md:table-cell">Activity</th>
              <th className="px-6 py-4 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/5">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="group hover:bg-gray-50 transition-colors">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-2 border-zinc-900 bg-white flex items-center justify-center shrink-0 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      {user.image ? (
                        <Image src={user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black italic">{user.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                    <p className="text-sm font-black uppercase italic tracking-tighter leading-none">{user.name || "GUEST_ID"}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[11px] font-bold opacity-60 uppercase">{user.email || "N/A"}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 border-2 ${
                    user.role === 'admin' ? 'bg-black text-white border-zinc-900' : 'border-zinc-900/10'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <p className="text-[10px] font-bold opacity-40 uppercase">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "??/??/????"}
                  </p>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black italic">{user.orders?.length || 0}</span>
                    <span className="text-[9px] font-bold opacity-30 uppercase italic">Orders</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {[
                      { icon: Eye, color: 'hover:bg-blue-100', action: () => setSelectedUser(user) },
                      { icon: Edit2, color: 'hover:bg-green-100', action: () => setEditingUser(user) },
                      { icon: Trash2, color: 'hover:bg-red-100', action: () => handleDeleteUser(user._id) }
                    ].map((btn, i) => (
                      <button key={i} onClick={btn.action} className={`p-2 border-2 border-transparent hover:border-zinc-900 transition-all ${btn.color}`}>
                        <btn.icon size={16} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedUser && !editingUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-zinc-900 w-full max-w-md relative">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 bg-black text-white transition-transform hover:rotate-90">
              <X size={20} />
            </button>
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 border-4 border-zinc-900 grayscale">
                   {selectedUser.image ? (
<div className="relative w-full h-full">
  <Image 
    src={selectedUser.image || "/fallback-avatar.png"} 
    alt={selectedUser.name ? `${selectedUser.name}'s profile picture` : "User profile picture"}
    fill
    className="object-cover"
  />
</div>                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl font-black italic">
                       {selectedUser.name?.charAt(0)}
                     </div>
                   )}
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">{selectedUser.name}</h3>
                  <span className="text-[9px] font-black uppercase bg-black text-white px-2 py-1 italic tracking-[0.2em]">
                    Access_Level: {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t-2 border-zinc-900/10 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-3 opacity-60"><Mail size={14} /> {selectedUser.email}</div>
                <div className="flex items-center gap-3 opacity-60"><Calendar size={14} /> Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                <div className="flex items-center gap-3 opacity-60"><ShoppingCart size={14} /> Transactions: {selectedUser.orders?.length || 0}</div>
              </div>

              {selectedUser.address && (
                <div className="p-4 bg-gray-100 border-l-4 border-zinc-900 italic font-bold text-xs uppercase tracking-tight">
                  Loc: {selectedUser.address}
                </div>
              )}

              <button onClick={() => setSelectedUser(null)} className="w-full py-4 bg-black text-white font-black uppercase italic tracking-widest hover:bg-[#ffdf00] hover:text-black transition-colors">
                Close_Registry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Update Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-zinc-900 w-full max-w-md relative overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 border-b-2 border-zinc-900 pb-4">
                Access_Protocol
              </h2>
              <div className="space-y-2">
                {[
                  { id: 'user', label: 'Regular_Client', desc: 'Standard shopping access' },
                  { id: 'admin', label: 'Root_Admin', desc: 'Full architectural control' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleUpdate(editingUser._id, role.id)}
                    className={`w-full p-6 border-2 flex justify-between items-center transition-all text-left ${
                      editingUser.role === role.id
                        ? "bg-black border-zinc-900 text-white"
                        : "bg-white border-transparent hover:border-zinc-900 text-black/60 hover:text-black"
                    }`}
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">{role.label}</p>
                      <p className="text-[8px] font-bold opacity-40 uppercase">{role.desc}</p>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
              <button onClick={() => setEditingUser(null)} className="mt-8 w-full p-3 bg-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                Abort_Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Quote */}
      <footer className="mt-16 text-center border-t border-zinc-900/5 pt-8">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">
          User Database Managed By Zengy.go © 2026
        </p>
      </footer>
    </div>
  );
}