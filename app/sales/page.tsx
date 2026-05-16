"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import Loding from "@/app/Component/Loding";
import Image from "next/image";

interface Product {
  _id: string;
  category?: string;
}

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        const items: Product[] = res.data?.products || [];
        setProducts(items);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <Loding />;

  const categories = [
    "All",
    ...Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter((c): c is string => Boolean(c))
      )
    ),
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] relative overflow-hidden">

      {/* 🌈 BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-200 blur-3xl opacity-30 rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-200 blur-3xl opacity-30 rounded-full"></div>

      {/* 🔥 HERO SECTION */}
      <section className="text-center py-24 px-6 relative z-10">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
          <span className="text-red-500">SALE</span> COLLECTION
        </h1>

        <p className="text-gray-500 mt-6 max-w-xl mx-auto text-lg">
          Limited-time deals on premium fashion. Grab your favorites before they’re gone.
        </p>

        <Link href="/shop">
          <button className="mt-8 px-8 py-3 bg-black text-white rounded-full hover:scale-105 transition">
            Shop Now
          </button>
        </Link>
      </section>

      {/* 🏷 CATEGORY SECTION */}
      <section className="px-6 sm:px-10 lg:px-20 pb-20 relative z-10">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Browse by Category
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={
                cat === "All"
                  ? "/shop"
                  : `/shop?category=${encodeURIComponent(cat)}`
              }
            >
              <span className="px-6 py-2 rounded-full text-sm font-medium 
              bg-white/70 backdrop-blur-md border border-gray-200 
              shadow-md hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 🔥 FEATURED SALE CARDS */}
      <section className="px-6 sm:px-10 lg:px-20 pb-24 relative z-10">
        <h2 className="text-2xl font-semibold mb-10 text-center">
          Hot Deals 🔥
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {/* CARD 1 */}
          <div className="relative rounded-3xl overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
              className="w-full h-[350px] object-cover group-hover:scale-110 transition duration-500"
              alt="Sale Item 1"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-bold">Up to 50% Off</h3>
              <Link href="/shop">
                <button className="mt-2 text-sm underline">
                  Explore
                </button>
              </Link>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="relative rounded-3xl overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
              className="w-full h-[350px] object-cover group-hover:scale-110 transition duration-500"
              alt="Trending Items"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-bold">Trending Now</h3>
              <Link href="/shop">
                <button className="mt-2 text-sm underline">
                  Explore
                </button>
              </Link>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="relative rounded-3xl overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c"
              className="w-full h-[350px] object-cover group-hover:scale-110 transition duration-500"
              alt="New Arrivals"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-bold">New Arrivals</h3>
              <Link href="/shop">
                <button className="mt-2 text-sm underline">
                  Explore
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}