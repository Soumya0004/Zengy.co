"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Download,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import Image from "next/image";

// 1. Complete Interface Definitions
interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topProducts: { 
    product: { _id: string; title: string; img: string }; 
    totalSold: number; 
    revenue: number 
  }[];
  topCategories: { category: string; revenue: number; orders: number }[];
  ordersByStatus: Record<string, number>;
  recentActivity: { type: string; description: string; timestamp: string }[];
  userStats: {
    newUsersThisMonth: number;
    returningUsers: number;
    userGrowth: number;
  };
}

// 2. Initial State to prevent "Cannot read property of null" errors
const initialState: AnalyticsData = {
  overview: { totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0, averageOrderValue: 0, conversionRate: 0 },
  revenueByMonth: [],
  topProducts: [],
  topCategories: [],
  ordersByStatus: {},
  recentActivity: [],
  userStats: { newUsersThisMonth: 0, returningUsers: 0, userGrowth: 0 }
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(initialState);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/admin/analytics?range=${dateRange}`);
        // Ensure we handle cases where API might return null or unexpected structure
        setData(res.data || initialState);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#fdfdfd] gap-4">
        <div className="w-16 h-1 bg-black animate-pulse"></div>
        <p className="text-[10px] font-black tracking-[0.5em] uppercase italic text-black">ZENGY_GO / CALC_METRICS</p>
      </div>
    );
  }

  const maxRevenue = data.revenueByMonth.length > 0 
    ? Math.max(...data.revenueByMonth.map(r => r.revenue)) 
    : 0;

  return (
    <div className="space-y-10 bg-[#fdfdfd] min-h-screen text-black p-2 md:p-4 pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-zinc-900 pb-8">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">Analytics</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 italic">Performance_Intel / 2026</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-white border-2 border-zinc-900 font-black uppercase text-[10px] appearance-none outline-none cursor-pointer hover:bg-black hover:text-white transition-colors"
            >
              <option value="7">Range: 07_Days</option>
              <option value="30">Range: 30_Days</option>
              <option value="90">Range: 90_Days</option>
            </select>
          </div>
          <button className="flex items-center gap-3 px-6 py-3 bg-black text-white hover:bg-[#ffdf00] hover:text-black transition-all duration-300 group">
            <Download size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Export_Data</span>
          </button>
        </div>
      </header>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "GROSS_REVENUE", val: `$${data.overview.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-white" },
          { label: "ORDER_VOLUME", val: data.overview.totalOrders, icon: ShoppingCart, color: "bg-white" },
          { label: "AVG_BASKET", val: `$${data.overview.averageOrderValue.toFixed(2)}`, icon: TrendingUp, color: "bg-white" },
          { label: "CONV_INDEX", val: `${data.overview.conversionRate.toFixed(2)}%`, icon: BarChart3, color: "bg-[#ffdf00]" },
        ].map((stat, i) => (
          <div key={i} className={`border-2 border-zinc-900 p-6 hover:translate-x-1 hover:-translate-y-1 transition-transform ${stat.color}`}>
            <div className="flex justify-between items-start mb-6 opacity-50 font-black text-[9px] uppercase tracking-widest">
              {stat.label} <stat.icon size={14} />
            </div>
            <p className="text-4xl font-black tracking-tighter italic leading-none">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Timeline */}
        <div className="lg:col-span-2 border-2 border-zinc-900 bg-white p-8">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] italic mb-12 flex items-center gap-3">
            <span className="w-10 h-1 bg-black"></span> Revenue_Stream
          </h3>
          <div className="h-64 flex items-end gap-2">
            {data.revenueByMonth.map((item, index) => {
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div 
                    className="w-full bg-gray-100 border-x border-t-2 border-zinc-900 group-hover:bg-black transition-all relative"
                    style={{ height: `${height}%`, minHeight: "4px" }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[8px] px-1 font-bold whitespace-nowrap z-10">
                      ${item.revenue}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase mt-3 italic opacity-40">{item.month.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Analysis */}
        <div className="bg-black text-white p-8 rounded-tr-[60px]">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-10 italic">Status_Distribution</h3>
          <div className="space-y-6">
            {Object.entries(data.ordersByStatus).map(([status, count]) => {
              const percentage = data.overview.totalOrders ? (count / data.overview.totalOrders) * 100 : 0;
              return (
                <div key={status} className="group">
                  <div className="flex justify-between items-end text-[10px] font-black uppercase mb-2">
                    <span className="opacity-60 group-hover:opacity-100 transition-opacity">{status}</span>
                    <span className="bg-white text-black px-2">{count}</span>
                  </div>
                  <div className="h-1 bg-white/20 overflow-hidden">
                    <div className="h-full bg-[#ffdf00] transition-all duration-700" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Units */}
        <div className="border-2 border-zinc-900 bg-white overflow-hidden">
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest italic text-white">High_Performance_Units</h3>
            <ArrowUpRight size={16} />
          </div>
          <div className="divide-y-2 divide-black/5">
            {data.topProducts.slice(0, 5).map((item, index) => (
              <div key={index} className="p-4 flex items-center gap-5 group hover:bg-gray-50">
                <span className="text-2xl font-black italic opacity-10">0{index + 1}</span>
                <div className="w-12 h-12 border border-zinc-900 grayscale group-hover:grayscale-0 transition-all overflow-hidden shrink-0">
                  <Image src={item.product?.img} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase italic truncate">{item.product?.title}</p>
                  <p className="text-[9px] font-bold opacity-40 uppercase">{item.totalSold} Sold</p>
                </div>
                <p className="font-black italic tracking-tighter">${item.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Dominance */}
        <div className="border-2 border-zinc-900 bg-white p-8">
          <h3 className="text-xs font-black uppercase tracking-widest italic mb-8 flex items-center gap-2">
            <Layers size={14} /> Category_Dominance
          </h3>
          <div className="space-y-6">
            {data.topCategories.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                  <span>{cat.category}</span>
                  <span className="opacity-40 italic">{cat.orders} Orders</span>
                </div>
                <div className="h-4 border border-zinc-900 p-0.5 bg-gray-50">
                  <div 
                    className="h-full bg-black hover:bg-[#ffdf00] transition-colors" 
                    style={{ width: `${(cat.revenue / (data.overview.totalRevenue || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Activity */}
      <div className="border-2 border-zinc-900 bg-white overflow-hidden">
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest italic text-white">System_Audit_Log</h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="p-4 space-y-1">
          {data.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border-b border-zinc-900/5 hover:bg-gray-50 transition-colors group">
              <span className="text-[9px] font-mono opacity-30">{new Date(activity.timestamp).toLocaleTimeString()}</span>
              <p className="text-[11px] font-black uppercase flex-1">{activity.description}</p>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}