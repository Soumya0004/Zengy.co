"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
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

interface CardProps {
  collections: Collection[];
}

const Card = ({ collections }: CardProps) => {
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLDivElement;

            gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power3.out",
            });

            observerRef.current?.unobserve(card);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((card) => {
      if (card) {
        gsap.set(card, { opacity: 0, y: 50, scale: 0.9 });
        observerRef.current?.observe(card);
      }
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
      {collections.map((item) => (
        <div
          key={item._id}
          ref={(el) => {
            if (el && !cardRefs.current.includes(el)) {
              cardRefs.current.push(el);
            }
          }}
          className="relative group h-72 sm:h-80 md:h-96 rounded-md overflow-hidden shadow-md"
        >
          <Image
            src={item.img}
            alt={item.title}
            fill
            loading="lazy"
            className="object-cover"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-zinc-800/40 backdrop-blur-md flex flex-col items-center justify-center 
          opacity-0 group-hover:opacity-100 transition duration-500 font-robert-medium">
            <h2 className="text-white text-lg sm:text-xl">{item.title}</h2>
            <p className="text-white font-semibold mt-1">₹ {item.price}</p>

            <Link href={`/shop/${item._id}`}>
              <button className="mt-3 px-4 py-2 bg-white text-zinc-800 rounded-lg font-medium hover:bg-zinc-800 hover:text-white transition">
                Shop Now
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
