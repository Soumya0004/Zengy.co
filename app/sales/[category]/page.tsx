"use client";

import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import Card from "@/app/Component/Card";
import Loding from "@/app/Component/Loding";

interface Product {
  _id: string;
  title: string;
  price: number;
  img?: string;
  category?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    if (!category) return;

    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/products/categories/${encodeURIComponent(category)}`,
          { params: { page, limit: 24 }, signal: controller.signal }
        );

        setProducts(res.data?.products || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Category fetch error:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [category, page]);

  if (loading) return <Loding />;

  return (
    <div className="px-6 py-16">
      <h1 className="text-4xl font-bold mb-10 capitalize">
        {category} Products
      </h1>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product._id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded border border-black px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded border border-black px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}