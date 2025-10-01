import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-gray-300 py-10">
      <div className="container mx-auto px-6 md:px-12">
        {/* Grid Layout */}
        <div className="grid grid-cols-1  md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Logo Section */}
          <div>
            <Image
              src="/logo-white.svg"
              alt="Logo"
              width={300}
              height={100}
              className="mx-auto md:mx-0 "
            />
            <p className="mt-4 text-sm text-gray-400 max-w-xs mx-auto md:mx-0">
              Building your tomorrow with innovation & vision.
            </p>
          </div>

          {/* Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 ">
              Information
            </h2>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/about " className="hover:text-white">
                About Us
              </Link>
              <Link href="/contact-us" className="hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Services</h2>
            <div className="flex flex-col space-y-2 text-sm">
              <p>COD</p>
              <p>Free Shipping</p>
              <p>24/7 Support</p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex flex-wrap justify-center md:justify-end space-x-4 mt-10">
          <Link
            href="#"
            className="p-2 bg-zinc-700 rounded-full hover:bg-white hover:text-black"
          >
            <Facebook size={18} />
          </Link>
          <Link
            href="#"
            className="p-2 bg-zinc-700 rounded-full hover:bg-white hover:text-black"
          >
            <Twitter size={18} />
          </Link>
          <Link
            href="#"
            className="p-2 bg-zinc-700 rounded-full hover:bg-white hover:text-black"
          >
            <Instagram size={18} />
          </Link>
          <Link
            href="#"
            className="p-2 bg-zinc-700 rounded-full hover:bg-white hover:text-black"
          >
            <Linkedin size={18} />
          </Link>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
          <p>© 2025 Zengy.go All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
