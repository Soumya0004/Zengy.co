"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Card from "./Card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

  // Entry + Exit animations
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Entry animation
    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    // Exit animation (cleanup)
    return () => {
      gsap.to(el, {
        opacity: 0,
        y: -50,
        duration: 0.6,
        ease: "power2.inOut",
      });
    };
  }, []);

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
          Discover the latest additions to our collection crafted with style and
          quality.
        </p>
      </div>

      {/* Recent Products Grid */}
      <div >
              <Card collections={collections}  />

      </div>
    </div>
  );
};

export default Collection;
