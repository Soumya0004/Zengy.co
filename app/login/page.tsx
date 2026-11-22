"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import LoginCard from "@/app/Component/LoginCard";
import SignUpCard from "@/app/Component/SignUpCard";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-24">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p className="text-center">Loading account form...</p>}>
          {isLogin ? (
            <LoginCard onSwitch={() => setIsLogin(false)} />
          ) : (
            <SignUpCard onSwitch={() => setIsLogin(true)} />
          )}
        </Suspense>
        <Link href="/" className="mt-4 block text-center text-sm underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
