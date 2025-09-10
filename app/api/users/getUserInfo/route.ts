import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import "@/models/Collections";
import "@/models/Order";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const user = await User.findById(session.user.id)
      .populate("favourites")
      .populate({ path: "cart.product", model: "Collections" })
      .populate("orders")
      .lean();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user, { status: 200 });
  } catch (err: any) {
    if (err.name === 'CastError') return NextResponse.json({ error: "Invalid user ID format in session." }, { status: 400 });
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
