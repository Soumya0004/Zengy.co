"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton({
  amount,
  cartId,
  products,
}: {
  amount: number;
  cartId: string;
  products: any[];
}) {
  const [isReady, setIsReady] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setIsReady(true);
  }, []);

  const handlePayment = async () => {
    if (!session?.user?.id) {
      alert("Please login first");
      return;
    }

    try {
      const orderRes = await axios.post("/api/cart/createRazorpayOrder", {
        amount,
        cartId,
        products,
        userId: session.user.id,
      });

      const { order } = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "ZENGY.GO",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post("/api/cart/paymentSuccess", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              cartId,
              userId: session?.user?.id,
              products,
            });

            if (verifyRes.data.success) {
              router.push("/profile/orderHistory");
            }
          } catch (err) {
            console.error("Payment success error:", err);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: session.user.name,
          email: session.user.email,
        },

        theme: { color: "#121212" },
      };

      // Ensure SDK is loaded
      if (typeof window !== "undefined" && window.Razorpay) {
        const razor = new window.Razorpay(options);
        razor.open();
      } else {
        alert("Razorpay failed to load. Refresh page.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handlePayment}
        disabled={!isReady}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900"
      >
        Pay Now
      </button>
    </>
  );
}
