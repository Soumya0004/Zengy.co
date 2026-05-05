import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Address from "@/lib/models/Address";
import User from "@/lib/models/User";
import mongoose from "mongoose";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { fullName, phoneNumber, streetAddress, city, state, postalCode, country, addressType } =
      await req.json();

    if (!fullName || !phoneNumber || !streetAddress || !city || !state || !postalCode) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const address = await Address.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        user: new mongoose.Types.ObjectId(session.user.id),
      },
      {
        fullName,
        phoneNumber,
        streetAddress,
        city,
        state,
        postalCode,
        country: country || "India",
        addressType: addressType || "Home",
      },
      { new: true }
    );

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    console.error("UPDATE ADDRESS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if this is the default address
    const address = await Address.findOne({
      _id: new mongoose.Types.ObjectId(id),
      user: new mongoose.Types.ObjectId(session.user.id),
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    // If it's the default, remove the default from user
    if (address.isDefault) {
      await User.findByIdAndUpdate(session.user.id, {
        defaultAddressId: null,
      });
    }

    await Address.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      user: new mongoose.Types.ObjectId(session.user.id),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE ADDRESS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
