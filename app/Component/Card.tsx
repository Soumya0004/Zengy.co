"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  price: number | string;   // IMPORTANT FIX
  img?: string;
  discount?: number;
}

interface CardProps {
  product: Product;
  isInWishlist?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export default function Card({ product, isInWishlist = false, onToggleWishlist }: CardProps) {
  const rawPrice = typeof product.price === "string" ? Number(product.price) : product.price;
  const discount = typeof product.discount === "number" ? product.discount : 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(rawPrice * (1 - discount / 100))
    : rawPrice;

  return (
    <Link href={`/shop/${product._id}`}>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-4 cursor-pointer max-w-[320px] mx-auto relative">
        {hasDiscount && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 text-white text-xs px-3 py-1 font-semibold">
            {Math.round(discount)}% off
          </span>
        )}

        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product._id);
            }}
            className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition"
          >
            <Heart
              className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        )}
        <Image
          src={product.img || "/placeholder.png"}
          alt={product.title}
          width={400}
          height={400}
          className="rounded-xl object-cover h-[280px] w-full"
        />

        <h3 className="mt-3 font-medium line-clamp-2">
          {product.title}
        </h3>

        <div className="mt-1">
          <p className="font-semibold">₹{discountedPrice}</p>
          {hasDiscount && (
            <p className="text-xs text-gray-400 line-through">
              ₹{rawPrice}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
