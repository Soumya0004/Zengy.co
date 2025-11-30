"use client";

import { useSession, signOut as nextSignOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogIn, ShoppingCart, UserIcon, Menu, X, LogOut } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import SignUpCard from "./SignUpCard";
import LoginCard from "./LoginCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";


gsap.registerPlugin(ScrollTrigger);

const Nav = () => {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [manualUser, setManualUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const fullNavRef = useRef<HTMLDivElement>(null);
  const floatingNavRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) setManualUser(JSON.parse(storedUser));
  }, []);

  const loggedIn = status === "authenticated" || !!manualUser;

  const handleLogout = () => {
    if (status === "authenticated") nextSignOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setManualUser(null);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Sail", href: "/sail" },
    { label: "About Us", href: "/about" },
  ];

  useEffect(() => {
    if (!mounted) return;
    if (!fullNavRef.current || !floatingNavRef.current) return;

    gsap.set(floatingNavRef.current, {
      y: -80,
      opacity: 0,
      scaleX: 0.3,
      scaleY: 0.6,
    });

    ScrollTrigger.create({
      trigger: document.body,
      start: "top -120",
      onEnter: () => {
        gsap.to(fullNavRef.current, {
          y: -120,
          opacity: 0,
          duration: 0.5,
          ease: "power3.inOut",
        });
        gsap.to(floatingNavRef.current, {
          y: 0,
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.6)",
        });
      },
      onLeaveBack: () => {
        gsap.to(fullNavRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.inOut",
        });
        gsap.to(floatingNavRef.current, {
          y: -80,
          opacity: 0,
          scaleX: 0.3,
          scaleY: 0.6,
          duration: 0.4,
          ease: "power3.in",
        });
      },
    });
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Full Nav */}
      <div ref={fullNavRef} className="w-full flex justify-center z-40 relative">
        <div className="w-full max-w-5xl bg-zinc-800 text-white shadow-sm mt-5 rounded-xl py-2">
          <div className="px-4 md:px-10 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <Link href="/" className="inline-block">
                <Image src="/logo-white.svg" alt="Logo" width={160} height={48} />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="uppercase text-sm hover:text-sky-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="hidden md:flex items-center gap-5">
                {loggedIn ? (
                  <>
                 {/* PROFILE DROPDOWN WRAPPER */}
{loggedIn &&pathname !== "/profile" &&( <div className="relative group">
  {/* ICON (click → go to /profile) */}
  <button
    onClick={() => router.push("/profile")}
    className="p-1 cursor-pointer"
  >
    <UserIcon size={20} />
  </button>

  {/* HOVER DROPDOWN */}
  <div
    className="
      absolute right-0 mt-3 bg-white text-black border rounded-xl shadow-lg p-4
      opacity-0 invisible group-hover:opacity-100 group-hover:visible 
      transition-all duration-300 z-50
    "
  >
    <ProfileDropdown />
  </div>
</div>)}


                    <Link href="/cart">
                      <ShoppingCart size={20} />
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-500 inline-flex items-center gap-2 uppercase"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="inline-flex items-center gap-2 uppercase text-sm hover:text-sky-400"
                  >
                    <LogIn size={18} /> Login
                  </button>
                )}
              </div>
              <button
                type="button"
                className="md:hidden p-2 rounded hover:bg-zinc-700"
                onClick={() => setOpen((s) => !s)}
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-t bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block uppercase text-sm py-2 px-2 rounded hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t mt-2 flex items-center justify-between">
              {loggedIn ? (
                <div className="flex items-center gap-4">
                  <Link href="/profile" onClick={() => setOpen(false)}>
                    <UserIcon size={18} />
                  </Link>
                  <Link href="/cart" onClick={() => setOpen(false)}>
                    <ShoppingCart size={18} />
                  </Link>
                  
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="text-sm text-red-600 inline-flex items-center gap-2"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="inline-flex items-center gap-2 text-sm hover:text-sky-500"
                >
                  <LogIn size={18} /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Nav for All Screens */}
      <div
        ref={floatingNavRef}
        className=" fixed top-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md text-white rounded-2xl px-6 py-3 shadow-lg z-50 hidden md:flex items-center justify-between w-auto"
      >
        {/* Desktop: Show links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="uppercase text-sm hover:text-sky-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile: Show Menu Icon */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded hover:bg-zinc-800"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <Modal open={showAuthModal} onClose={() => setShowAuthModal(false)}>
        {isLogin ? (
          <LoginCard onSwitch={() => setIsLogin(false)} />
        ) : (
          <SignUpCard onSwitch={() => setIsLogin(true)} />
        )}
      </Modal>
    </>
  );
};

export default Nav;
