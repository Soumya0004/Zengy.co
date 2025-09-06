"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface CartProduct {
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

  useEffect(() => {
    const fetchCart = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/cart/get", {
          method: "GET",
          credentials: "include", // send cookies
        });

        const data = await res.json();

        if (data.success) {
          setCart(data.cart);
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

  if (status === "loading" || loading) {
    return <p className="p-6 text-gray-500">Loading cart...</p>;
  }

  if (status === "unauthenticated") {
    return <p className="p-6 text-gray-500">Please log in to view your cart.</p>;
  }

  if (!cart || cart.products.length === 0) {
    return <p className="p-6 text-gray-500">Your cart is empty.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <ul className="space-y-4">
        {cart.products.map((item, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between border p-4 rounded-lg"
          >
            <div>
              <p className="font-semibold">{item.collection?.title}</p>
              <p className="text-gray-500">₹{item.collection?.price}</p>
              {item.size && <p className="text-sm text-gray-400">Size: {item.size}</p>}
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <img
              src={item.collection?.img}
              alt={item.collection?.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
