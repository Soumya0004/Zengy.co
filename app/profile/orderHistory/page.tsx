"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Loding from "@/app/Component/Loding";

interface ProductItem {
  _id: string;
  product?: {
    _id: string;
    title: string;
    price: number;
    img: string;
  } | null;
  quantity: number;
  size?: string;
  price?: number;
  name?: string;
}

// ✅ ADD ADDRESS TYPE
interface Address {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderItem {
  _id: string;
  products: ProductItem[];
  totalPrice: number;
  status: string;
  paymentId: string;
  createdAt?: string;
  address?: Address; // ✅ ADD THIS
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axios.get("/api/orders/my");

        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <Loding />;

  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const tabs = [
    { label: "All", count: orders.length },
    {
      label: "Order placed",
      count: orders.filter((o) => o.status === "Order placed").length,
    },
    {
      label: "Pending",
      count: orders.filter((o) => o.status === "Pending").length,
    },
    {
      label: "Delivered",
      count: orders.filter((o) => o.status === "Delivered").length,
    },
    {
      label: "Canceled",
      count: orders.filter((o) => o.status === "Canceled").length,
    },
  ];

  const formatOrderDate = (date?: string) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatOrderTime = (date?: string) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b pb-3 mb-5">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.label)}
            className={`text-sm pb-2 ${
              activeTab === t.label
                ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredOrders.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No orders found
        </p>
      )}

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const firstProduct = order.products?.[0] || null;
          const product = firstProduct?.product || null;

          return (
            <div
              key={order._id}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-start bg-white shadow-sm rounded-lg px-4 py-4 gap-4"
            >
              {/* Product */}
              <div className="flex items-start gap-3 col-span-1">
                <Image
                  src={product?.img || "/boy.png"}
                  width={60}
                  height={60}
                  alt="product"
                  className="rounded object-cover border"
                />

                <div>
                  <p className="font-semibold">
                    {product?.title || firstProduct?.name || "Product"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Qty: {firstProduct?.quantity || 1}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span
                  className={`text-sm font-semibold ${
                    order.status === "Delivered"
                      ? "text-green-600"
                      : order.status === "Pending"
                      ? "text-yellow-500"
                      : order.status === "Canceled"
                      ? "text-red-500"
                      : "text-blue-500"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Total */}
              <div className="col-span-1">
                <p className="font-semibold">₹{order.totalPrice}</p>
                <p className="mt-1 text-xs text-gray-500">
                  <span className="font-medium">Ordered:</span>{" "}
                  {formatOrderDate(order.createdAt)}
                  {formatOrderTime(order.createdAt) &&
                    ` at ${formatOrderTime(order.createdAt)}`}
                </p>
              </div>

              {/* Button */}
              <div className="col-span-1 text-left sm:text-right">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-3 py-1 text-sm rounded-full bg-blue-600 text-white"
                >
                  Order Details
                </button>
              </div>

              {/* ✅ ADDRESS (ONLY ADDITION, UI SAME) */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-sm text-gray-600 mt-2">
                {order.address ? (
                  <>
                    <p className="font-medium">
                      {order.address.fullName} • {order.address.phoneNumber}
                    </p>
                    <p className="wrap-break-word leading-relaxed">
                      {order.address.streetAddress}, {order.address.city},{" "}
                      {order.address.state} {order.address.postalCode},{" "}
                      {order.address.country}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400">Address not available</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Order details"
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold">Order Details</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {formatOrderDate(selectedOrder.createdAt)} at{" "}
                  {formatOrderTime(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close order details"
                onClick={() => setSelectedOrder(null)}
                className="text-2xl leading-none text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold">₹{selectedOrder.totalPrice}</span>
              </div>

              <div>
                <p className="mb-2 font-semibold">Items</p>
                <div className="space-y-2">
                  {selectedOrder.products.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between rounded border p-3"
                    >
                      <span>{item.product?.title || item.name || "Product"}</span>
                      <span className="text-gray-600">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.address && (
                <div>
                  <p className="mb-1 font-semibold">Delivery Address</p>
                  <p className="text-gray-600">
                    {selectedOrder.address.fullName} •{" "}
                    {selectedOrder.address.phoneNumber}
                    <br />
                    {selectedOrder.address.streetAddress},{" "}
                    {selectedOrder.address.city},{" "}
                    {selectedOrder.address.state}{" "}
                    {selectedOrder.address.postalCode},{" "}
                    {selectedOrder.address.country}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}