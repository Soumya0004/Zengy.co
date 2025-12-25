"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Explore = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Skeleton load states
  const [videoLoaded, setVideoLoaded] = useState([false, false]);
  const [imageLoaded, setImageLoaded] = useState([false, false]);

  // Helper for refs
  const addToRefs = (el: HTMLDivElement | null, i: number) => {
    if (el && !cardsRef.current[i]) {
      cardsRef.current[i] = el;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate each card individually
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          y: 100,
          opacity: 0,
          duration: 1,
          delay: i * 0.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Animate whole section on exit
      gsap.fromTo(
        containerRef.current,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -100,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="px-6 md:px-12 py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        {/* ---------------- VIDEO CARD 1 ---------------- */}
        <div
          ref={(el) => addToRefs(el, 0)}
          className="relative rounded-xl overflow-hidden shadow-md group h-[300px] md:h-[565px] w-full"
        >
          {/* Skeleton */}
          {!videoLoaded[0] && (
            <div className="w-full h-full bg-gray-300 animate-pulse absolute inset-0" />
          )}

          <video
            src="/get.mp4"
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() =>
              setVideoLoaded((prev) => [true, prev[1]])
            }
            className={`object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 ${
              videoLoaded[0] ? "opacity-100" : "opacity-0"
            }`}
          />

          <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-zinc-800 px-4 py-2 rounded-md font-medium shadow hover:bg-gray-100">
            Explore Now
          </button>
        </div>

        {/* ---------------- VIDEO CARD 2 ---------------- */}
        <div
          ref={(el) => addToRefs(el, 1)}
          className="relative rounded-xl overflow-hidden shadow-md group h-[300px] md:h-[565px] w-full"
        >
          {/* Skeleton */}
          {!videoLoaded[1] && (
            <div className="w-full h-full bg-gray-300 animate-pulse absolute inset-0" />
          )}

          <video
            src="/video2.mp4"
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() =>
              setVideoLoaded((prev) => [prev[0], true])
            }
            className={`object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 ${
              videoLoaded[1] ? "opacity-100" : "opacity-0"
            }`}
          />

          <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-zinc-800 px-4 py-2 rounded-md font-medium shadow hover:bg-gray-100">
            Explore Now
          </button>
        </div>

        {/* ---------------- RIGHT SIDE IMAGES ---------------- */}
        <div className="flex flex-col gap-6" ref={(el) => addToRefs(el, 2)}>

          {/* IMAGE 1 */}
          <div className="relative rounded-xl overflow-hidden shadow-md group">
            {!imageLoaded[0] && (
              <div className="w-full h-[250px] md:h-[270px] bg-gray-300 animate-pulse absolute inset-0" />
            )}

            <Image
  src="/img8.jpg"
  alt="Image 3"
  width={500}
  height={240}
  onLoad={() =>
    setImageLoaded((prev) => [true, prev[1]])
  }
  className={`object-cover w-full h-[250px] md:h-[270px] transition-transform duration-300 group-hover:scale-105 ${
    imageLoaded[0] ? "opacity-100" : "opacity-0"
  }`}
/>

            <div className="absolute top-4 left-4 text-zinc-800">
              <p className="text-md uppercase font-zentry -tracking-tight">
                Wi<b>nt</b>er Coll<b>e</b>cti<b>on</b>
              </p>
              <h3 className="font-semibold text-lg">
                Stylish Winter T-Shirt for Men
              </h3>
              <button className="mt-2 border border-black px-3 py-1 text-sm rounded-md hover:bg-zinc-800 hover:text-white">
                Check Now
              </button>
            </div>
          </div>

          {/* IMAGE 2 */}
          <div className="relative rounded-xl overflow-hidden shadow-md group">
            {!imageLoaded[1] && (
              <div className="w-full h-[230px] md:h-[270px] bg-gray-300 animate-pulse absolute inset-0" />
            )}

            <Image
  src="/img4.jpg"
  alt="Image 4"
  width={500}
  height={240}
  onLoad={() =>
    setImageLoaded((prev) => [prev[0], true])
  }
  className={`object-cover w-full h-[230px] md:h-[270px] transition-transform duration-300 group-hover:scale-105 ${
    imageLoaded[1] ? "opacity-100" : "opacity-0"
  }`}
/>


            <div className="absolute bottom-4 right-6 text-[#8cd585] left-4">
              <p className="text-md uppercase font-zentry -tracking-tight">
                <b>M</b>en Co<b>ll</b>ec<b>t</b>ion
              </p>
              <h3 className="font-semibold text-lg">
                Stylish Winter Shirt for Man
              </h3>
              <button className="mt-2 border border-black px-3 py-1 text-sm rounded-md hover:bg-zinc-800 hover:text-white text-zinc-800">
                Check Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Explore;
