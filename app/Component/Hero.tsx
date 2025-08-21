import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <main className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-center bg-white text-zinc-800 
    px-4 sm:px-8 md:px-12 lg:px-28 pt-8 sm:pt-12 md:py-20 lg:pt-10">
      {/* Left Content */}
      <div className="flex flex-col justify-center space-y-4 sm:space-y-6 items-center md:items-start text-center md:text-left lg:pl-10">
        <h1 className="special-font font-zentry font-bold   
        text-3xl sm:text-5xl md:text-5xl lg:text-7xl -tracking-tight">
          <b>F</b>as<b>h</b>ion T<b>ha</b>t <br />
          <span className="block md:ml-7"><b>M</b>o<b>v</b>es Wi<b>th</b> Y<b>o</b>u</span>
        </h1>

        <p className="text-sm sm:text-base md:text-md lg:text-lg text-zinc-800 max-w-xl font-circular-web md:ml-7">
          At Zengy.go, we create fashion that moves with you comfortable, stylish,
          and bold clothing designed for everyday energy and confidence.
        </p>

        {/* Desktop & Tablet Buttons */}
        <div className="hidden md:flex gap-4 pt-4 md:ml-7 ">
          <button className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition">
            Buy Product
          </button>
          <button className="border border-black text-zinc-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
            Explore Product
          </button>
        </div>
      </div>

      {/* Right Image */}
      <div className="flex flex-col items-center md:items-start w-full">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
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
          <button className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition w-full sm:w-auto">
            Buy Product
          </button>
          <button className="border border-black text-zinc-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition w-full sm:w-auto">
            Explore Product
          </button>
        </div>
      </div>
    </main>
  );
};

export default Hero;
