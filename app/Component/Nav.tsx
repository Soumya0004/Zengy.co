"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogIn, ShoppingCart, UserIcon, Menu, X, LogOut } from "lucide-react";
import React, { useState } from "react";

const Nav = () => {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Sail", href: "/sail" },
    { label: "About Us", href: "/about" },
  ];

  const isLogin = status === "authenticated";

  return (
    <>
      <nav className="w-full bg-white text-zinc-800 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 md:px-10 py-5 flex items-center justify-between">
          {/* Left: Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="uppercase text-sm hover:text-sky-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <Image src="/logo.svg" alt="Logo" width={140} height={40} />
            </Link>
          </div>

          {/* Right: Desktop Auth */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-5">
              {isLogin ? (
                <>
                  <Link href="/cart">
                    <ShoppingCart size={20} />
                  </Link>
                  <Link href="/profile">
                    <UserIcon size={20} />
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-red-600 inline-flex items-center gap-2 uppercase"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="inline-flex items-center gap-2 uppercase text-sm hover:text-sky-600"
                >
                  <LogIn size={20} /> Login
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setOpen((s) => !s)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
  <div className="md:hidden border-t bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
      {/* Mobile Nav Links */}
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block uppercase text-sm py-2 px-2 rounded hover:bg-gray-50"
          onClick={() => setOpen(false)} // close menu on click
        >
          {link.label}
        </Link>
      ))}

      {/* Divider */}
      <div className="pt-2 border-t mt-2 flex items-center justify-between">
        {isLogin ? (
          <div className="flex items-center gap-4">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart size={18} />
            </Link>
            <Link href="/profile" aria-label="Profile">
              <UserIcon size={18} />
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="text-sm text-red-600 inline-flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setOpen(false); // close mobile menu
              signIn("google"); // directly Google login
            }}
            className="inline-flex items-center gap-2 uppercase text-sm hover:text-sky-600"
          >
            <LogIn size={18} /> Login
          </button>
        )}
      </div>
    </div>
  </div>
)}

      </nav>
    </>
  );
};

export default Nav;
