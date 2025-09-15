"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function AboutUs() {
  const processRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const processElement = processRef.current;
    const pathElement = pathRef.current;

    if (!processElement || !pathElement) return;

    const path = pathElement;
    const length = path.getTotalLength();

    // reset stroke dash
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    // 🔥 smooth scroll-based path animation
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none", // linear, tied directly to scroll
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true, // sync with scroll
      },
    });

    // Fade/slide in items
    const processItems = processElement.querySelectorAll(".process-item");
    if (processItems.length > 0) {
      gsap.from(processItems, {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: processElement,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }
  }, []);

  return (
    <div
      ref={processRef}
      className="bg-white text-black min-h-screen font-sans relative overflow-hidden"
    >
      {/* Background SVG Line */}
      <svg
        className="bg-line absolute inset-0 w-full h-full z-0 pointer-events-none"
        viewBox="0 0 400 2000"
        preserveAspectRatio="xMidYMin meet"
        fill="none"
        stroke="#9FE870"
        strokeWidth="3"
      >
        <path
          ref={pathRef}
          d="M200 0 C 100 300, 300 600, 200 900 S 100 1400, 200 2000"
        />
      </svg>

      <div className="relative z-10">
        {/* ---------------- Existing Intro + Sections ---------------- */}
        <section className="relative px-6 lg:px-20 mt-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="relative">
              <Image
                src="/img6.jpg"
                alt="About Us"
                className="rounded-xl relative z-10"
                width={250}
                height={350}
              />
              <p className="absolute -bottom-6 left-2 text-xs uppercase tracking-wide text-gray-400">
                main / about us
              </p>
            </div>
            <h1 className="text-[14vw] font-zentry special-font uppercase leading-none tracking-tighter text-center lg:text-left z-20">
              <b className="tracking-normal">about us</b>
            </h1>
            <div className="flex flex-col space-y-6 relative">
              <Image
                alt="Style Shot"
                src="/img6.jpg"
                className="rounded-xl translate-x-12"
                width={200}
                height={200}
              />
              <Image
                src="/img6.jpg"
                alt="Creative Fashion"
                className="rounded-xl -translate-x-6"
                width={160}
                height={160}
              />
            </div>
          </div>

          {/* Section 1 */}
          <div className="process-item flex flex-col lg:flex-row items-start lg:items-center justify-between mt-20 space-y-8 lg:space-y-0 font-circular-web">
            <p className="text-sm text-gray-400">
              Born in India, <br /> built for the world
            </p>
            <div className="h-px w-full lg:w-1/3 bg-gray-600"></div>
            <p className="text-xl lg:text-xl max-w-xl">
              Zengy.go started with a vision rooted in India’s rich artistry but
              built for a global audience. Our collections combine traditional
              craftsmanship with modern edge—designed to move seamlessly from
              local streets to international stages.
            </p>
          </div>

          {/* Section 2 */}
          <div className="process-item flex flex-col lg:flex-row items-start lg:items-center justify-between mt-20 space-y-8 lg:space-y-0 font-circular-web">
            <p className="text-xl lg:text-xl max-w-xl">
              Every Zengy.go piece carries the spirit of culture while looking
              forward to the future. We reinvent timeless influences with
              progressive design, creating clothing that speaks to today while
              shaping the style of tomorrow.
            </p>
            <div className="h-px w-full lg:w-1/4 bg-gray-600"></div>
            <p className="text-sm text-gray-400">
              Rooted in culture, <br /> crafted for tomorrow
            </p>
          </div>

          {/* Section 3 */}
          <div className="process-item flex flex-col lg:flex-row items-start lg:items-center justify-between mt-20 space-y-8 lg:space-y-0 font-circular-web">
            <p className="text-sm text-gray-400">
              From local streets, <br /> to global runways
            </p>
            <div className="h-px w-full lg:w-1/3 bg-gray-600"></div>
            <p className="text-xl lg:text-xl max-w-xl">
              What begins on the street finds its place on the runway. Zengy.go
              is a bridge between raw street energy and high-fashion
              refinement—crafted for those who demand authenticity no matter
              where they go.
            </p>
          </div>

          {/* Description */}
          <div className="process-item grid md:grid-cols-2 gap-20 mt-16 text-gray-500">
            <p className="text-lg leading-relaxed">
              Every stitch carries attitude. Every piece tells a story of bold
              individuality. We don’t follow trends—we shape them for those who
              dare to be different.
            </p>
            <p className="text-lg leading-relaxed">
              Zengy.go is more than clothing; it’s confidence you can wear every
              day.
            </p>
          </div>
        </section>

        {/* ---------------- New Numbered Sections ---------------- */}
        <section className="relative px-6 lg:px-20 mt-32 space-y-20">
          {[
            {
              num: "01",
              title: "BRAND DESIGNER",
              desc: "Crafting timeless identities with bold detail.",
            },
            {
              num: "02",
              title: "MARKETING",
              desc: "Strategic campaigns that push boundaries.",
            },
            {
              num: "03",
              title: "VR DESIGNER",
              desc: "Immersive designs bridging the digital and real.",
            },
            {
              num: "04",
              title: "WEB DEVELOP",
              desc: "Building sleek, scalable, and modern web solutions.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="process-item grid grid-cols-1 md:grid-cols-2 gap-10 items-center border-t border-gray-300 pt-12"
            >
              <h2 className="text-[25vw] md:text-[15vw] font-bold text-gray-200 leading-none">
                {item.num}
              </h2>
              <div>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-500 text-lg">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ---------------- Contact Section ---------------- */}
        <section className="relative px-6 lg:px-20 py-5 mt-32 flex flex-col items-center justify-center text-center">
          <h2 className="text-5xl md:text-7xl font-bold relative inline-block">
            <span className="relative z-10">CONTACT US</span>
            {/* Green ellipse underline */}
            <svg
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-16"
              viewBox="0 0 600 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="300"
                cy="50"
                rx="280"
                ry="40"
                stroke="#9FE870"
                strokeWidth="3"
              />
            </svg>
          </h2>
          <p className="mt-6 text-gray-500 text-lg">
            Let’s build something great together. Reach out today.
          </p>
          <button className="mt-8 px-8 py-3 bg-green-400 text-black rounded-full font-semibold hover:bg-green-300 transition">
            Get in Touch →
          </button>
        </section>
      </div>
    </div>
  );
}
