"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import gsap from "gsap";
import axios from "axios";
import { Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Loding from "../Component/Loding";

// ⚡ Lazy Load RazorpayButton
const RazorpayButton = dynamic(() => import("@/components/RazorpayButton"), {
  loading: () => (
    <div className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 text-center">
      Loading Payment...
    </div>
  ),
  ssr: false,
});

// ✅ ADDED: Import AddressManager dynamically at the top (FIX #2)
const AddressManager = dynamic(() => import("@/components/AddressManager"), {
  ssr: false,
});

interface CartProduct {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    img: string;
  };
  size?: string;
  quantity: number;
}

interface Cart {
  _id: string;
  products: CartProduct[];
  status: string;
}

interface SimilarProduct {
  _id: string;
  title: string;
  price: number;
  img: string;
  discount?: number;
  category: string;
}

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [showAddressManager, setShowAddressManager] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Fetch Cart
  useEffect(() => {
    const fetchCart = async () => {
      if (status !== "authenticated") {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/cart/get", { withCredentials: true });
        if (res.data.success) {
          setCart(res.data.cart);
        } else {
          setCart({ _id: "", products: [], status: "Pending" });
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCart({ _id: "", products: [], status: "Pending" });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [status]);

  // Fetch Addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await axios.get("/api/users/addresses");
        if (res.data.success) {
          const addresses = res.data.addresses;
          // ✅ FIX #3: Added safety check to only set if no address selected yet
          if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];
            const fullAddress = `${defaultAddress.streetAddress}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postalCode}, ${defaultAddress.country}`;
            setAddress(fullAddress);
            setSelectedAddressId(defaultAddress._id);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, [status]);

  // Fetch Similar Products
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!cart?.products?.length) return;

      try {
        const firstProductId = cart.products[0]?.product?._id;
        if (!firstProductId) return;

        const res = await axios.get(`/api/products/${firstProductId}/similar`);
        if (res.data) {
          setSimilarProducts(res.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching similar products:", error);
      }
    };

    fetchSimilarProducts();
  }, [cart?.products]);

  // GSAP Animation
  useEffect(() => {
    if (cartRef.current && cart?.products?.length) {
      gsap.fromTo(
        cartRef.current.querySelectorAll(".cart-item"),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: "power3.out" }
      );
    }
  }, [cart]);

  // Update quantity
  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemove(cartItemId);
      return;
    }

    try {
      setUpdating(true);
      const res = await axios.put("/api/cart/update", {
        cartId: cart?._id,
        cartItemId,
        quantity: newQuantity,
      });

      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  // Remove item
  const handleRemove = async (cartItemId: string) => {
    try {
      setUpdating(true);
      const res = await axios.post("/api/cart/itemRemove", {
        cartId: cart?._id,
        cartItemId, // ✅ Fix: Send cartItemId, not productId
      });

      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  if (status === "loading" || loading) return <Loding />;
  
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to view your cart.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-zinc-700 font-zentry text-6xl special-font mb-6">
            <b>y</b>o<b>u</b>r b<b>ag</b> is e<b>mpt</b>y
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.products.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  // Format products for payment
  const productsForPayment = cart.products.map((item) => ({
    productId: item.product?._id,
    size: item.size,
    quantity: item.quantity,
    price: item.product?.price,
    name: item.product?.title,
  }));

  // ✅ ADDED: Debug log (FIX #5 - can be removed later)
  console.log("FINAL ADDRESS ID:", selectedAddressId);

  return (
    <div
      ref={cartRef}
      className="min-h-screen pt-28 pb-10 px-12 bg-zinc-50 grid grid-cols-1 lg:grid-cols-3 gap-10"
    >
      {/* LEFT SIDE - Cart Items */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="font-zentry special-font text-4xl sm:text-5xl lg:text-6xl mb-6">
          Y<b>o</b>u<b>r</b> C<b>a</b>r<b>t</b>
        </h1>

        {/* Address Summary */}
        <div className="bg-white p-4 rounded-xl border mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
              {address ? (
                <p className="text-sm font-medium">{address}</p>
              ) : (
                <p className="text-sm text-red-500">No address selected</p>
              )}
            </div>
            <button
              onClick={() => setShowAddressManager(true)}
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              {address ? "Change" : "Add"}
            </button>
          </div>
        </div>

        {/* Cart Items */}
        {cart.products.map((item) => (
          <div
            key={item._id}
            className="cart-item flex flex-col sm:flex-row sm:items-center justify-between border p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="flex-1">
              <p className="font-semibold text-lg">
                {item.product?.title || "Unknown Product"}
              </p>
              <p className="text-gray-500 font-medium">
                ₹{(item.product?.price || 0).toLocaleString()}
              </p>
              {item.size && (
                <p className="text-sm text-gray-400">
                  Size: {item.size}
                </p>
              )}
            </div>

            <div className="flex items-center gap-5 mt-4 sm:mt-0">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2 border rounded-lg px-3 py-1">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={updating}
                  className="text-gray-600 hover:text-black disabled:opacity-50"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  disabled={updating}
                  className="text-gray-600 hover:text-black disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Product Image */}
              {item.product?.img && (
                <Image
                  src={item.product.img}
                  alt={item.product?.title || "Product image"}
                  width={70}
                  height={70}
                  className="w-18 h-18 object-cover rounded-lg"
                />
              )}

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item._id)}
                disabled={updating}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={22} />
              </button>
            </div>
          </div>
        ))}

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-zentry special-font text-3xl mb-6">
              Y<b>o</b>u m<b>ay</b> a<b>lso</b> l<b>ike</b>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {similarProducts.map((product) => {
                const discountedPrice = product.discount
                  ? Math.round(product.price * (1 - product.discount / 100))
                  : product.price;
                return (
                  <div
                    key={product._id}
                    className="border p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition group cursor-pointer"
                    onClick={() => router.push(`/shop/${product._id}`)}
                  >
                    <div className="relative mb-3 overflow-hidden rounded-lg">
                      <Image
                        src={product.img}
                        alt={product.title}
                        width={300}
                        height={300}
                        className="w-full h-40 object-cover group-hover:scale-110 transition duration-300"
                      />
                      {product.discount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-sm mb-1 line-clamp-2">
                      {product.title}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">₹{discountedPrice.toLocaleString()}</span>
                        {product.discount && (
                          <span className="text-sm line-through text-gray-400">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/shop/${product._id}`);
                      }}
                      className="w-full bg-black text-white py-2 rounded-lg text-center text-sm hover:bg-gray-900 flex items-center justify-center gap-2 transition"
                    >
                      <ShoppingCart size={16} />
                      View Product
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE - Order Summary */}
      <div className="lg:col-span-1">
        <div className="border p-7 rounded-xl bg-white shadow-sm sticky top-28">
          <h2 className="text-xl font-bold mb-5">Cart Totals</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Shipping (3-5 Days)</span>
              <span className="text-green-600">Free</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tax (Estimated)</span>
              <span>₹0.00</span>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ✅ FIX #4: Payment Button with hard validation */}
          <div className="mt-6">
            <RazorpayButton
              amount={subtotal}
              products={productsForPayment}
              addressId={selectedAddressId || ""}
            />
          </div>

          <button
            onClick={() => router.push("/shop")}
            className="w-full mt-3 text-gray-600 hover:text-black hover:underline cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Address Manager Modal */}
      {showAddressManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Select Delivery Address</h2>
              <button
                onClick={() => setShowAddressManager(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <AddressManager
                selectMode
                onSelectAddress={(addr: any) => {
                  const full = `${addr.streetAddress}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
                  setAddress(full);
                  setSelectedAddressId(addr._id);
                  setShowAddressManager(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ❌ REMOVED: The duplicate dynamic import from the bottom (FIX #1)