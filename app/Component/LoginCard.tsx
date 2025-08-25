"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginCard({ onSwitch }: { onSwitch: () => void }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setMessage(res.error);
    } else {
      window.location.href = "/";
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={handleChange} required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {message && <p className="text-sm mt-3 text-center">{message}</p>}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}
