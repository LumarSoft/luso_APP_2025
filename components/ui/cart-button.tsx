"use client";

import { useCart } from "@/lib/cart-context";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
  const { state, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 z-30 transform hover:-translate-y-1 hover:scale-110 cursor-pointer"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {state.totalItems > 0 && (
          <span className="absolute -top-3 -right-3 bg-white text-orange-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-orange-600 animate-pulse">
            {state.totalItems > 99 ? '99+' : state.totalItems}
          </span>
        )}
      </div>
    </button>
  );
} 