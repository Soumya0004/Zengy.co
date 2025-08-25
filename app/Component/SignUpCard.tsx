"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { signIn } from "next-auth/react";
import { useState } from "react";

type DecodedToken = {
  id: string;
  email: string;
  exp: number;
  iat: number;
};

export default function SignUpCard({ onSwitch }: { onSwitch: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/auth/signup", form);

      // Save JWT token in localStorage
      const token = res.data.token;
      if (token) {
        localStorage.setItem("token", token);

        const decoded: DecodedToken = jwtDecode(token);
        console.log("Decoded token:", decoded);
      }

      setMessage(res.data.message);

      setTimeout(() => {
        onSwitch(); // switch to login form
      }, 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details or use Google</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main St"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        {message && (
          <p className="text-sm mt-3 text-center text-gray-600">{message}</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {/* Social Signup */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-primary underline-offset-4 hover:underline"
          >
            Login
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}
