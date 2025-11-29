"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Loding from "@/app/Component/Loding";

interface ProductItem {
  _id: string;
  collection: {
    _id: string;
    title: string;
    price: number;
    img: string;
  };
  size?: string;
  quantity: number;
  price?: number;
  name?: string;
}

interface OrderItem {
  _id: string;
  products: ProductItem[];
  totalPrice: number;
  status: string;
  paymentId: string;
  createdAt: string;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axios.get("/api/users/getUserInfo");
        if (res.data.orders) {
          setOrders(res.data.orders);
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

  const filterOrders = () => {
    if (activeTab === "All") return orders;
    return orders.filter((order) => order.status === activeTab);
  };

  const tabs = [
    { label: "All", count: orders.length },
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

      {/* Table Header */}
      <div className="grid grid-cols-4 text-sm font-semibold text-gray-500 px-3 py-2">
        <p>Item</p>
        <p>Status</p>
        <p>Total</p>
        <p className="text-right">Details</p>
      </div>

      {/* Orders */}
      <div className="mt-2 space-y-4">
        {filterOrders().map((order) => (
          <div
            key={order._id}
            className="grid grid-cols-4 items-center bg-white shadow-sm rounded-lg px-4 py-4"
          >
            {/* Item Info - Image + Title + Qty */}
            <div className="flex items-center gap-3">
              <Image
                src={order.products[0]?.collection?.img || "/boy.png"}
                width={60}
                height={60}
                alt={order.products[0]?.collection?.title || "Product image"}
                className="rounded object-cover border"
              />

              <div>
                <p className="font-semibold">
                  {order.products[0]?.collection?.title}
                </p>
                <p className="text-gray-500 text-sm">
                  Qty: {order.products[0]?.quantity}
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
              {order.status === "Pending" && (
                <p className="text-xs text-gray-400">5d left</p>
              )}
            </div>

            {/* Total */}
            <p className="font-semibold">${order.totalPrice}</p>

            {/* Button */}
            <div className="text-right">
              <button className="px-3 py-1 text-sm rounded-full bg-blue-600 text-white">
                Order Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
