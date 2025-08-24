"use client";

import Image from "next/image";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
      {collections.map((item) => (
        <div
          key={item._id}
          className="relative group h-72 sm:h-80 md:h-96 rounded-md overflow-hidden shadow-md hover:shadow-xl transition"
        >
          <Image
            src={item.img}
            alt={item.title}
            fill
            className="object-cover"
          />

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 bg-zinc-800/40 backdrop-blur-md flex flex-col items-center justify-center 
              opacity-0 group-hover:opacity-100 transition duration-300 font-robert-medium"
          >
            <h2 className="text-white text-lg sm:text-xl">{item.title}</h2>
            <p className="text-white font-semibold mt-1">₹ {item.price}</p>

            <button className="mt-3 px-4 py-2 bg-white text-zinc-800 rounded-lg font-medium hover:bg-zinc-800 hover:text-white transition">
              Shop Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
