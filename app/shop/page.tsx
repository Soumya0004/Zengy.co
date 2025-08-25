
"use client"
import React, { useEffect, useState } from 'react'
import Card from '../Component/Card';
import axios from 'axios';
interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number | string;
  img: string;
  category?: string;
  rating?: number;
}
const page = () => {
    const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/products");
            const data= Array.isArray(res.data) ? res.data : res.data.products;
            setProducts(data || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setProducts([]);
        }finally{
          setLoading(false);
        }
    }
  fetchProducts();
  }, [])
if (loading) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="three-body">
        <div className="three-body__dot" />
        <div className="three-body__dot" />
        <div className="three-body__dot" />
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 md:px-12 lg:px-20">
      <h1 className="font-zentry special-font text-4xl sm:text-5xl lg:text-6xl mb-10">
        <b>S</b>hop
      </h1>

      {products.length > 0 ? (
        <Card collections={products} />
      ) : (
        <p className="text-center text-gray-500">No products available.</p>
      )}
    </div>
  )
}

export default page