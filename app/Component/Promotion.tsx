"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ImgClipBoxProps {
  src: string;
  clipClass?: string;
  aspectClass?: string;
}

const ImgClipBox: React.FC<ImgClipBoxProps> = ({ src, clipClass = "", aspectClass = "" }) => (
  <div className={`${clipClass} ${aspectClass} relative overflow-hidden`}>
    <Image
      src={src}
      alt="Promotion image"
      fill
      className="object-contain"
      priority
    />
  </div>
);

const Promotion: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftImg1Ref = useRef<HTMLDivElement>(null);
  const leftImg2Ref = useRef<HTMLDivElement>(null);
  const swordManRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const ctx = gsap.context(() => {
    // Images animate slightly before section fully enters
    const imageAnimConfig = {
      x: -100,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 90%",  
        end: "bottom top",
        toggleActions: "play reverse play reverse",
      },
    };

    if (leftImg1Ref.current) {
      gsap.from(leftImg1Ref.current, { ...imageAnimConfig });
    }

    if (leftImg2Ref.current) {
      gsap.from(leftImg2Ref.current, {
        ...imageAnimConfig,
        x: -120,
        duration: 1.4,
      });
    }

    if (swordManRef.current) {
      gsap.from(swordManRef.current, {
        y: 100,
        scale: 0.9,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",   
          end: "bottom top",
          toggleActions: "play reverse play reverse",
        },
      });
    }

    // Text animation – only when full section is fully visible
    if (textRef.current) {
      gsap.from(textRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",  
          end: "bottom top",
          toggleActions: "play reverse play reverse",
        },
      });
    }
  }, containerRef);

  return () => ctx.revert();
}, []);


  return (
    <div ref={containerRef} className="p-6 sm:p-10 overflow-x-hidden">
      <div id="contact" className="my-12 sm:my-20 w-full">
        <div className="relative rounded-lg bg-black py-12 sm:py-20 text-blue-50 overflow-hidden min-h-[320px] sm:min-h-[420px] md:min-h-[520px]">

          {/* Left floating images */}
          <div className="absolute -left-4 sm:-left-20 top-0 hidden sm:block lg:left-20 flex-col gap-6 w-56 sm:w-72 lg:w-96">
            <div ref={leftImg1Ref}>
              <ImgClipBox
                clipClass="contact-clip-path-1"
                aspectClass="h-36 sm:h-56 lg:h-72"
                src="/img11.webp"
              />
            </div>
            <div ref={leftImg2Ref}>
              <ImgClipBox
                clipClass="contact-clip-path-2 translate-y-6 sm:translate-y-10"
                aspectClass="h-36 sm:h-56 lg:h-72"
                src="/img9.webp"
              />
            </div>
          </div>

          {/* Swordman image */}
          <div
            ref={swordManRef}
            className="absolute top-8 sm:top-1/2 left-1/2 sm:left-auto sm:right-10 -translate-x-1/2 sm:translate-x-0 w-36 sm:w-56 md:w-72 lg:w-80"
          >
            <ImgClipBox
              clipClass="sword-man-clip-path md:scale-110"
              aspectClass="h-44 sm:h-64 md:h-80 lg:h-96"
              src="/img10.webp"
            />
          </div>

          {/* Center text */}
          <div ref={textRef} className="relative z-10 flex flex-col items-center text-center px-4 mx-auto max-w-4xl">
            <p className="font-general text-[10px] uppercase tracking-widest">join zengy.go</p>
            <p className="special-font mt-6 font-zentry text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
              <b>30%</b> o<b>ff</b> <b>on</b> <br /> <b>a</b>ll n<b>e</b>w <b>a</b>rri
              <b>v</b>al
            </p>
            <Button
              className="mt-6 sm:mt-8 cursor-pointer bg-blue-50 text-black hover:text-white px-5 sm:px-6 py-3 sm:py-3 rounded-xl text-sm sm:text-base"
              id="contact-us"
            >
              Explore Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
