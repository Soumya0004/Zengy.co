import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Address from "@/lib/models/Address";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await Address.find({
      user: new mongoose.Types.ObjectId(session.user.id),
    }).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error("GET ADDRESSES ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phoneNumber, streetAddress, city, state, postalCode, country, addressType } =
      await req.json();

    if (!fullName || !phoneNumber || !streetAddress || !city || !state || !postalCode) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if this is the first address (set as default)
    const existingAddresses = await Address.countDocuments({
      user: new mongoose.Types.ObjectId(session.user.id),
    });

    const address = await Address.create({
      user: new mongoose.Types.ObjectId(session.user.id),
      fullName,
      phoneNumber,
      streetAddress,
      city,
      state,
      postalCode,
      country: country || "India",
      addressType: addressType || "Home",
      isDefault: existingAddresses === 0,
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    console.error("CREATE ADDRESS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
