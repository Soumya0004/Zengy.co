"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import axios from "axios";

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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      change: "+12%",
      trend: "up",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      change: "+8%",
      trend: "up",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      change: "+15%",
      trend: "up",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: "+23%",
      trend: "up",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={`stat-${stat.title}`}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                {stat.trend === "up" ? (
                  <ArrowUpRight size={16} className="text-green-600" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-400">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Revenue Overview
          </h3>
          <div className="h-64 flex items-end gap-2">
            {(stats?.revenueByMonth || []).map((item, index) => {
              const maxRevenue = Math.max(
                ...(stats?.revenueByMonth || []).map((r) => r.revenue)
              );
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={`revenue-${item.month}-${index}`} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-purple-200 rounded-t-lg hover:bg-purple-300 transition-colors"
                    style={{ height: `${height}%`, minHeight: "20px" }}
                  ></div>
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
            {Object.entries(stats?.ordersByStatus || {}).map(
              ([status, count]) => {
                const percentage = stats?.totalOrders
                  ? ((count as number) / stats.totalOrders) * 100
                  : 0;
                const colors: Record<string, string> = {
                  Pending: "bg-yellow-500",
                  "Order placed": "bg-blue-500",
                  "Out for delivery": "bg-purple-500",
                  Delivered: "bg-green-500",
                  Canceled: "bg-red-500",
                };
                return (
                  <div key={`status-${status}`}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[status] || "bg-gray-500"}`}
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

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Orders
            </h3>
            <a
              href="/admin/orders"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              View all
            </a>
          </div>
          <div className="space-y-4">
            {(stats?.recentOrders || []).slice(0, 5).map((order) => (
              <div
                key={order._id || `order-${Math.random()}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {order.user?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.products?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">
                    ${order.totalPrice?.toLocaleString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Canceled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-center text-gray-500 py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Top Products
            </h3>
            <a
              href="/admin/products"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              View all
            </a>
          </div>
          <div className="space-y-4">
            {(stats?.topProducts || []).slice(0, 5).map((product, index) => (
              <div
                key={product._id || `product-${index}`}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                  {index + 1}
                </span>
                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                  {product.img && (
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{product.title}</p>
                  <p className="text-sm text-gray-500">
                    ${product.price?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <p className="text-center text-gray-500 py-4">No products yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}