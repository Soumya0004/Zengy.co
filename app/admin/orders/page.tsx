"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Download,
  X,
  Check,
  Truck,
  Package,
  Clock,
  AlertCircle
} from "lucide-react";

interface Order {
  _id: string;
  user: { _id: string; name: string; email: string };
  products: {
    product: { _id: string; title: string; img: string };
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: string;
  paymentId: string;
  address?: any; // Updated to any to handle populated objects or strings
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  "Pending",
  "Order placed",
  "Out for delivery",
  "Delivered",
  "Canceled"
];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  "Order placed": "bg-blue-100 text-blue-700",
  "Out for delivery": "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Canceled: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, React.ElementType> = {
  Pending: Clock,
  "Order placed": Package,
  "Out for delivery": Truck,
  Delivered: Check,
  Canceled: AlertCircle,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/admin/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      fetchOrders();
      setEditingStatus(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order status");
    }
  };

  // Helper to safely render address regardless of format
  const renderAddress = (addr: any) => {
    if (!addr) return "No address provided";
    if (typeof addr === "string") return addr;
    
    // If addr is an object (populated from DB)
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.zipCode
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(", ") : "Address ID: " + (addr._id || "Unknown");
  };

  const filteredOrders = orders.filter((order) => {
    const addrString = renderAddress(order.address).toLowerCase();
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addrString.includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportOrders = () => {
    const csv = [
      ["Order ID", "Customer", "Email", "Items", "Total", "Address", "Status", "Date"],
      ...filteredOrders.map((order) => [
        order._id,
        order.user?.name || "Unknown",
        order.user?.email || "N/A",
        order.products?.length || 0,
        order.totalPrice,
        `"${renderAddress(order.address)}"`, // Wrapped in quotes for CSV safety
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-500">{orders.length} total orders</p>
        </div>
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by ID, customer, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-gray-600">{order._id.slice(-8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{order.user?.name || "Unknown"}</p>
                        <p className="text-sm text-gray-500">{order.user?.email || "No email"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{order.products?.length || 0} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">${order.totalPrice?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={renderAddress(order.address)}>
                        {renderAddress(order.address)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                        <StatusIcon size={14} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setEditingStatus(true);
                          }} 
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {selectedOrder && !editingStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-500">ID: {selectedOrder._id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Customer</h3>
                <p className="text-gray-600">{selectedOrder.user?.name || "Unknown"}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user?.email || "No email"}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">📍 Delivery Address</h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed font-medium">
                  {renderAddress(selectedOrder.address)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.products?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden">
                        {item.product?.img && (
                          <img src={item.product.img} alt={item.product.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.product?.title || "Unknown Product"}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price?.toLocaleString()}</p>
                      </div>
                      <p className="font-medium text-gray-800">${(item.quantity * item.price)?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-purple-600">${selectedOrder.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment ID</p>
                  <p className="font-mono text-sm text-gray-600">{selectedOrder.paymentId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="text-gray-600">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {selectedOrder && editingStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Update Order Status</h2>
              <button 
                onClick={() => {
                  setEditingStatus(false);
                  setSelectedOrder(null);
                }} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Order ID: <span className="font-mono">{selectedOrder._id.slice(-8)}</span>
              </p>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedOrder.status === status
                        ? "bg-purple-100 border-2 border-purple-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm ${statusColors[status]}`}>
                      {status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}