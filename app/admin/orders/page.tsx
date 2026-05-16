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
  AlertCircle,
  ChevronRight,
  Hash
} from "lucide-react";
import Image from "next/image";

// 1. Created clear structural interfaces for addresses instead of using 'any'
interface AddressDetails {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fullName?: string;
  streetAddress?: string;
  postalCode?: string;
  _id?: string;
}

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
  address?: string | AddressDetails | null; // Fixed explicit any type here
  createdAt: string;
  updatedAt: string;
}

const statusOptions = ["Pending", "Order placed", "Out for delivery", "Delivered", "Canceled"];

const statusStyles: Record<string, string> = {
  Pending: "bg-gray-100 text-black border-zinc-900/20",
  "Order placed": "bg-black text-white border-zinc-900",
  "Out for delivery": "bg-[#ffdf00] text-black border-zinc-900",
  Delivered: "bg-green-500 text-white border-zinc-900",
  Canceled: "bg-red-600 text-white border-zinc-900",
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
    }
  };

  // Fixed argument explicit 'any' type to safe structural mapping
  const renderAddress = (addr: string | AddressDetails | null | undefined): string => {
    if (!addr) return "No physical address provided";
    if (typeof addr === "string") return addr;
    
    // Support both schema variations (street/city/state/zipCode vs streetAddress/city/state/postalCode)
    const streetLine = addr.street || addr.streetAddress;
    const zipLine = addr.zipCode || addr.postalCode;
    
    const parts = [streetLine, addr.city, addr.state, zipLine].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "REF: " + (addr._id || "NA");
  };

  const filteredOrders = orders.filter((order) => {
    const addrString = renderAddress(order.address).toLowerCase();
    return (
      (order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addrString.includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || order.status === statusFilter)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#fdfdfd] gap-4">
        <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase italic">Syncing_Shipments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-[#fdfdfd] min-h-screen text-black p-2 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-zinc-900 pb-8">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">Shipments</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 italic">
            Zengy.go / Logistics_Hub / {orders.length}_Total
          </p>
        </div>
        <button
          onClick={() => {}} // Export logic
          className="flex items-center gap-3 px-8 py-4 bg-black text-white hover:bg-[#ffdf00] hover:text-black transition-all duration-300 group"
        >
          <Download size={18} className="group-hover:translate-y-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Generate_CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
          <input
            type="text"
            placeholder="Filter by ID, Customer, or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-900 outline-none font-bold text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-900 font-black uppercase text-[10px] appearance-none outline-none cursor-pointer"
          >
            <option value="all">Status: All_Stages</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border-2 border-zinc-900 bg-white overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-[9px] font-black tracking-widest italic">
              <th className="px-6 py-4">Ref_ID</th>
              <th className="px-6 py-4">Client_Info</th>
              <th className="px-6 py-4">Gross_Total</th>
              <th className="px-6 py-4">Stage</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/5">
            {filteredOrders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              return (
                <tr key={order._id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6 font-mono text-xs font-black opacity-40 group-hover:opacity-100 italic">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-black uppercase italic tracking-tighter leading-tight">{order.user?.name || "GUEST_USER"}</p>
                      <p className="text-[9px] font-bold opacity-40 uppercase truncate max-w-[120px]">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black italic tracking-tighter text-lg">
                    ${order.totalPrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 text-[9px] font-black uppercase tracking-widest ${statusStyles[order.status]}`}>
                      <StatusIcon size={12} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-bold opacity-40 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="p-2 border-2 border-transparent hover:border-zinc-900 transition-all hover:bg-gray-100">
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedOrder(order); setEditingStatus(true); }} 
                        className="p-2 border-2 border-transparent hover:border-zinc-900 transition-all hover:bg-black hover:text-white"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Details Modal */}
      {selectedOrder && !editingStatus && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-2 bg-black text-white z-10 transition-transform hover:rotate-90">
              <X size={24} />
            </button>
            <div className="p-10 space-y-10">
              <header className="border-b-2 border-zinc-900 pb-6">
                <p className="text-[9px] font-black bg-black text-white px-2 py-1 inline-block mb-4">LOGISTICS_REPORT</p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Order_Manifest</h2>
                <p className="text-xs font-mono font-bold opacity-40 mt-2">ID: {selectedOrder._id}</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Customer_Profile</h3>
                    <p className="text-sm font-black italic uppercase">{selectedOrder.user?.name}</p>
                    <p className="text-[10px] font-bold opacity-40 uppercase">{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Drop_Location</h3>
                    <div className="p-4 bg-gray-100 border-l-4 border-zinc-900 text-xs font-bold uppercase leading-relaxed tracking-tight">
                      {renderAddress(selectedOrder.address)}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Financial_Reference</h3>
                    <p className="font-mono text-xs font-bold uppercase">PAY_ID: {selectedOrder.paymentId || "UNPAID_OR_GUEST"}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Registry_Date</h3>
                    <p className="text-xs font-bold uppercase">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Itemized_List</h3>
                <div className="space-y-2">
                  {selectedOrder.products?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border-2 border-zinc-900 bg-white group">
                      {/* Fixed: Added 'relative' class to container box wrapper to prevent absolute layout breakdown of filled Next.js images */}
                      <div className="w-12 h-12 border border-zinc-900 grayscale group-hover:grayscale-0 transition-all relative">
                        <Image 
                          src={item.product?.img || "/placeholder-product.png"} 
                          alt={item.product?.title || "Product image"} 
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-black uppercase leading-tight">{item.product?.title}</p>
                        <p className="text-[9px] font-bold opacity-40 uppercase">QTY: {item.quantity} × ${item.price}</p>
                      </div>
                      <p className="font-black italic tracking-tighter text-sm">${(item.quantity * item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-black text-white p-6 rounded-tr-[40px]">
                <span className="text-xs font-black uppercase tracking-widest">Gross_Summary</span>
                <span className="text-3xl font-black italic tracking-tighter">${selectedOrder.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {selectedOrder && editingStatus && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-zinc-900 w-full max-w-md relative overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 border-b-2 border-zinc-900 pb-4">
                Update_Stage
              </h2>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                    className={`w-full p-4 border-2 flex justify-between items-center transition-all ${
                      selectedOrder.status === status
                        ? "bg-black border-zinc-900 text-white"
                        : "bg-white border-transparent hover:border-zinc-900 text-black/60 hover:text-black"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
              <button 
                onClick={() => { setEditingStatus(false); setSelectedOrder(null); }} 
                className="mt-8 w-full p-3 bg-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                Abort_Changes
              </button>
            </div>
            {/* Background design element */}
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] select-none pointer-events-none">
                <Hash size={200} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}