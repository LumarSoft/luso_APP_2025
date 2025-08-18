"use client";

import Image from "next/image";
import { ProductDisplay } from "@/lib/types";
import { ShoppingCart, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/toast";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: ProductDisplay;
  onAddToCart?: (product: ProductDisplay) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem, openCart } = useCart();
  const { addToast } = useToast();

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0;

  // Obtener todas las imágenes disponibles
  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);

  const hasMultipleImages = allImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => {
      const next = (prev + 1) % allImages.length;
      return next;
    });
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => {
      const next = (prev - 1 + allImages.length) % allImages.length;
      return next;
    });
  };

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  // Debug: Log transform value
  useEffect(() => {}, [currentImageIndex, allImages.length]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col w-full h-auto">
      <div className="h-40 bg-white flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {allImages.length > 0 ? (
          <>
            {/* Container for sliding images */}
            <div
              className="flex transition-transform duration-700 ease-out h-full w-full"
              style={{
                transform: `translateX(-${currentImageIndex * 100}%)`,
              }}
            >
              {allImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-full h-full"
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* Navigation arrows for multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 opacity-70 hover:opacity-100 transition-all hover:bg-black/80 hover:scale-110 z-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 opacity-70 hover:opacity-100 transition-all hover:bg-black/80 hover:scale-110 z-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Image indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                        index === currentImageIndex
                          ? "bg-white scale-125"
                          : "bg-white/60 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {product.inStock ? (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              En Stock
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              Agotado
            </div>
          )}
        </div>

        {/* Featured Badge */}
        {product.isFeature && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            Destacado
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-12 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            -{discountPercentage}%
          </div>
        )}

        {/* Multiple Images Badge */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium">
            {currentImageIndex + 1}/{allImages.length}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <p className="text-xs text-orange-600 mb-2 font-medium">
          {product.category}
        </p>

        <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-2 flex-1">
          {product.description || "Sin descripción disponible"}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through">
                ${product.originalPrice!.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto">
          {product.inStock ? (
            <button
              onClick={() => {
                // Convertir ProductDisplay a Product
                const productForCart = {
                  id: parseInt(product.id),
                  name: product.name,
                  price: product.price,
                  stock: product.inStock ? 10 : 0, // Estimamos stock ya que ProductDisplay no lo tiene
                  image_url: product.image,
                  category_name: product.category,
                  subcategory_name: undefined,
                  description: product.description,
                  category_id: 0,
                  subcategory_id: null,
                  featured: 0,
                  created_at: "",
                  updated_at: "",
                };

                addItem(productForCart);
                addToast({
                  type: "success",
                  title: "Producto agregado",
                  description: `${product.name} se agregó al carrito`,
                  duration: 2000,
                });
                onAddToCart?.(product);
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs flex items-center justify-center gap-1"
            >
              <ShoppingCart className="h-4 w-4" />
              Agregar al carrito
            </button>
          ) : (
            <button
              disabled
              className="w-full px-3 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium text-xs"
            >
              Agotado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
