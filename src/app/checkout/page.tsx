"use client";

import Link from "next/link";
import { useState } from "react";

const cartItems = [
  {
    id: 1,
    name: "Aura Sneakers",
    category: "Footwear",
    price: 89,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Minimal Watch",
    category: "Accessories",
    price: 129,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Essential Hoodie",
    category: "Fashion",
    price: 64,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80",
  },
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "upi" | "cod"
  >("card");

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discount = promoApplied ? subtotal * 0.1 : 0;

  const shipping = subtotal >= 150 ? 0 : 10;

  const total = subtotal - discount + shipping;

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "INFLU10") {
      setPromoApplied(true);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.04] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-400/10 text-4xl">
            ✓
          </div>

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-fuchsia-400">
            Order confirmed
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Thank you for shopping!
          </h1>

          <p className="mt-4 leading-7 text-gray-400">
            Your order has been successfully placed. You will
            receive an email with your order details and tracking
            information.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span>#INF-78421</span>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="flex-1 rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-gray-200"
            >
              View Orders
            </Link>

            <Link
              href="/explore"
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold transition hover:bg-white/10"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          <Link
            href="/cart"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Cart
          </Link>
        </div>
      </header>

      {/* PAGE */}
      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {/* TITLE */}
          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-fuchsia-400">
              Secure checkout
            </p>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Complete your order.
            </h1>

            <p className="mt-4 text-gray-400">
              Enter your details and choose your preferred payment
              method.
            </p>
          </div>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
              {/* LEFT SIDE */}
              <div className="space-y-8">
                {/* CONTACT INFORMATION */}
                <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
                  <div className="mb-7">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-fuchsia-400">
                      01
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      Contact information
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      We&apos;ll use this to send your order updates.
                    </p>
                  </div>


                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Email address
                      </label>

                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        First name
                      </label>

                      <input
                        id="firstName"
                        type="text"
                        required
                        placeholder="Priya"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Last name
                      </label>

                      <input
                        id="lastName"
                        type="text"
                        required
                        placeholder="Dharshini"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Phone number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50"
                      />
                    </div>
                  </div>
                </section>

                {/* SHIPPING */}
                <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
                  <div className="mb-7">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-fuchsia-400">
                      02
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      Shipping address
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="address"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Street address
                      </label>

                      <input
                        id="address"
                        type="text"
                        required
                        placeholder="House number and street name"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="apartment"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Apartment / Suite
                        <span className="ml-2 text-gray-600">
                          Optional
                        </span>
                      </label>

                      <input
                        id="apartment"
                        type="text"
                        placeholder="Apartment, suite, etc."
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor="city"
                          className="mb-2 block text-sm font-medium text-gray-300"
                        >
                          City
                        </label>

                        <input
                          id="city"
                          type="text"
                          required
                          placeholder="Chennai"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="state"
                          className="mb-2 block text-sm font-medium text-gray-300"
                        >
                          State
                        </label>

                        <input
                          id="state"
                          type="text"
                          required
                          placeholder="Tamil Nadu"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="zip"
                          className="mb-2 block text-sm font-medium text-gray-300"
                        >
                          PIN code
                        </label>

                        <input
                          id="zip"
                          type="text"
                          required
                          placeholder="600001"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-gray-400">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-fuchsia-500"
                      />

                      <span>
                        Save this address for future orders
                      </span>
                    </label>
                  </div>
                </section>

                {/* PAYMENT */}
                <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
                  <div className="mb-7">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-fuchsia-400">
                      03
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      Payment method
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {/* CARD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        paymentMethod === "card"
                          ? "border-fuchsia-400/50 bg-fuchsia-400/10"
                          : "border-white/10 bg-black/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                          💳
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold">
                            Credit / Debit Card
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Visa, Mastercard, RuPay
                          </p>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border ${
                            paymentMethod === "card"
                              ? "border-fuchsia-400 bg-fuchsia-400"
                              : "border-white/20"
                          }`}
                        />
                      </div>
                    </button>

                    {/* UPI */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        paymentMethod === "upi"
                          ? "border-fuchsia-400/50 bg-fuchsia-400/10"
                          : "border-white/10 bg-black/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                          📱
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold">UPI</p>

                          <p className="mt-1 text-xs text-gray-500">
                            Google Pay, PhonePe, Paytm
                          </p>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border ${
                            paymentMethod === "upi"
                              ? "border-fuchsia-400 bg-fuchsia-400"
                              : "border-white/20"
                          }`}
                        />
                      </div>
                    </button>

                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        paymentMethod === "cod"
                          ? "border-fuchsia-400/50 bg-fuchsia-400/10"
                          : "border-white/10 bg-black/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                          💵
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold">
                            Cash on Delivery
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Pay when your order arrives
                          </p>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border ${
                            paymentMethod === "cod"
                              ? "border-fuchsia-400 bg-fuchsia-400"
                              : "border-white/20"
                          }`}
                        />
                      </div>
                    </button>
                  </div>

                  {/* CARD DETAILS */}
                  {paymentMethod === "card" && (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="cardNumber"
                          className="mb-2 block text-sm font-medium text-gray-300"
                        >
                          Card number
                        </label>

                        <input
                          id="cardNumber"
                          type="text"
                          required
                          placeholder="1234 5678 9012 3456"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="expiry"
                          className="mb-2 block text-sm font-medium text-gray-300"
                        >
                          Expiry date
                        </label>

                        <input
                          id="expiry"
                          type="text"
                          required
                          placeholder="MM / YY"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cvv"
                          className="mb-2 block text-sm font-medium text-gray-300"
                        >
                          CVV
                        </label>

                        <input
                          id="cvv"
                          type="password"
                          required
                          placeholder="•••"
                          maxLength={4}
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI DETAILS */}
                  {paymentMethod === "upi" && (
                    <div className="mt-6">
                      <label
                        htmlFor="upi"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        UPI ID
                      </label>

                      <input
                        id="upi"
                        type="text"
                        required
                        placeholder="yourname@upi"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                      />
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="mt-6 rounded-2xl border border-yellow-400/10 bg-yellow-400/5 p-4 text-sm text-gray-400">
                      Cash on Delivery may have additional
                      availability restrictions depending on your
                      location.
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT SIDE - SUMMARY */}
              <aside className="h-fit lg:sticky lg:top-8">
                <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-7">
                  <h2 className="text-2xl font-semibold">
                    Your order
                  </h2>

                  {/* ITEMS */}
                  <div className="mt-7 space-y-5">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4"
                      >
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />

                          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-bold">
                            {item.quantity}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {item.category}
                          </p>
                        </div>

                        <p className="font-medium">
                          $
                          {(item.price * item.quantity).toFixed(
                            2
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* PROMO */}
                  <div className="mt-7 border-t border-white/10 pt-6">
                    <p className="mb-3 text-sm text-gray-400">
                      Promo code
                    </p>

                    <div className="flex gap-2">
                      <input
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                        placeholder="INFLU10"
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                      />

                      <button
                        type="button"
                        onClick={applyPromo}
                        className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                      >
                        Apply
                      </button>
                    </div>

                    {promoApplied && (
                      <p className="mt-2 text-xs text-green-400">
                        ✓ 10% discount applied
                      </p>
                    )}
                  </div>

                  {/* TOTALS */}
                  <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Subtotal
                      </span>

                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {promoApplied && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Discount
                        </span>

                        <span className="text-green-400">
                          -${discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Shipping
                      </span>

                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-400">
                            Free
                          </span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">
                          Total
                        </span>

                        <span className="text-3xl font-bold">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PLACE ORDER */}
                  <button
                    type="submit"
                    className="mt-7 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-500 px-5 py-4 font-semibold text-white transition hover:scale-[1.01] hover:from-fuchsia-400 hover:to-purple-400"
                  >
                    Place Order • ${total.toFixed(2)}
                  </button>

                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-600">
                    <span>🔒</span>
                    <span>Secure & encrypted checkout</span>
                  </div>
                </div>

                {/* TRUST */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                    <p className="text-lg">🔒</p>
                    <p className="mt-1 text-[10px] text-gray-600">
                      Secure
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                    <p className="text-lg">🚚</p>
                    <p className="mt-1 text-[10px] text-gray-600">
                      Fast delivery
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                    <p className="text-lg">↩️</p>
                    <p className="mt-1 text-[10px] text-gray-600">
                      Easy returns
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}