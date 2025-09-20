"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import Shuffle from "@/components/Shuffle";
import ShinyText from "@/components/ShinyText";
import Magnet from "@/components/Magnet";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  // === Tilt Effect ===
  const handleMouseLeave = () => {
    const element = frameRef.current;
    if (!element) return;

    gsap.to(element, {
      duration: 0.3,
      rotateX: 0,
      rotateY: 0,
      ease: "power1.inOut",
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const element = frameRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPerspective: 500,
      ease: "power1.inOut",
    });
  };

  // === Scroll Animations ===
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text fade in (Shuffle handles animation but we add slight fade too)
      if (textRef.current) {
        gsap.from(textRef.current, {
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Image Scale + Fade In
      if (frameRef.current) {
        gsap.from(frameRef.current, {
          scale: 0.9,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: frameRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Page Transition Animation
      if (containerRef.current) {
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
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-center text-zinc-800 
      px-4 sm:px-8 md:px-12 lg:px-28 pt-8 sm:pt-12 md:py-20 lg:pt-10 min-h-screen"
    >
      {/* Left Content */}
      <div
        ref={textRef}
        className="flex flex-col justify-center space-y-4 sm:space-y-6 items-center md:items-start text-center md:text-left lg:pl-10"
      >
        
<Shuffle tag="h1" className=" font-zentry special-font ">
  <b>F</b>as<b>h</b>ion T<b>ha</b>t <br />
  <span className="block md:ml-7">
    <b>M</b>o<b>v</b>es Wi<b>th</b> Y<b>o</b>u
  </span>
</Shuffle>



        <p className="text-sm sm:text-base md:text-md lg:text-lg text-zinc-800 max-w-xl font-circular-web md:ml-7">
          At Zengy.go, we create fashion that moves with you — comfortable,
          stylish, and bold clothing designed for everyday energy and
          confidence.
        </p>

        {/* Desktop & Tablet Buttons */}
        <div className="hidden md:flex gap-4 pt-4 md:ml-7 ">

<Magnet padding={50} disabled={false} magnetStrength={10}>
  <button className="bg-zinc-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition w-full sm:w-auto  gap-5">
    <ShinyText text="Buy Product" disabled={false} speed={3} />
  </button>
</Magnet>


<Magnet padding={50} disabled={false} magnetStrength={10}>
<button className="border border-black text-zinc-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition w-full sm:w-auto">
    <ShinyText text="Explore Product" disabled={true} speed={3} />
  </button></Magnet>

  
        </div>
      </div>

      {/* Right Image */}
      <div className="flex flex-col items-center md:items-start w-full">
        <div
          ref={frameRef}
          className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded overflow-hidden"
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseLeave}
          onMouseEnter={handleMouseLeave}
        >
          <Image
            src="/img7.jpg"
            alt="Fashion model wearing Zengy.go clothing"
            width={900}
            height={700}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover w-full h-auto rounded"
          />
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
          <button className="bg-zinc-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition w-full sm:w-auto">
    <ShinyText text="Buy Product" disabled={false} speed={3} />
  </button>
  <button className="border border-black text-zinc-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition w-full sm:w-auto">
    <ShinyText text="Explore Product" disabled={false} speed={3} /> 

  </button>
        </div>
      </div>

      
    </main>
  );
};

export default Hero;
