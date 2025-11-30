"use client";

import Link from "next/link";

export default function ProfileDropdown() {
  return (
    <div className="w-56">
      <h3 className="font-semibold mb-1">Welcome</h3>
      <p className="text-xs text-gray-500 mb-3">
        To access account and manage orders
      </p>


      <div className="flex flex-col gap-2 text-sm">
        <Link href="/orders" className="hover:text-sky-400">
          Orders
        </Link>
        <Link href="/wishlist" className="hover:text-sky-400">
          Wishlist
        </Link>
        <Link href="/profile" className="hover:text-sky-400">
          Profile
        </Link>
      </div>
    </div>
  );
}
