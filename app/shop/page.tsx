"use client";

import React, { useEffect, useState } from "react";
import Card from "../Component/Card";
import axios from "axios";
import Loding from "../Component/Loding";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number | string;   // IMPORTANT FIX
  img: string;
  discount?: number;
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = category
          ? `/api/products/categories/${encodeURIComponent(category)}`
          : "/api/products";

        const res = await axios.get(endpoint);
        const data = Array.isArray(res.data) ? res.data : res.data.products;
        setProducts(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await axios.get(`/api/wishlist/get?userId=${session.user.id}`);
        setWishlist(res.data.map((item: { productId: string }) => item.productId));
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };

    fetchWishlist();
  }, [session]);

  const toggleWishlist = async (productId: string) => {
    if (!session?.user?.id) return;
    const isInWishlist = wishlist.includes(productId);
    try {
      if (isInWishlist) {
        await axios.delete("/api/wishlist/remove", {
          data: { userId: session.user.id, productId },
        });
        setWishlist(wishlist.filter(id => id !== productId));
      } else {
        await axios.post("/api/wishlist/add", {
          userId: session.user.id,
          productId,
        });
        setWishlist([...wishlist, productId]);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  if (loading) return <Loding />;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 md:px-12 lg:px-20">
      <h1 className="font-zentry special-font text-4xl sm:text-5xl lg:text-6xl mb-2 ">S<b>ho</b>p</h1>
      {category ? (
        <p className="text-lg text-slate-600 mb-5">Category: {category}</p>
      ) : (
        <p className="text-lg text-slate-600 mb-5">Browse all products or select a category.</p>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <Card
            key={p._id}
            product={p}
            isInWishlist={wishlist.includes(p._id)}
            onToggleWishlist={session?.user ? toggleWishlist : undefined}
          />
        ))}
      </div>
    </div>
  );
}
