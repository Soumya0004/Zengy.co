"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Package,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

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
  topProducts: { product: { _id: string; title: string; img: string }; totalSold: number; revenue: number }[];
  topCategories: { category: string; revenue: number; orders: number }[];
  ordersByStatus: Record<string, number>;
  recentActivity: { type: string; description: string; timestamp: string }[];
  userStats: {
    newUsersThisMonth: number;
    returningUsers: number;
    userGrowth: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`/api/admin/analytics?range=${dateRange}`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!data) return;
    
    const report = `
Sales Analytics Report
Generated: ${new Date().toLocaleDateString()}
Date Range: Last ${dateRange} days

=== OVERVIEW ===
Total Revenue: $${data.overview.totalRevenue.toLocaleString()}
Total Orders: ${data.overview.totalOrders}
Total Users: ${data.overview.totalUsers}
Total Products: ${data.overview.totalProducts}
Average Order Value: $${data.overview.averageOrderValue.toFixed(2)}
Conversion Rate: ${data.overview.conversionRate.toFixed(2)}%

=== TOP PRODUCTS ===
${data.topProducts.map((p, i) => `${i+1}. ${p.product.title} - ${p.totalSold} sold - $${p.revenue}`).join('\n')}

=== TOP CATEGORIES ===
${data.topCategories.map(c => `${c.category} - $${c.revenue} (${c.orders} orders)`).join('\n')}

=== ORDERS BY STATUS ===
${Object.entries(data.ordersByStatus).map(([status, count]) => `${status}: ${count}`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const maxRevenue = Math.max(...(data?.revenueByMonth || []).map(r => r.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-500">Track your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ${data?.overview.totalRevenue.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <ArrowUpRight size={16} className="text-green-600" />
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
            <span className="text-sm text-gray-400">vs previous</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {data?.overview.totalOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <ArrowUpRight size={16} className="text-green-600" />
            <span className="text-sm text-green-600 font-medium">+8.2%</span>
            <span className="text-sm text-gray-400">vs previous</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ${data?.overview.averageOrderValue.toFixed(2) || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <ArrowDownRight size={16} className="text-red-600" />
            <span className="text-sm text-red-600 font-medium">-2.1%</span>
            <span className="text-sm text-gray-400">vs previous</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {data?.overview.conversionRate.toFixed(2) || 0}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <ArrowUpRight size={16} className="text-green-600" />
            <span className="text-sm text-green-600 font-medium">+5.3%</span>
            <span className="text-sm text-gray-400">vs previous</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Revenue Over Time
          </h3>
          <div className="h-64 flex items-end gap-2">
            {(data?.revenueByMonth || []).map((item, index) => {
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full relative group">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-300 rounded-t-lg hover:from-purple-700 hover:to-purple-400 transition-all cursor-pointer"
                      style={{ height: `${height}%`, minHeight: "20px" }}
                    ></div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      ${item.revenue.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {item.month.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Orders by Status
          </h3>
          <div className="space-y-4">
            {Object.entries(data?.ordersByStatus || {}).map(
              ([status, count]) => {
                const percentage = data?.overview.totalOrders
                  ? ((count as number) / data.overview.totalOrders) * 100
                  : 0;
                const colors: Record<string, string> = {
                  Pending: "bg-yellow-500",
                  "Order placed": "bg-blue-500",
                  "Out for delivery": "bg-purple-500",
                  Delivered: "bg-green-500",
                  Canceled: "bg-red-500",
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{status}</span>
                      <span className="font-medium">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[status] || "bg-gray-500"} transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {(data?.topProducts || []).slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                  {index + 1}
                </span>
                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                  {item.product?.img && (
                    <img
                      src={item.product.img}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {item.product?.title || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.totalSold} sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    ${item.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <p className="text-center text-gray-500 py-4">
                No sales data yet
              </p>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Categories
          </h3>
          <div className="space-y-4">
            {(data?.topCategories || []).slice(0, 5).map((cat, index) => {
              const maxCatRevenue = Math.max(...(data?.topCategories || []).map(c => c.revenue));
              const percentage = maxCatRevenue > 0 ? (cat.revenue / maxCatRevenue) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">
                        {cat.category || "Uncategorized"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {cat.orders} orders
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ${cat.revenue.toLocaleString()}
                  </p>
                </div>
              );
            })}
            {(!data?.topCategories || data.topCategories.length === 0) && (
              <p className="text-center text-gray-500 py-4">
                No category data yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          User Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">
              {data?.userStats.newUsersThisMonth || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">New Users This Month</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">
              {data?.userStats.returningUsers || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Returning Customers</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              +{data?.userStats.userGrowth || 0}%
            </p>
            <p className="text-sm text-gray-500 mt-1">User Growth</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {(data?.recentActivity || []).slice(0, 10).map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <div className="flex-1">
                <p className="text-gray-800">{activity.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {(!data?.recentActivity || data.recentActivity.length === 0) && (
            <p className="text-center text-gray-500 py-4">
              No recent activity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}