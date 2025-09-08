"use client";

import axios from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StarIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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
  sizes?: { size: string; stock: number }[];
}

const Page = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try { const res = await axios.get(`/api/products/${id}`); setProduct(res.data); }
      catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!hydrated || loading || !product) return;
    let ctx = gsap.context(() => {
      gsap.set(containerRef.current, { opacity: 0 });
      gsap.set(imgRef.current, { scale: 0.8, opacity: 0 });
      gsap.set(detailsRef.current?.children || [], { y: 30, opacity: 0 });

      const tl = gsap.timeline();
      tl.to(containerRef.current, { opacity: 1, duration: 0.6, ease: "power2.out" })
        .to(imgRef.current, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.4")
        .to(detailsRef.current?.children || [], { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }, "-=0.6");

      gsap.to(imgRef.current, { y: -10, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });

      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current.children, { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: featuresRef.current, start: "top 80%", end: "bottom 20%", toggleActions: "play none none reverse" } });
      }
    });
    return () => ctx.revert();
  }, [hydrated, loading, product]);

  const handleAddToCart = async () => {
    if (!session?.user?.id) { alert("Please login first"); return; }
    if (!product) return;
    setAdding(true);
    try {
      const res = await axios.post("/api/cart/add", {
        userId: session.user.id,
        productId: product._id,
        size: selectedSize,
        quantity: 1,
        price: product.price,
        name: product.title,
      });
      alert("Added to cart!");
      console.log(res.data);
    } catch (err) { console.error(err); alert("Something went wrong. Try again."); }
    finally { setAdding(false); }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="three-body">
        <div className="three-body__dot" />
        <div className="three-body__dot" />
        <div className="three-body__dot" />
      </div>
    </div>
  );

  if (!product) return <p className="p-6">Product not found</p>;

  const totalStock = product.sizes?.reduce((s, p) => s + (p.stock || 0), 0) || product.stock || 0;
  const inStock = totalStock > 0;
  const selectedSizeStock = selectedSize ? product.sizes?.find(s => s.size === selectedSize)?.stock : undefined;

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div ref={imgRef} className="relative">
            <div className="aspect-square rounded-3xl bg-gray-100 p-6 shadow-lg">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                {product.img && <Image src={product.img} alt={product.title} fill className="object-cover" />}
              </div>
            </div>
            {!inStock && <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-sm rounded-lg shadow">Out of Stock</div>}
          </div>

          <div ref={detailsRef} className="space-y-6">
            <div className="flex items-center gap-4">
              {product.category && <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium">{product.category}</span>}
              {product.rating && <div className="flex items-center gap-1 text-yellow-500 font-medium"><StarIcon /> {product.rating}<span className="text-gray-500 text-sm">(128 reviews)</span></div>}
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">{product.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-blue-600">₹{product.price}</span>
              {product.originalPrice && <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>}
            </div>

            {product.sizes?.length > 0 &&
              <div>
                <h3 className="font-medium">Sizes</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {product.sizes.map(s => (
                    <button key={s.size} onClick={() => setSelectedSize(s.size)} disabled={s.stock <= 0} className={`px-3 py-2 rounded-lg border transition flex items-center gap-2 ${selectedSize === s.size ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"} ${s.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <span className="font-medium">{s.size}</span>
                      <span className="text-sm text-gray-500">({s.stock})</span>
                    </button>
                  ))}
                </div>
              </div>
            }

            <p className={`font-medium ${inStock ? "text-green-600" : "text-red-600"}`}>
              {selectedSize ? `${selectedSize} — ${selectedSizeStock ?? 0} available` : inStock ? `In Stock (${totalStock})` : "Out of Stock"}
            </p>

            <div className="flex gap-4 pt-4">
              <button onClick={handleAddToCart} disabled={adding || !inStock || (selectedSize ? (selectedSizeStock ?? 0) <= 0 : false)} className={`flex-1 px-6 py-3 rounded-xl transition ${inStock && (!selectedSize || (selectedSizeStock ?? 0) > 0) ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}>
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <button className="flex-1 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100 transition">Buy Now</button>
            </div>
          </div>
        </div>

        {product.features && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.features.map((feature, index) => (
                <div key={index} className="p-6 rounded-xl bg-gray-50 shadow hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="font-medium text-gray-800">{feature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
