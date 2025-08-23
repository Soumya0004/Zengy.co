import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User"; // your mongoose user model
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    // ✅ Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // ✅ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // ✅ Success (you can also generate JWT here if not using NextAuth)
    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Login Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
