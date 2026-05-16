"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CartProduct {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  [key: string]: unknown; 
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (res: RazorpaySuccessResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export default function RazorpayButton({
  amount,
  products,
  addressId,
}: {
  amount: number;
  products: CartProduct[];
  addressId: string;
}) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => setReady(true), []);

  const pay = async () => {
    if (!session?.user?.id) {
      alert("Please login to continue");
      return;
    }

    if (!addressId) {
      alert("Please select a delivery address");
      return;
    }

    if (!products || products.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/api/payment/create-order", {
        amount,
      });

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: data.order.amount,
        currency: "INR",
        name: "Your Store Name",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async (res: RazorpaySuccessResponse) => {
          try {
            const verifyRes = await axios.post("/api/payment/verify", {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              products,
              totalPrice: amount,
              addressId, 
            });

            if (verifyRes.data.success) {
              router.push("/profile/orderHistory");
            } else {
              alert("Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: session.user.name || "",
          email: session.user.email || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      // Safe global access using type assertion to avoid explicit 'any' runtime checks
      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: RazorpayOptions) => { open: () => void } }).Razorpay;
      const razor = new RazorpayConstructor(options);
      razor.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={pay}
        disabled={!ready || loading || !addressId}
        className="w-full bg-black text-white py-3 rounded font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
      </button>
    </>
  );
}