"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loding from "../Component/Loding";

interface WishlistItem {
  _id: string;
  productId: string;
}

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  address?: string;
  role: string;
  cart: any[];
  orders: any[];
  loginType?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // 🔹 Get user info
        const userRes = await axios.get("/api/users/getUserInfo");

        if (!isMounted) return;
        setUser(userRes.data);

        // 🔹 Get wishlist
        const wishlistRes = await axios.get(
          `/api/wishlist/get?userId=${userRes.data._id}`
        );

        if (!isMounted) return;
        setWishlist(wishlistRes.data || []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/login");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) return <Loding />;

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        No user found.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4">
        <Image
          src={
            user.avatar && user.avatar.trim() !== ""
              ? user.avatar
              : "/boy.png"
          }
          alt={user.name}
          width={90}
          height={90}
          className="rounded-full border shadow-sm object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.name}
          </h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {/* ================= DETAILS ================= */}
      <div className="mt-6 space-y-4 text-gray-800">

        <div className="p-4 bg-gray-50 rounded-xl">
          <p>
            <strong>Wishlist:</strong> {wishlist.length}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <p>
            <strong>Orders:</strong> {user.orders?.length || 0}
          </p>
        </div>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="mt-6 flex gap-4 flex-wrap">

        <button
          onClick={() => router.push("/Wishlist")}
          className="px-5 py-2 bg-pink-600 text-white rounded-xl 
          hover:bg-pink-700 transition cursor-pointer"
        >
          View Wishlist
        </button>

        <button
          onClick={() => router.push("/orders")}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl 
          hover:bg-blue-700 transition cursor-pointer"
        >
          View Order History
        </button>

        <button
          onClick={() => router.push("/profile/edit")}
          className="px-5 py-2 bg-gray-800 text-white rounded-xl 
          hover:bg-black transition cursor-pointer"
        >
          Edit Profile
        </button>

      </div>
    </div>
  );
}
