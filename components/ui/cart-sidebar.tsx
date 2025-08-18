"use client";

import { useCart } from "@/lib/cart-context";
import { getImageUrl } from "@/lib/api";
import { X, Minus, Plus, ShoppingCart, MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";

export function CartSidebar() {
  const { state, removeItem, updateQuantity, closeCart, clearCart, generateWhatsAppMessage } = useCart();

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage();
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"; // Configurable
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out flex flex-col ${
        state.isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ 
        visibility: state.isOpen ? 'visible' : 'hidden',
        transitionDelay: state.isOpen ? '0ms' : '300ms'
      }}
    >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-2 rounded-full">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mi Carrito</h2>
              <p className="text-sm text-gray-600">{state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gray-100 p-8 rounded-full mb-4">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-600 mb-6">Agrega algunos productos para comenzar</p>
              <Link
                href="/productos"
                onClick={closeCart}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      {item.category_name && (
                        <p className="text-sm text-orange-600">
                          {item.category_name}
                          {item.subcategory_name && ` • ${item.subcategory_name}`}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-orange-600">${item.price.toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Stock: {item.stock}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ${state.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                <MessageCircle className="h-5 w-5" />
                Realizar pedido por WhatsApp
              </button>
              
              <Link
                href="/carrito"
                onClick={closeCart}
                className="w-full block text-center bg-white border-2 border-orange-600 text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200"
              >
                Ver carrito completo
              </Link>
              
              <button
                onClick={clearCart}
                className="w-full text-gray-600 hover:text-red-600 py-2 text-sm font-medium transition-colors"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
    </div>
  );
} 