"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loding from "../Component/Loding";
import Link from "next/link";
import { useSession } from "next-auth/react";

/* ---------- TYPES ---------- */
interface Collection {
  _id: string;
  title: string;
  description?: string;
  price: number | string;
  img?: string;
  category?: string;
  rating?: number;
}

/* ---------- Lazy Load Components ---------- */
const Card = dynamic<any>(() => import("../Component/Card"), {
  loading: () => (
    <div className="h-[300px] bg-gray-100 rounded-2xl animate-pulse" />
  ),
  ssr: false,
});

const Magnet = dynamic(() => import("@/components/Magnet"), { ssr: false });
const ShinyText = dynamic(() => import("@/components/ShinyText"), { ssr: false });

/* ---------- GSAP Loader ---------- */
const loadGSAP = async () => {
  const gsapModule = await import("gsap");
  const ScrollTriggerModule = await import("gsap/ScrollTrigger");
  gsapModule.default.registerPlugin(ScrollTriggerModule.ScrollTrigger);
  return gsapModule.default;
};

const Collection = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();

  /* ---------- FETCH ---------- */
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const res = await axios.get("/api/products/recent");
        const products = Array.isArray(res.data)
          ? res.data
          : res.data?.products;

        setCollections(products || []);
      } catch (err) {
        console.error("Failed to fetch recent products:", err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await axios.get(`/api/wishlist/get?userId=${session.user.id}`);
        setWishlist(res.data.map((item: any) => item.productId));
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };

    fetchWishlist();
  }, [session]);

  const toggleWishlist = async (productId: string) => {
    if (!session?.user?.id) return;
    const isInWishlist = wishlist.includes(productId);
    try {
      if (isInWishlist) {
        await axios.delete("/api/wishlist/remove", {
          data: { userId: session.user.id, productId },
        });
        setWishlist(wishlist.filter(id => id !== productId));
      } else {
        await axios.post("/api/wishlist/add", {
          userId: session.user.id,
          productId,
        });
        setWishlist([...wishlist, productId]);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  /* ---------- GSAP ---------- */
  useEffect(() => {
    if (!containerRef.current || loading) return;

    const animate = async () => {
      const gsap = await loadGSAP();
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    };

    animate();
  }, [loading]);

  if (loading) return <Loding />;

  return (
    <div
      ref={containerRef}
      className="min-h-full px-4 sm:px-8 md:px-12 lg:px-20 py-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-0">
        <h1 className="font-zentry special-font text-4xl sm:text-5xl lg:text-6xl">
          R<b>e</b>c<b>e</b>n<b>t</b> pr<b>o</b>d<b>u</b>c<b>t</b>s
        </h1>
        <p className="md:w-2/5 font-robert-medium text-sm sm:text-base lg:text-lg">
          Discover the latest additions to our collection crafted with style and quality.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {collections.map((item) => (
          <Card
            key={item._id}
            product={item}
            isInWishlist={wishlist.includes(item._id)}
            onToggleWishlist={session?.user ? toggleWishlist : undefined}
          />
        ))}
      </div>

      {/* Explore More */}
      <div className="flex justify-center mt-10">
        <Magnet padding={50} disabled={false} magnetStrength={10}>
          <Link
            href="/shop"
            className="mt-4 text-center text-sm md:text-md lg:text-lg text-black px-3 py-1 rounded-lg font-medium duration-300 group relative"
          >
            <ShinyText text="Explore more" disabled={false} speed={3} />
            <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-zinc-900 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </Link>
        </Magnet>
      </div>
    </div>
  );
};

export default Collection;
