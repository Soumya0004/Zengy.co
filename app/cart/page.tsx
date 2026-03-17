"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import axios from "axios";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Loding from "../Component/Loding";

// ⚡ Lazy Load RazorpayButton
const RazorpayButton = dynamic(() => import("@/components/RazorpayButton"), {
  loading: () => (
    <p className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 text-center">
      Loading Payment...
    </p>
  ),
  ssr: false,
});

interface CartProduct {
  _id: string; // cart item ID
  collection: {
    _id: string; // actual product ID
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
  const { status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // Fetch Cart
  useEffect(() => {
    const fetchCart = async () => {
      if (status !== "authenticated") return;
      try {
        const res = await axios.get("/api/cart/get", { withCredentials: true });
        if (res.data.success) {
          setCart(res.data.cart);
        } else {
          setCart({ _id: "", products: [], status: "Pending" });
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [status]);

  // GSAP Animation
  useEffect(() => {
    if (cartRef.current && cart?.products?.length) {
      gsap.fromTo(
        cartRef.current.querySelectorAll(".cart-item"),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: "power3.out" }
      );
    }
  }, [cart]);

  const handleRemove = async (itemId: string) => {
    try {
      setRemoving(itemId);
      const res = await axios.post("/api/cart/itemRemove", {
        cartId: cart?._id,
        productId: itemId,
      });

      if (res.data.success) {
        setCart(res.data.cart);
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
        <p className="text-zinc-700 font-zentry text-6xl special-font">
          <b>y</b>o<b>u</b>r b<b>ag</b> is e<b>mpt</b>y
        </p>
      </div>
    );

  const subtotal = cart.products.reduce(
    (acc, item) => acc + item.collection.price * item.quantity,
    0
  );

  // 🔹 FIXED: Send correct productId to backend
  const productsForPayment = cart.products.map((item) => ({
    productId: item.collection._id, // ✅ actual product ID for stock update
    size: item.size,
    quantity: item.quantity,
    price: item.collection.price,
    name: item.collection.title,
  }));

 return (

  <div
    ref={cartRef}
    className="min-h-screen pt-28 pb-10 px-12  bg-zinc-50 grid grid-cols-1 md:grid-cols-3 gap-10
    "
  >
    {/* LEFT SIDE */}
    <div className="md:col-span-2 space-y-6">

  <h1 className="font-zentry special-font text-4xl sm:text-5xl lg:text-6xl mb-6">
    Y<b>o</b>u<b>r</b> C<b>a</b>r<b>t</b>
  </h1>

  {cart.products.map((item) => (
    <div
      key={item._id}
      className="cart-item flex items-center justify-between border p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition"
    >
      <div>
        <p className="font-semibold text-lg">
          {item.collection?.title}
        </p>

        <p className="text-gray-500">
          ₹{item.collection?.price}
        </p>

        {item.size && (
          <p className="text-sm text-gray-400">
            Size: {item.size}
          </p>
        )}

        <p className="text-sm text-gray-500">
          Qty: {item.quantity}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <Image
          src={item.collection?.img}
          alt={item.collection?.title || "Product image"}
          width={70}
          height={70}
          className="w-18 h-18 object-cover rounded-lg"
        />

        <button
          onClick={() => handleRemove(item._id)}
          disabled={removing === item._id}
          className="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
        >
          <Trash2 size={22} />
        </button>
      </div>
    </div>
  ))}
</div>

{/* RIGHT SIDE */}
<div className="border p-7 rounded-xl bg-white shadow-sm h-fit sticky top-28">

  <h2 className="text-xl font-bold mb-5">
    Cart Totals
  </h2>

  <div className="flex justify-between mb-3">
    <span>Shipping (3-5 Days)</span>
    <span>Free</span>
  </div>

  <div className="flex justify-between mb-3">
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

  <RazorpayButton
    amount={subtotal}
    cartId={cart._id}
    products={productsForPayment}
  />

  <button className="w-full mt-3 text-gray-600 hover:underline cursor-pointer">
    Continue Shopping
  </button>
</div>

  </div>
);

}
