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
  createdAt: string;
  address?: Address; // ✅ ADD THIS
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

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
              className="grid grid-cols-4 items-center bg-white shadow-sm rounded-lg px-4 py-4"
            >
              {/* Product */}
              <div className="flex items-center gap-3">
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
              <div>
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
              <p className="font-semibold">₹{order.totalPrice}</p>

              {/* Button */}
              <div className="text-right">
                <button className="px-3 py-1 text-sm rounded-full bg-blue-600 text-white">
                  Order Details
                </button>
              </div>

              {/* ✅ ADDRESS (ONLY ADDITION, UI SAME) */}
              <div className="col-span-4 text-sm text-gray-600 mt-2">
                {order.address ? (
                  <>
                    <p className="font-medium">
                      {order.address.fullName} • {order.address.phoneNumber}
                    </p>
                    <p>
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
    </div>
  );
}