"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import axios from "axios";
import { ShoppingBag, Trash2 } from "lucide-react";
import Loding from "../Component/Loding";

interface CartProduct {
  _id: string;
  collection: {
    _id: string;
    title: string;
    price: number;
    img: string;
  };
  size?: string;
  quantity: number;
}

interface Cart {
  _id: string;
  products: CartProduct[];
  status: string;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // --- FETCH CART ---
  useEffect(() => {
    const fetchCart = async () => {
      if (status !== "authenticated") return;
      try {
        const res = await axios.get("/api/cart/get", { withCredentials: true });
        if (res.data.success) {
          setCart(res.data.cart);
        } else {
          setCart({ _id: "", products: [], status: "pending" });
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [status]);

  // --- ANIMATION ---
  useEffect(() => {
    if (cartRef.current && cart?.products?.length) {
      gsap.fromTo(
        cartRef.current.querySelectorAll(".cart-item"),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: "power3.out" }
      );
    }
  }, [cart]);

  // --- REMOVE ITEM ---
  const handleRemove = async (itemId: string) => {
  try {
    setRemoving(itemId);
    const res = await axios.post("/api/cart/itemRemove", {
      orderId: cart?._id,
      productId: itemId,
    });

    if (res.data.success) {
      setCart(res.data.order);
    }
  } catch (error) {
    console.error("Error removing item:", error);
  } finally {
    setRemoving(null);
  }
};


  if (status === "loading" || loading) return <Loding />;
  if (status === "unauthenticated")
    return <p className="p-6 text-gray-500">Please log in to view your cart.</p>;
 if (!cart || cart.products.length === 0)
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-zinc-700  font-zentry text-6xl special-font"><b>y</b>o<b>u</b>r b<b>ag</b> is e<b>mpt</b>y</p>
    </div>
  );

  const subtotal = cart.products.reduce(
    (acc, item) => acc + item.collection.price * item.quantity,
    0
  );

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8" ref={cartRef}>
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        {cart.products.map((item) => (
          <div
            key={item._id}
            className="cart-item flex items-center justify-between border p-4 rounded-lg bg-white shadow-sm"
          >
            <div>
              <p className="font-semibold">{item.collection?.title}</p>
              <p className="text-gray-500">₹{item.collection?.price}</p>
              {item.size && (
                <p className="text-sm text-gray-400">Size: {item.size}</p>
              )}
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={item.collection?.img}
                alt={item.collection?.title || "Product image"}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemove(item._id)}
                disabled={removing === item._id}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border p-6 rounded-lg bg-white shadow-sm h-fit">
        <h2 className="text-lg font-bold mb-4">Cart Totals</h2>
        <div className="flex justify-between mb-2">
          <span>Shipping (3-5 Business Days)</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Tax (Estimated)</span>
          <span>₹0.00</span>
        </div>
        <div className="flex justify-between font-semibold mb-4">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold mb-6">
          <span>Total</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
          Proceed to Checkout
        </button>
        <button className="w-full mt-2 text-gray-600 hover:underline">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
