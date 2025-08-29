"use client";

import Image from "next/image";
import Link from "next/link"; // 👈 import Link
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

  useEffect(() => {
    // Scroll animation
    cardRefs.current.forEach((card, i) => {
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Hover animation
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      }
    });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
      {collections.map((item, index) => (
        <div
          key={item._id}
          ref={(el) => {
            if (el) cardRefs.current[index] = el;
          }}
          className="relative group h-72 sm:h-80 md:h-96 rounded-md overflow-hidden shadow-md "
        >
          <Image src={item.img} alt={item.title} fill className="object-cover" />

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 bg-zinc-800/40 backdrop-blur-md flex flex-col items-center justify-center 
              opacity-0 group-hover:opacity-100 transition duration-500 font-robert-medium"
          >
            <h2 className="text-white text-lg sm:text-xl">{item.title}</h2>
            <p className="text-white font-semibold mt-1">₹ {item.price}</p>

            {/* Link to /shop/[id] */}
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
