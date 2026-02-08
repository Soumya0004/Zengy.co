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

  // ❤️ Wishlist
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

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
        const res = await axios.get(
          `/api/products/${productId}/similar`,
          { headers: { "Cache-Control": "no-store" } }
        );
        setSimilar(res.data || []);
      } catch (err) {
        console.error("Similar products error:", err);
      }
    };

    fetchSimilar();
  }, [productId]);

  /* ================= CHECK WISHLIST ================= */

  useEffect(() => {
    if (!session?.user?.id || !product?._id) return;

    const checkWishlist = async () => {
      try {
        const res = await axios.get(
          `/api/wishlist/get?userId=${session.user.id}`
        );

        const exists = res.data.some(
          (item: any) => item.productId === product._id
        );

        setWishlisted(exists);
      } catch (err) {
        console.error("Wishlist check failed", err);
      }
    };

    checkWishlist();
  }, [session?.user?.id, product?._id]);

  /* ================= GSAP ================= */

  useEffect(() => {
    if (!product || loading) return;

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, { opacity: 0, duration: 0.5 });
      gsap.from(imgRef.current, { scale: 0.9, opacity: 0, duration: 0.6 });
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

  /* ================= TOGGLE WISHLIST ================= */

  const toggleWishlist = async () => {
    if (!session?.user?.id) {
      alert("Please login to use wishlist");
      return;
    }

    try {
      setWishlistLoading(true);

      if (wishlisted) {
        await axios.delete("/api/wishlist/remove", {
          data: {
            userId: session.user.id,
            productId: product?._id,
          },
        });
        setWishlisted(false);
      } else {
        await axios.post("/api/wishlist/add", {
          userId: session.user.id,
          productId: product?._id,
        });
        setWishlisted(true);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistLoading(false);
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

        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* IMAGE */}
          <div ref={imgRef}>
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
          </div>

          {/* DETAILS */}
          <div ref={detailsRef} className="space-y-6">

            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-semibold">
                {product.title}
              </h1>

              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className="p-3 rounded-full border hover:scale-110 transition cursor-pointer"
              >
                <Heart
                  size={28}
                  className={
                    wishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-gray-500"
                  }
                />
              </button>
            </div>

            <span className="text-3xl font-bold">
              ₹{product.price}
            </span>

            {(product.sizes?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 font-medium">Select Size</p>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes?.map((s) => (
                    <button
                      key={s.size}
                      disabled={s.stock <= 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-5 py-2 rounded-full cursor-pointer border ${
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
              className="w-full bg-black text-white py-4 rounded-full cursor-pointer"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!canAdd || buying}
              className="w-full border py-4 rounded-full cursor-pointer"
            >
              {buying ? "Processing..." : "Buy Now"}
            </button>

            {product.description && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold mb-2">
                  Description & Fit
                </h3>
                <p className="text-gray-600 text-sm">
                  {product.description}
                </p>
              </div>
            )}
            

          </div>
        </div>
      </div>
    </div>
  );
}
