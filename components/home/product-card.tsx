"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDisplay } from "@/lib/types";
import { ShoppingCart, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: ProductDisplay;
  onView?: (product: ProductDisplay) => void;
  onAddToCart?: (product: ProductDisplay) => void;
}

export default function ProductCard({ product, onView, onAddToCart }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;
    
  // Obtener todas las imágenes disponibles
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image].filter(Boolean);
    
  const hasMultipleImages = allImages.length > 1;
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => {
      const next = (prev + 1) % allImages.length;
      console.log(`Next image: ${prev} -> ${next}, total: ${allImages.length}`);
      return next;
    });
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => {
      const next = (prev - 1 + allImages.length) % allImages.length;
      console.log(`Prev image: ${prev} -> ${next}, total: ${allImages.length}`);
      return next;
    });
  };

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  // Debug: Log transform value
  useEffect(() => {
    console.log(`Transform: translateX(-${currentImageIndex * 100}%), Index: ${currentImageIndex}, Images: ${allImages.length}`);
  }, [currentImageIndex, allImages.length]);

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden group">
          {allImages.length > 0 ? (
            <>
              {/* Container for sliding images */}
              <div 
                className="flex transition-transform duration-700 ease-out h-full"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`
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
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0} // Solo la primera imagen tiene prioridad
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
                          index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin imagen</p>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isFeature && (
              <Badge variant="secondary" className="bg-blue-500 text-white">
                Destacado
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive">
                -{discountPercentage}%
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                Agotado
              </Badge>
            )}
            {hasMultipleImages && (
              <Badge variant="outline" className="bg-white/90 text-gray-700">
                {currentImageIndex + 1}/{allImages.length}
              </Badge>
            )}
            {product.badge && (
              <Badge variant="secondary">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Stock status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="outline" className="bg-white text-black">
                Agotado
              </Badge>
            </div>
          )}

          {/* Removed hover overlay to allow better image navigation */}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ${product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {product.category}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(product)}
          >
            Ver producto
          </Button>
          {product.inStock ? (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onAddToCart?.(product)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              Agotado
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}