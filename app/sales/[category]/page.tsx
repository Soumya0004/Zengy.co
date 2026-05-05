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

  useEffect(() => {
    if (!category) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/api/products/categories/${category}`);

        setProducts(res.data?.products || []);
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

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
    </div>
  );
}