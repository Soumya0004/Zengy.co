"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import Loding from "@/app/Component/Loding";

/* ================= TYPES ================= */

interface WishlistItem {
  _id: string;
  productId: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  img?: string;
  category?: string;
}

/* ================= PAGE ================= */

export default function WishlistPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH WISHLIST ================= */

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchWishlist = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get wishlist items
        const wishRes = await axios.get(
          `/api/wishlist/get?userId=${session.user.id}`
        );

        const wishlistItems: WishlistItem[] = wishRes.data || [];

        // 2️⃣ Fetch product details
        const productPromises = wishlistItems.map((item) =>
          axios.get(`/api/products/${item.productId}`)
        );

        const productsRes = await Promise.all(productPromises);

        const products = productsRes.map((res) => res.data);

        setWishlist(products);
      } catch (err) {
        console.error("Wishlist fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [session?.user?.id]);

  /* ================= REMOVE ================= */

  const removeFromWishlist = async (productId: string) => {
    if (!session?.user?.id) return;

    try {
      await axios.delete("/api/wishlist/remove", {
        data: {
          userId: session.user.id,
          productId,
        },
      });

      setWishlist((prev) =>
        prev.filter((item) => item._id !== productId)
      );
    } catch (err) {
      console.error("Remove wishlist error:", err);
    }
  };

  /* ================= UI ================= */

  if (loading) return <Loding />;

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">
          Your wishlist is empty ❤️
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2 bg-black text-white rounded-full cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-14">
      <div className="max-w-7xl mx-auto">

        <h1 className="font-zentry special-font text-4xl sm:text-5xl lg:text-6xl mb-10">
          M<b>y</b> <b>W</b>is<b>h</b>l<b>i</b>s<b>t</b> 
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {wishlist.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 relative"
            >
              {/* Remove */}
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full 
                shadow hover:scale-110 transition cursor-pointer"
              >
                <Heart
                  size={18}
                  className="fill-red-500 text-red-500"
                />
              </button>

              {/* Image */}
              <div
                onClick={() =>
                  router.push(`/shop/${product._id}`)
                }
                className="cursor-pointer"
              >
                <Image
                  src={product.img || "/placeholder.png"}
                  alt={product.title}
                  width={300}
                  height={300}
                  className="rounded-xl object-cover"
                />
              </div>

              {/* Info */}
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  {product.category}
                </p>
                <p className="font-medium truncate">
                  {product.title}
                </p>
                <p className="font-semibold mt-1">
                  ₹{product.price}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
