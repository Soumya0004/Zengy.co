import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { auth } from "@/auth";

export async function GET() {
  try {
    // 1. Session check
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 2. Fetch users
    const users = await User.find({})
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .lean();

    // 3. Safety check: If users is null or empty
    if (!users || users.length === 0) {
      return NextResponse.json([]); // Return empty array instead of crashing
    }

    // 4. Safe Mapping
    const sanitizedUsers = users.map((user) => ({
      ...user,
      // Use optional chaining and fallback to handle potential ID issues
      _id: user._id?.toString() || "", 
    }));

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}