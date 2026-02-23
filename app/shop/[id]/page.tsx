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
  sizes: SizeStock[];
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

  /* ================= RESET ON NAVIGATION ================= */

  useEffect(() => {
    setSelectedSize(null);
    setAdding(false);
    setBuying(false);
  }, [productId]);

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
        console.error("Product fetch error:", err);
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
        const res = await axios.get(`/api/products/${productId}/similar`);
        setSimilar(res.data || []);
      } catch (err) {
        console.error("Similar products error:", err);
      }
    };

    fetchSimilar();
  }, [productId]);

  /* ================= AUTO SELECT DEFAULT SIZE ================= */

  useEffect(() => {
    if (!product?.sizes) return;

    // Simple product → auto select
    if (product.sizes.length === 1) {
      setSelectedSize(product.sizes[0].size);
    }
  }, [product]);

  /* ================= STOCK LOGIC (FIXED) ================= */

  const totalStock = useMemo(() => {
    return product?.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
  }, [product]);

  const selectedStock = useMemo(() => {
    return (
      product?.sizes?.find((s) => s.size === selectedSize)?.stock || 0
    );
  }, [product, selectedSize]);

  const inStock = totalStock > 0;

  const hasVariants = (product?.sizes?.length ?? 0) > 1;

  const canAdd =
    inStock &&
    (!hasVariants || (selectedSize !== null && selectedStock > 0));

  /* ================= GSAP ================= */

  useEffect(() => {
    if (!product || loading) return;

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 0.5,
      });

      if (imgRef.current) {
        gsap.from(imgRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.6,
        });
      }

      if (detailsRef.current?.children) {
        gsap.from(detailsRef.current.children, {
          y: 20,
          opacity: 0,
          stagger: 0.1,
          duration: 0.4,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [product, loading]);

  /* ================= VALIDATION ================= */

  const validatePurchase = () => {
    if (!session?.user?.id) {
      alert("Please login first");
      return false;
    }

    if (!product) return false;

    if (product.sizes.length > 1 && !selectedSize) {
      alert("Please select a size");
      return false;
    }

    if (selectedStock <= 0) {
      alert("Out of stock");
      return false;
    }

    return true;
  };

  /* ================= HANDLERS ================= */

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
      alert("Added to cart");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

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
      router.push("/Cart");
    } catch (err) {
      console.error(err);
    } finally {
      setBuying(false);
    }
  };

  /* ================= UI ================= */

  if (loading) return <Loding />;
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
      </div>
    );

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          {/* IMAGE */}
          <div ref={imgRef}>
            <div className="bg-white rounded-3xl px-10 flex justify-center items-center">
              <Image
                src={product.img || "/placeholder.png"}
                alt={product.title}
                width={600}
                height={300}
                className="rounded-2xl object-cover h-[30rem] w-full"
              />
            </div>
          </div>

          {/* DETAILS */}
          <div ref={detailsRef} className="space-y-6">
            <h1 className="text-4xl font-semibold">{product.title}</h1>

            {product.rating && (
              <p className="text-sm text-gray-500 mt-1">Rating: {product.rating}/5</p>
            )}

            <p className="text-3xl font-bold">₹{product.price}</p>

            {product.description && (
              <p className="text-gray-600 mt-2">{product.description}</p>
            )}
            {hasVariants && (
              <div>
                <p className="font-medium mb-2">Select Size</p>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      disabled={s.stock <= 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-5 py-2 rounded-full border transition ${
                        selectedSize === s.size
                          ? "bg-black text-white"
                          : "bg-white hover:border-black"
                      } disabled:opacity-50`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p
              className={`font-medium ${
                inStock ? "text-green-600" : "text-red-500"
              }`}
            >
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

          </div>
        </div>

        {/* SIMILAR PRODUCTS */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((prod) => (
                <div key={prod._id} className="bg-white rounded-xl p-4 hover:shadow-lg transition">
                  <Image
                    src={prod.img || "/placeholder.png"}
                    alt={prod.title}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover w-full h-48"
                  />
                  <h3 className="font-medium mt-2 text-sm">{prod.title}</h3>
                  <p className="text-lg font-bold">₹{prod.price}</p>
                  <button
                    onClick={() => router.push(`/shop/${prod._id}`)}
                    className="mt-2 w-full bg-gray-100 py-2 rounded hover:bg-gray-200 transition"
                  >
                    View Product
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}