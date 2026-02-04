"use client";

import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Loding from "@/app/Component/Loding";

gsap.registerPlugin(ScrollTrigger);

/* ================= TYPES ================= */

interface SizeStock {
  size: string;
  stock: number;
}

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  img?: string;
  category?: string;
  rating?: number;
  features?: string[];
  originalPrice?: number;
  stock?: number;
  sizes?: SizeStock[];
}

/* ================= PAGE ================= */

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/api/products/${productId}`, {
          headers: { "Cache-Control": "no-store" },
        });

        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  /* ================= FETCH SIMILAR ================= */

  useEffect(() => {
    if (!productId) return;

    const fetchSimilar = async () => {
      try {
        const res = await axios.get(`/api/products/${productId}/similar`, {
          headers: { "Cache-Control": "no-store" },
        });

        setSimilar(res.data || []);
      } catch (err) {
        console.error("Similar products error:", err);
      }
    };

    fetchSimilar();
  }, [productId]);

  /* ================= GSAP ================= */

  useEffect(() => {
    if (!product || loading) return;

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, { opacity: 0, duration: 0.5 });

      gsap.from(imgRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
      });

      gsap.from(detailsRef.current?.children || [], {
        y: 30,
        opacity: 0,
        stagger: 0.1,
      });
    });

    return () => ctx.revert();
  }, [loading, product]);

  /* ================= STOCK ================= */

  const totalStock = useMemo(() => {
    return (
      product?.sizes?.reduce((sum, s) => sum + s.stock, 0) ??
      product?.stock ??
      0
    );
  }, [product]);

  const selectedStock = useMemo(() => {
    return (
      product?.sizes?.find((s) => s.size === selectedSize)?.stock ??
      totalStock
    );
  }, [product, selectedSize, totalStock]);

  const inStock = totalStock > 0;

  /* ================= VALIDATION ================= */

  const validatePurchase = () => {
    if (!session?.user?.id) {
      alert("Please login first");
      return false;
    }

    if (!product) return false;

    if (product.sizes?.length && !selectedSize) {
      alert("Please select a size");
      return false;
    }

    if (selectedStock <= 0) {
      alert("Out of stock");
      return false;
    }

    return true;
  };

  /* ================= ADD TO CART ================= */

  const handleAddToCart = async () => {
    if (!validatePurchase()) return;

    try {
      setAdding(true);

      await axios.post("/api/cart/add", {
        userId: session?.user?.id,
        productId: product?._id,
        size: selectedSize,
        quantity: 1,
      });

      alert("Added to cart!");
    } finally {
      setAdding(false);
    }
  };

  /* ================= BUY NOW ================= */

  const handleBuyNow = async () => {
    if (!validatePurchase()) return;

    try {
      setBuying(true);

      await axios.post("/api/cart/add", {
        userId: session?.user?.id,
        productId: product?._id,
        size: selectedSize,
        quantity: 1,
      });

      router.push("/cart");
    } finally {
      setBuying(false);
    }
  };

  /* ================= UI ================= */

  if (loading) return <Loding />;
  if (!product) return null;

  const canAdd =
    inStock &&
    (!product.sizes || (selectedSize && selectedStock > 0));

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* ================= MAIN GRID ================= */}
        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* ================= LEFT IMAGE ================= */}
          <div ref={imgRef} className="space-y-4">

            <div className="bg-white rounded-3xl shadow-sm p-10 flex items-center justify-center">
              <Image
                src={product.img || "/placeholder.png"}
                alt={product.title}
                width={700}
                height={700}
                priority
                className="max-h-[500px] object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* ================= RIGHT DETAILS ================= */}
          <div ref={detailsRef} className="space-y-6">

            {product.category && (
              <span className="inline-block text-xs bg-gray-200 px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}

            <h1 className="text-4xl font-semibold">
              {product.title}
            </h1>

            <span className="text-3xl font-bold">
              ₹{product.price}
            </span>

            {/* Sizes */}
            {(product.sizes?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 font-medium">Select Size</p>

                <div className="flex gap-3 flex-wrap">
                  {product.sizes?.map((s) => (
                    <button
                      key={s.size}
                      disabled={s.stock <= 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-5 py-2 rounded-full border ${
                        selectedSize === s.size
                          ? "bg-black text-white"
                          : ""
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className={inStock ? "text-green-600" : "text-red-500"}>
              {selectedStock} available
            </p>

            <button
              onClick={handleAddToCart}
              disabled={!canAdd || adding}
              className="w-full bg-black text-white py-4 rounded-full"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!canAdd || buying}
              className="w-full border py-4 rounded-full"
            >
              {buying ? "Processing..." : "Buy Now"}
            </button>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold mb-2">Description & Fit</h3>
                <p className="text-gray-600 text-sm">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= SIMILAR PRODUCTS ================= */}
        {similar.length > 0 && (
          <div className="mt-20">
            <h2 className="font-zentry special-font text-4xl sm:text-5xl lg:text-6xl mb-10">
              S<b>im</b><b>il</b><b>ar</b> Pr<b>o</b>duc<b>t</b>s
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {similar.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    router.push(`/product/${item._id}`);
                    window.scrollTo({ top: 0 });
                  }}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition"
                >
                  <Image
                    src={item.img || "/placeholder.png"}
                    alt={item.title}
                    width={250}
                    height={250}
                    className="rounded-xl object-cover"
                  />

                  <p className="text-sm text-gray-500 mt-2">
                    {item.category}
                  </p>

                  <p className="font-medium truncate">
                    {item.title}
                  </p>

                  <p className="font-semibold mt-1">
                    ₹{item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
