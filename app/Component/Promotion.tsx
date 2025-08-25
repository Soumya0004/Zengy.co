"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

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
  return (
    <div className="p-6 sm:p-10 overflow-x-hidden">
      <div id="contact" className="my-12 sm:my-20 w-full">
        <div className="relative rounded-lg bg-black py-12 sm:py-20 text-blue-50 overflow-hidden min-h-[320px] sm:min-h-[420px] md:min-h-[520px]">
          
          {/* Left floating images (hidden on xs, smaller offset on sm) */}
          <div className="absolute -left-4 sm:-left-20 top-0 hidden sm:block lg:left-20  flex-col gap-6 w-56 sm:w-72 lg:w-96">
            <ImgClipBox
              clipClass="contact-clip-path-1"
              aspectClass="h-36 sm:h-56 lg:h-72"
              src="/img11.webp"
            />
            <ImgClipBox
              clipClass="contact-clip-path-2 translate-y-6 sm:translate-y-10"
              aspectClass="h-36 sm:h-56 lg:h-72"
              src="/img9.webp"
            />
          </div>

          {/* Swordman images (center-right on larger screens, centered on small) */}
          <div className="absolute top-8 sm:top-1/2 left-1/2 sm:left-auto sm:right-10 -translate-x-1/2 sm:translate-x-0 w-36 sm:w-56 md:w-72 lg:w-80">
            <ImgClipBox
              clipClass="sword-man-clip-path md:scale-110"
              aspectClass="h-44 sm:h-64 md:h-80 lg:h-96"
              src="/img10.webp"
            />
          </div>

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 mx-auto max-w-4xl">
            <p className="font-general text-[10px] uppercase tracking-widest">join zengy.go</p>
            <p className="special-font mt-6 font-zentry text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
              <b>30%</b>  o<b>ff</b> <b>on</b> <br /> <b>a</b>ll n<b>e</b>w <b>a</b>rri
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
