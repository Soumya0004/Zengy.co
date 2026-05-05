"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddressManager from "@/components/AddressManager";
import Loding from "@/app/Component/Loding";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("addresses");
  const [refreshAddresses, setRefreshAddresses] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") return <Loding />;
  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-12 bg-zinc-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-zentry special-font text-4xl sm:text-5xl mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">
              Welcome, <span className="font-semibold">{session?.user?.name}</span>
            </p>
          </div>
          <button
            onClick={() => signOut({ redirect: true })}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("addresses")}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === "addresses"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Addresses
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === "profile"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile Info
          </button>
        </div>

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <AddressManager key={refreshAddresses} />
          </div>
        )}

        {/* Profile Info Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <img
                  src={session?.user?.image || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-2 border-gray-200"
                />
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="text-lg font-semibold">{session?.user?.name}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-gray-600">Email</p>
                <p className="text-lg font-semibold">{session?.user?.email}</p>
              </div>

              <div className="border-t pt-6">
                <p className="text-gray-600 mb-3">Account Created</p>
                <p className="text-sm text-gray-500">
                  You joined our store to enjoy exclusive deals and easy checkout.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
