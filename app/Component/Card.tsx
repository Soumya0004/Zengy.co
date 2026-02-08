"use client";

import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart } from "lucide-react";
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

  const [wishlisted, setWishlisted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

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
      const res = await axios.get(`/api/products/${productId}/similar`);
      setSimilar(res.data || []);
    };

    fetchSimilar();
  }, [productId]);

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

  /* ================= CART ================= */

  const handleAddToCart = async () => {
    if (!session?.user?.id) return alert("Login first");

    setAdding(true);

    await axios.post("/api/cart/add", {
      userId: session.user.id,
      productId: product?._id,
      size: selectedSize,
      quantity: 1,
    });

    setAdding(false);
    alert("Added to cart!");
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  /* ================= UI ================= */

  if (loading) return <Loding />;
  if (!product) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">

      {/* ================= MAIN PRODUCT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* IMAGE */}
          <div className="bg-white rounded-3xl shadow-sm p-10 flex justify-center">
            <Image
              src={product.img || "/placeholder.png"}
              alt={product.title}
              width={700}
              height={700}
              priority
              className="rounded-2xl object-cover max-h-[500px]"
            />
          </div>

          {/* DETAILS */}
          <div className="space-y-6">

            <h1 className="text-4xl font-semibold">{product.title}</h1>

            <span className="text-3xl font-bold">
              ₹{product.price}
            </span>

            {product.sizes?.length ? (
              <div>
                <p className="mb-2 font-medium">Select Size</p>

                <div className="flex gap-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
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
            ) : null}

            <p className={inStock ? "text-green-600" : "text-red-500"}>
              {selectedStock} available
            </p>

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full bg-black text-white py-4 rounded-full"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={buying}
              className="w-full border py-4 rounded-full"
            >
              Buy Now
            </button>

            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* ================= FULL WIDTH SIMILAR PRODUCTS ================= */}

      {similar.length > 0 && (
        <div className="bg-white py-16 border-t">

          <div className="max-w-7xl mx-auto px-6">

            <h2 className="text-3xl font-semibold mb-10">
              Similar Products
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

              {similar.map((item) => (
                <div
                  key={item._id}
                  onClick={() => router.push(`/products/${item._id}`)}
                  className="cursor-pointer group"
                >
                  <div className="bg-gray-50 rounded-2xl p-4 shadow-sm group-hover:shadow-lg transition">

                    <Image
                      src={item.img || "/placeholder.png"}
                      alt={item.title}
                      width={400}
                      height={400}
                      className="rounded-xl object-cover h-[220px] w-full"
                    />

                    <h3 className="mt-3 font-medium line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="font-semibold mt-1">
                      ₹{item.price}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}