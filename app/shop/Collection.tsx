"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loding from "../Component/Loding";
import Link from "next/link";

// ⚡ Lazy Load Heavy Components
const Card = dynamic(() => import("../Component/Card"), {
  loading: () => <p className="text-center py-10">Loading products...</p>,
  ssr: false,
});

const Magnet = dynamic(() => import("@/components/Magnet"), {
  ssr: false,
});

const ShinyText = dynamic(() => import("@/components/ShinyText"), {
  ssr: false,
});

// ⚡ Lazy Load GSAP Modules
const loadGSAP = async () => {
  const gsapModule = await import("gsap");
  const ScrollTriggerModule = await import("gsap/ScrollTrigger");

  gsapModule.default.registerPlugin(ScrollTriggerModule.ScrollTrigger);
  return gsapModule.default;
};

interface Collection {
  _id: string;
  title: string;
  description?: string;
  price: number | string;
  img: string;
  category?: string;
  rating?: number;
}

const Collection = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch Products
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const res = await axios.get("/api/products/recent");
        const products = Array.isArray(res.data) ? res.data : res.data.products;

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

  // GSAP Animations (Lazy Loaded)
  useEffect(() => {
    const animate = async () => {
      if (!containerRef.current) return;

      const gsap = await loadGSAP();
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    };

    animate();
  }, []);

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
      <Card collections={collections} />

      {/* Explore More */}
      <div className="flex justify-center">
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
