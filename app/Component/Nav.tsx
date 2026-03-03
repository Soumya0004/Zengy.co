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
import { useRouter, usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

/* ---------------- SLIDING / LIQUID NAV LINKS ---------------- */

const SlidingNavLinks = ({
  links,
  activePath,
}: {
  links: { label: string; href: string }[];
  activePath: string;
}) => {
  const [hover, setHover] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const parent = ref.current.getBoundingClientRect();
    setHover({
      left: rect.left - parent.left,
      width: rect.width,
      opacity: 1,
    });
  };

  return (
    <div
      ref={ref}
      onMouseLeave={() => setHover((p) => ({ ...p, opacity: 0 }))}
      className="relative flex items-center gap-2"
    >
      <span
        className="absolute h-9 rounded-full bg-white/10 transition-all duration-300"
        style={{
          left: hover.left,
          width: hover.width,
          opacity: hover. opacity,
        }}
      />

      {links.map((l) => {
        const active = activePath === l.href;
        return (
          <Link 
            key={l.href}
            href={l.href}
            onMouseEnter={onEnter}
            className={`relative z-10 px-5 py-2 uppercase text-sm transition-all
              ${active ? "text-sky-400" : "text-white"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
};

/* ---------------- MAIN NAV ---------------- */

export default function Nav() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [hideMobile, setHideMobile] = useState(false);

  const navInnerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Sail", href: "/sail" },
    { label: "About Us", href: "/about" },
  ];

  const loggedIn = status === "authenticated";

  /* ---------------- MOUNT ---------------- */
  useEffect(() => setMounted(true), []);

  /* ---------------- DESKTOP GSAP ---------------- */
  useEffect(() => {
    if (!mounted || window.innerWidth < 768) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top -20",
        end: "top -120",
        scrub: 0.5,
      },
    });

    tl.to(navInnerRef.current, {
      maxWidth: "480px",
      borderRadius: "14px",
      paddingLeft: "12px",
      paddingRight: "12px",
      boxShadow: "0 12px 25px rgba(0,0,0,0.4)",
    }).to(
      [logoRef.current, authRef.current],
      { autoAlpha: 0, width: 0, padding: 0 },
      0,
    );

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [mounted]);

  /* ---------------- MOBILE AUTO HIDE ---------------- */
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const cur = window.scrollY;
      setHideMobile(cur > last && cur > 80);
      last = cur;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    nextSignOut();
  };

  if (!mounted) return null;

  return (
    <>
      {/* ================= DESKTOP NAV ================= */}
      <div className="fixed top-0 left-0 w-full pt-5 z-50 hidden md:flex justify-center pointer-events-none">
        <div
          ref={navInnerRef}
          className="bg-zinc-800 text-white rounded-xl py-2 w-full max-w-5xl pointer-events-auto"
        >
          <div className="px-6 flex items-center justify-between">
            <div ref={logoRef} className="flex-1">
              <Image src="/logo-white.svg" alt="Logo" width={160} height={48} />
            </div>

            <SlidingNavLinks links={navLinks} activePath={pathname} />

            <div ref={authRef} className="flex-1 flex justify-end gap-5">
              {loggedIn ? (
                <>
                  <UserIcon onClick={() => router.push("/profile")} />
                  <ShoppingCart />
                  <LogOut onClick={handleLogout} />
                </>
              ) : (
                <button onClick={() => setShowAuthModal(true)}>Login</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE NAV ================= */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full bg-zinc-800 text-white z-50 transition-transform duration-300
        ${hideMobile ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="px-4 py-3 flex justify-between items-center">
          <Image src="/logo-white.svg" alt="Logo" width={120} height={36} />
          <button onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300
          ${open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="bg-white text-black px-4 py-3 space-y-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg transition
                ${pathname === l.href ? "bg-sky-100 text-sky-600" : ""}`}
              >
                {l.label}
              </Link>
            ))}

            <div className="pt-2 border-t flex gap-4">
              {loggedIn ? (
                <>
                  <UserIcon />
                  <ShoppingCart />
                  <LogOut onClick={handleLogout} />
                </>
              ) : (
                <button onClick={() => setShowAuthModal(true)}>
                  <LogIn /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[64px] md:hidden" />

      {/* ================= AUTH MODAL ================= */}
      <Modal open={showAuthModal} onClose={() => setShowAuthModal(false)}>
        {isLogin ? (
          <LoginCard onSwitch={() => setIsLogin(false)} />
        ) : (
          <SignUpCard onSwitch={() => setIsLogin(true)} />
        )}
      </Modal>
    </>
  );
}
