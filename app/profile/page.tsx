"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  address?: string;
  role: string;
  favourites: any[];
  cart: any[];
  orders: any[];
  loginType?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get<UserInfo>("/api/users/getUserInfo");
        setUser(res.data);
      } catch (err: any) {
        if (err.response?.status === 401) router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">No user found.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded-2xl">
      <div className="flex items-center gap-4">
        <Image
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          width={80}
          height={80}
          className="rounded-full border"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <p><strong>Address:</strong> {user.address || "Not added"}</p>
        <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
        <p><strong>Favourites:</strong> {user.favourites?.length || 0}</p>
        <p><strong>Orders:</strong> {user.orders?.length || 0}</p>
      </div>
    </div>
  );
}
