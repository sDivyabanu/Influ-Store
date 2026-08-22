"use client";

import Link from "next/link";
import { useState } from "react";

type CartItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
};

const initialCart: CartItem[] = [
  {
    id: 1,
    name: "Aura Sneakers",
    category: "Footwear",
    price: 89,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Minimal Watch",
    category: "Accessories",
    price: 129,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Essential Hoodie",
    category: "Fashion",
    price: 64,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
  },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const updateQuantity = (id: number, change: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(1, item.quantity + change),
              }
            : item
        )
    );
  };

  const removeItem = (id: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discount = promoApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 10;
  const total = subtotal - discount + shipping;

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "INFLU10") {
      setPromoApplied(true);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          <Link
            href="/products"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            Continue Shopping →
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <section className="px-6 py-12 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* TITLE */}
          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-fuchsia-400">
              Your bag
            </p>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Shopping Cart
            </h1>

            <p className="mt-4 text-gray-400">
              {cart.length === 0
                ? "Your cart is currently empty."
                : `${cart.length} ${
                    cart.length === 1 ? "item" : "items"
                  } in your cart`}
            </p>
          </div>

          {cart.length === 0 ? (
            /* EMPTY CART */
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-500/10 text-4xl">
                🛍️
              </div>

              <h2 className="mt-6 text-2xl font-semibold">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-3 max-w-md text-gray-500">
                Discover products from your favorite creators and add
                something you love to your cart.
              </p>

              <Link
                href="/explore"
                className="mt-8 inline-block rounded-full bg-white px-7 py-4 font-semibold text-black transition hover:scale-105"
              >
                Explore Products →
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
              {/* CART ITEMS */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
                  >
                    <div className="flex gap-5">
                      {/* IMAGE */}
                      <div className="h-32 w-28 shrink-0 overflow-hidden rounded-2xl bg-zinc-900 sm:h-40 sm:w-32">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* DETAILS */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-fuchsia-400">
                            {item.category}
                          </p>

                          <h2 className="mt-1 truncate text-lg font-semibold sm:text-xl">
                            {item.name}
                          </h2>

                          <p className="mt-2 text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          {/* QUANTITY */}
                          <div className="flex items-center rounded-full border border-white/10 bg-black">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, -1)
                              }
                              className="flex h-9 w-9 items-center justify-center text-gray-400 transition hover:text-white"
                            >
                              −
                            </button>

                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.id, 1)
                              }
                              className="flex h-9 w-9 items-center justify-center text-gray-400 transition hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          {/* REMOVE */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-gray-600 transition hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="hidden text-right sm:block">
                        <p className="text-lg font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* MOBILE PRICE */}
                    <div className="mt-4 border-t border-white/5 pt-3 text-right sm:hidden">
                      <span className="text-sm text-gray-500">
                        Total:{" "}
                      </span>
                      <span className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ORDER SUMMARY */}
              <div className="h-fit rounded-[32px] border border-white/10 bg-white/[0.04] p-7 lg:sticky lg:top-8">
                <h2 className="text-2xl font-semibold">
                  Order Summary
                </h2>

                {/* PROMO */}
                <div className="mt-7">
                  <p className="mb-3 text-sm text-gray-400">
                    Have a promo code?
                  </p>

                  <div className="flex gap-2">
                    <input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="Enter code"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                    />

                    <button
                      onClick={applyPromo}
                      className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                    >
                      Apply
                    </button>
                  </div>

                  {promoApplied && (
                    <p className="mt-2 text-xs text-green-400">
                      ✓ INFLU10 applied — 10% discount
                    </p>
                  )}
                </div>

                {/* PRICES */}
                <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
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

                      <span className="text-2xl font-bold">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CHECKOUT */}
                <Link
                  href="/checkout"
                  className="mt-7 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-500 px-5 py-4 font-semibold text-white transition hover:scale-[1.01] hover:from-fuchsia-400 hover:to-purple-400"
                >
                  Proceed to Checkout →
                </Link>

                <p className="mt-4 text-center text-xs text-gray-600">
                  Secure checkout • Fast delivery • Easy returns
                </p>
              </div>
            </div>
          )}

          {/* FREE SHIPPING MESSAGE */}
          {cart.length > 0 && subtotal < 150 && (
            <div className="mt-8 rounded-2xl border border-fuchsia-400/10 bg-fuchsia-400/5 px-5 py-4 text-sm text-gray-400">
              Add{" "}
              <span className="font-semibold text-white">
                ${(150 - subtotal).toFixed(2)}
              </span>{" "}
              more to unlock{" "}
              <span className="text-fuchsia-400">
                free shipping
              </span>
              .
            </div>
          )}
        </div>
      </section>
    </main>
  );
}