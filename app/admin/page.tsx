"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  Activity,
  ChevronRight
} from "lucide-react";
import axios from "axios";

// Interfaces stay the same to ensure your backend connection works
interface Order {
  _id: string;
  user: { name: string; email: string };
  products: { product: { title: string }; quantity: number; price: number }[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  img: string;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
  ordersByStatus: Record<string, number>;
  revenueByMonth: { month: string; revenue: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#fdfdfd] gap-4">
        <div className="w-16 h-1 border-t-4 border-zinc-900 animate-bounce"></div>
        <p className="text-[2rem] font-black font-zentry special-font  -tracking-normal ">Zengy.go / System Initializing</p>
      </div>
    );
  }

  const statCards = [
    { title: "INVENTORY_TOTAL", value: stats?.totalProducts || 0, icon: Package, change: "+12%" },
    { title: "ORDER_VOLUME", value: stats?.totalOrders || 0, icon: ShoppingCart, change: "+8%" },
    { title: "USER_BASE", value: stats?.totalUsers || 0, icon: Users, change: "+15%" },
    { title: "GROSS_REVENUE", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, change: "+23%" },
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-black p-4 md:p-8 font-sans">
      {/* Brand Header */}
      <header className="mb-12 border-b-4 border-zinc-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="bg-black text-white px-4 py-2 inline-block mb-4">
            <h1 className="text-2xl font-black tracking-norma font-zentry     uppercase leading-none">Zengy.go</h1>
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Admin_Control</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 border border-zinc-900/10">
          <Activity size={12} className="animate-pulse" /> Live_Metrics_2026
        </div>
      </header>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white border-2 border-zinc-900 p-6 group hover:bg-black hover:text-white transition-all duration-300 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <p className="text-[9px] font-black tracking-[0.3em] uppercase opacity-50 group-hover:opacity-100">{stat.title}</p>
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <div className="relative z-10">
                <p className="text-4xl font-black tracking-tighter italic">{stat.value}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-black bg-black text-white group-hover:bg-white group-hover:text-black px-2 py-0.5">
                    {stat.change}
                  </span>
                  <span className="text-[9px] uppercase font-bold opacity-30">vs_prev_period</span>
                </div>
              </div>
              {/* Decorative graphic element */}
              <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={100} strokeWidth={4} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Visualization */}
        <div className="lg:col-span-2 border-2 border-zinc-900 bg-white p-6">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
              <span className="w-8 h-[2px] bg-black"></span> Revenue_Stream
            </h3>
            <div className="text-[9px] font-black uppercase border-b-2 border-zinc-900">Full_Report</div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2">
            {(stats?.revenueByMonth || []).map((item, index) => {
              const maxRev = Math.max(...(stats?.revenueByMonth || []).map((r) => r.revenue));
              const height = maxRev > 0 ? (item.revenue / maxRev) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div 
                    className="w-full bg-gray-100 border-x-2 border-t-2 border-zinc-900 group-hover:bg-black transition-all relative"
                    style={{ height: `${height}%`, minHeight: "4px" }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-black text-white px-2 py-1 whitespace-nowrap">
                      ${item.revenue}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase mt-3 tracking-tighter">{item.month.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Analysis */}
        <div className="bg-black text-white p-8 rounded-tr-[50px]">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-10 italic">Distribution_Log</h3>
          <div className="space-y-8">
            {Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => {
              const percentage = stats?.totalOrders ? ((count as number) / stats.totalOrders) * 100 : 0;
              return (
                <div key={status} className="group">
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                    <span className="opacity-60 group-hover:opacity-100">{status}</span>
                    <span className="bg-white text-black px-2">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-white group-hover:bg-[#ffdf00] transition-all duration-700" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lower Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="border-2 border-zinc-900 bg-white overflow-hidden">
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest italic">Recent_Orders</h3>
            <ChevronRight size={16} />
          </div>
          <div className="divide-y-2 divide-black">
            {(stats?.recentOrders || []).slice(0, 5).map((order) => (
              <div key={order._id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-tight italic">{order.user?.name}</p>
                  <p className="text-[9px] font-bold opacity-40 uppercase">Units: {order.products?.length} / Ref: {order._id.slice(-6)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black tracking-tighter">${order.totalPrice.toLocaleString()}</p>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 border border-zinc-900 ${
                    order.status === 'Delivered' ? 'bg-black text-white' : 'bg-transparent'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Product Movers */}
        <div className="border-2 border-zinc-900 bg-white overflow-hidden">
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest italic">Top_Stock_Units</h3>
            <ChevronRight size={16} />
          </div>
          <div className="divide-y-2 divide-black">
            {(stats?.topProducts || []).slice(0, 5).map((product, i) => (
              <div key={product._id} className="p-4 flex items-center gap-4 group">
                <span className="text-2xl font-black italic opacity-10 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                <div className="w-12 h-12 bg-gray-100 border-2 border-zinc-900 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img src={product.img} alt="" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black uppercase tracking-tighter leading-none mb-1">{product.title}</p>
                  <p className="text-[9px] font-bold opacity-40 uppercase">Retail_Price: ${product.price}</p>
                </div>
                <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <footer className="mt-16 text-center border-t border-zinc-900/5 pt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40 italic">
          "Fashion that moves with you" — Zengy.go © 2026
        </p>
      </footer>
    </div>
  );
}