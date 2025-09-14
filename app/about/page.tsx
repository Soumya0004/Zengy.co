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

    // Set initial SVG line state
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    // ✅ Animate SVG path with whole page scroll
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: document.body, // whole page
        start: "top top",       // start at very top
        end: "bottom bottom",   // end at bottom
        scrub: 0.6,             // smooth scrubbing
      },
    });

    // ✅ Animate process items when section comes into view
    const processItems = processElement.querySelectorAll(".process-item");
    if (processItems.length > 0) {
      gsap.from(processItems, {
        y: 80,
        opacity: 0,
        stagger: 0.25,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: processElement,
          start: "top 80%",
        },
      });
    }
  }, []);

  return (
    <div className="bg-white text-black min-h-screen font-sans relative overflow-hidden">
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
        {/* Intro Section */}
        <section className="relative px-6 lg:px-20 mt-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="relative">
              <Image
                src="/img6.jpg"
                alt=""
                className="rounded-xl relative z-10"
                width={250}
                height={350}
              />
              <p className="absolute -bottom-6 left-2 text-xs uppercase tracking-wide text-gray-400">
                main / about us
              </p>
            </div>
            <h1 className="text-[14vw] font-zentry special-font uppercase leading-none tracking-tighter text-center lg:text-left z-20">
             <b className="tracking-normal"> about us</b>
            </h1>
            <div className="flex flex-col space-y-6 relative">
              <Image
                alt=""
                src="/img6.jpg"
                className="rounded-xl translate-x-12"
                width={200}
                height={200}
              />
              <Image
                src="/img6.jpg"
                alt=""
                className="rounded-xl -translate-x-6"
                width={160}
                height={160}
              />
            </div>
          </div>

          {/* Sub Info */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mt-20 space-y-8 lg:space-y-0 font-circular-web">
            <p className="text-sm text-gray-400">
              Based in India, <br /> operating worldwide
            </p>
            <div className="h-px w-full lg:w-1/3 bg-gray-600"></div>
            <p className="text-2xl lg:text-4xl max-w-xl text-i ">
              At Zengy.go, we fuse luxury craftsmanship with fearless streetwear. Designed for rebels, dreamers, and trendsetters—our pieces empower you to stand out, own your style, and redefine fashion.
            </p>
          </div>

          {/* Description */}
          <div className="grid md:grid-cols-2 gap-12 mt-16 text-gray-300">
            <p className="text-lg leading-relaxed">
              Together, we create bespoke solutions for each brand, embracing
              high-impact creativity to craft memorable, immersive experiences.
            </p>
            <p className="text-lg leading-relaxed">
              Our diverse expertise allows us to approach each project with
              fresh eyes and deliver exceptional results. People don’t just
              attend events—they talk about them.
            </p>
          </div>
        </section>

        {/* Process Section */}
        <section
          ref={processRef}
          className="relative min-h-screen w-full px-6 lg:px-32 mt-32"
        >
          <h2 className="text-gray-400 uppercase tracking-widest mb-20">
            process
          </h2>
          <div className="space-y-32 relative">
            <div className="process-item flex space-x-6 items-start">
              <span className="text-green-400 font-bold">01.</span>
              <div>
                <h3 className="font-bold mb-2">analysis</h3>
                <p className="text-gray-400 max-w-md">
                  We analyse your brand to identify the core message and set the
                  direction for the next steps.
                </p>
              </div>
            </div>
            <div className="process-item flex space-x-6 items-start">
              <span className="text-green-400 font-bold">02.</span>
              <div>
                <h3 className="font-bold mb-2">concept</h3>
                <p className="text-gray-400 max-w-md">
                  We create unique concepts for each event, bringing ideas to
                  life with visual mood boards.
                </p>
              </div>
            </div>
            <div className="process-item flex space-x-6 items-start">
              <span className="text-green-400 font-bold">03.</span>
              <div>
                <h3 className="font-bold mb-2">visuals & manifesto</h3>
                <p className="text-gray-400 max-w-md">
                  We provide 3D visualisations and a manifesto to convey the key
                  message and ensure lasting impact.
                </p>
              </div>
            </div>
            <div className="process-item flex space-x-6 items-start">
              <span className="text-green-400 font-bold">04.</span>
              <div>
                <h3 className="font-bold mb-2">budgeting</h3>
                <p className="text-gray-400 max-w-md">
                  We offer transparent pricing with no hidden costs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
