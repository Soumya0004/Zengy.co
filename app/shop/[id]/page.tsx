"use client";

import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import Loding from "@/app/Component/Loding";
import Card from "@/app/Component/Card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  rating?: number;
  discount?: number;
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
  const similarRef = useRef<HTMLDivElement>(null);

  /* ================= RESET ================= */

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
        const res = await axios.get(`/api/products/${productId}`);
        console.log('Fetched product:', res.data);
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

    axios
      .get(`/api/products/${productId}/similar`)
      .then((res) => setSimilar(res.data || []))
      .catch(console.error);
  }, [productId]);

  /* ================= DEFAULT SIZE ================= */

  useEffect(() => {
    if (product?.sizes?.length === 1) {
      setSelectedSize(product.sizes[0].size);
    }
  }, [product]);

  /* ================= STOCK LOGIC ================= */

  const totalStock = useMemo(
    () => product?.sizes.reduce((s, x) => s + x.stock, 0) || 0,
    [product]
  );

  const selectedStock = useMemo(
    () =>
      product?.sizes.find((s) => s.size === selectedSize)?.stock || 0,
    [product, selectedSize]
  );

  const hasVariants = (product?.sizes?.length ?? 0) > 1;
  const inStock = totalStock > 0;

  const canAdd =
    inStock &&
    (!hasVariants || (selectedSize && selectedStock > 0));

  useEffect(() => {
    console.log('Stock debug:', {
      totalStock,
      selectedStock,
      selectedSize,
      hasVariants,
      inStock,
      canAdd,
      sizes: product?.sizes
    });
  }, [totalStock, selectedStock, selectedSize, hasVariants, inStock, canAdd, product?.sizes]);

  /* ================= ANIMATION ================= */

  useEffect(() => {
    if (!product) return;

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, { opacity: 0, duration: 0.6 });
      gsap.from(imgRef.current, { scale: 0.95, opacity: 0, duration: 0.6 });
      gsap.from(detailsRef.current?.children || [], {
        y: 20,
        opacity: 0,
        stagger: 0.08,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [product]);

  /* ================= VALIDATION ================= */

  const validate = () => {
    if (!session?.user?.id) {
      alert("Please login first");
      return false;
    }
    if (hasVariants && !selectedSize) {
      alert("Please select a size");
      return false;
    }
    if (selectedStock <= 0) {
      alert("Out of stock");
      return false;
    }
    return true;
  };

  /* ================= ACTIONS ================= */

  const addToCart = async () => {
    if (!validate()) return;

    const priceToUse = product
      ? Math.round(product.price * (1 - (product.discount ?? 0) / 100))
      : 0;

    try {
      setAdding(true);
      await axios.post("/api/cart/add", {
        userId: session?.user?.id,
        productId: product?._id,
        size: selectedSize,
        quantity: 1,
        price: priceToUse,
        name: product?.title,
      });
      alert("Added to cart");
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const buyNow = async () => {
    if (!validate()) return;

    const priceToUse = product
      ? Math.round(product.price * (1 - (product.discount ?? 0) / 100))
      : 0;

    try {
      setBuying(true);
      await axios.post("/api/cart/add", {
        userId: session?.user?.id,
        productId: product?._id,
        size: selectedSize,
        quantity: 1,
        price: priceToUse,
        name: product?.title,
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
    <div ref={containerRef} className="bg-gray-50 min-h-screen py-28">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* IMAGE */}
          <div ref={imgRef} className="bg-white rounded-3xl p-10 shadow-sm">
            <Image
              src={product.img || "/placeholder.png"}
              alt={product.title}
              width={600}
              height={600}
              className="rounded-2xl object-cover w-full h-[32rem] hover:scale-105 transition"
            />
          </div>

          {/* DETAILS */}
          <div
            ref={detailsRef}
            className="lg:sticky lg:top-24 bg-white rounded-3xl p-10 shadow-sm space-y-6"
          >
            {product.rating && (
              <span className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-sm">
                ⭐ {product.rating} / 5
              </span>
            )}

            <h1 className="text-4xl font-semibold">{product.title}</h1>

            <div>
              {product.discount && product.discount > 0 ? (
                <>
                  <p className="text-4xl font-bold">
                    ₹{Math.round(product.price * (1 - product.discount / 100))}
                  </p>
                  <p className="text-sm text-gray-400 line-through">
                    ₹{product.price}
                  </p>
                  <p className="text-sm text-red-600 font-semibold">
                    Save {Math.round(product.discount)}%
                  </p>
                </>
              ) : (
                <p className="text-4xl font-bold">₹{product.price}</p>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}

            {hasVariants && (
              <div>
                <p className="font-medium mb-3">Select Size</p>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      disabled={s.stock <= 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`px-6 py-2 rounded-full border transition ${
                        selectedSize === s.size
                          ? "bg-black text-white"
                          : "hover:border-black"
                      } disabled:opacity-40`}
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
              {inStock
                ? hasVariants && !selectedSize
                  ? "Select a size"
                  : `${selectedStock} available`
                : "Out of stock"}
            </p>

            {/* DESKTOP BUTTONS */}
            {canAdd && (
              <>
                <button
                  onClick={addToCart}
                  disabled={adding}
                  className="w-full bg-black text-white py-4 rounded-xl hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  onClick={buyNow}
                  disabled={buying}
                  className="w-full border py-4 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
                >
                  {buying ? "Processing..." : "Buy Now"}
                </button>
              </>
            )}

           
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div ref={similarRef} className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold mb-8">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similar.map((prod) => (
              <Card key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* MOBILE FIXED ACTION BAR */}
      {canAdd && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-4 flex gap-3 lg:hidden">
          <button
            onClick={addToCart}
            disabled={adding}
            className="flex-1 bg-black text-white py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          <button
            onClick={buyNow}
            disabled={buying}
            className="flex-1 border py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {buying ? "Processing..." : "Buy Now"}
          </button>
        </div>
      )}
    </div>
  );
}