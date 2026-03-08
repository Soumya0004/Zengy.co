"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import Loding from "@/app/Component/Loding";

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
    <div className="min-h-screen py-16 px-4 sm:px-8 lg:px-16">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-red-500">Sale</span> — limited time deals
        </h1>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={cat === "All" ? "/shop" : `/shop?category=${encodeURIComponent(cat)}`}
              className="inline-flex"
            >
              <span className="px-4 py-2 rounded-full text-sm font-semibold transition bg-white text-gray-700 hover:bg-gray-100">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </header>

      <div className="text-center py-32">
        <p className="text-xl font-semibold">Select a category to view it in the shop.</p>
        <p className="text-gray-500 mt-2">
          Click a category above to open the shop section filtered to that category.
        </p>
      </div>
    </div>
  );
}
