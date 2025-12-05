import gsap from "gsap";
import { useEffect, useRef } from "react";

const FeaturesSection = ({ features }: { features: string[] }) => {
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
if (!ref.current) return;

gsap.fromTo(
  ref.current.children,
  { y: 40, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.12,
    ease: "power2.out",
  }
);

}, []);

return ( <div className="mt-20"> <h2 className="text-3xl font-bold text-center mb-10">Key Features</h2>

  <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {features.map((f, i) => (
      <div
        key={i}
        className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition"
      >
        {f}
      </div>
    ))}
  </div>
</div>


);
};

export default FeaturesSection;
