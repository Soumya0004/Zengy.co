"use client";
import { LogIn, ShoppingCart, UserIcon, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Modal from "./Modal";

import SignUpCard from "./SignUpCard";
import LoginCard from "./LoginCard";

const Nav = () => {
  const [isLogin, setIsLogin] = useState(false); // fake auth state
  const [open, setOpen] = useState(false); // mobile menu
  const [openLogin, setOpenLogin] = useState(false); // modal
  const [authMode, setAuthMode] = useState<"login" | "signup">("login"); // form switch

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Sail", href: "/sail" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <>
      <nav className="w-full bg-white text-zinc-800 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 md:px-10 py-5 flex items-center justify-between">
          {/* Left: desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-general uppercase text-sm hover:text-sky-600 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center: logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="block">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={140}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Right: icons + login button */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-5">
              {isLogin ? (
                <>
                  <Link href="/cart" aria-label="Cart">
                    <ShoppingCart size={20} />
                  </Link>
                  <Link href="/profile" aria-label="Profile">
                    <UserIcon size={20} />
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setOpenLogin(true); // open popup
                  }}
                  aria-label="Log in"
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

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block font-general uppercase text-sm py-2 px-2 hover:bg-gray-50 rounded"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t mt-2 flex items-center justify-between">
                <div>
                  {isLogin ? (
                    <div className="flex items-center gap-4">
                      <Link href="/cart" aria-label="Cart">
                        <ShoppingCart size={18} />
                      </Link>
                      <Link href="/profile" aria-label="Profile">
                        <UserIcon size={18} />
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setOpen(false); // close mobile menu
                        setAuthMode("login");
                        setOpenLogin(true); // open popup
                      }}
                      className="inline-flex items-center gap-2 uppercase text-sm hover:text-sky-600"
                    >
                      <LogIn size={18} /> Login
                    </button>
                  )}
                </div>
                <div>
                  <Link href="/shop" className="text-sm text-sky-600">
                    Visit Shop
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <Modal open={openLogin} onClose={() => setOpenLogin(false)}>
        {authMode === "login" ? (
          <LoginCard onSwitch={() => setAuthMode("signup")} />
        ) : (
          <SignUpCard onSwitch={() => setAuthMode("login")} />
        )}
      </Modal>
    </>
  );
};

export default Nav;
