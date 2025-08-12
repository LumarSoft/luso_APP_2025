"use client";

import { useState } from "react";
import { HeroHeader } from "./hero-header";
import { FeaturedProducts } from "./featured-products";
import { HomePageData } from "@/lib/types";

interface HomePageProps {
  data: HomePageData;
}

export function HomePage({ data }: HomePageProps) {
  const [cartItems, setCartItems] = useState<string[]>([]);

  const handleAddToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
    
    // Aquí podrías agregar una notificación toast
    console.log(`Producto ${productId} agregado al carrito`);
    
    // En el futuro, aquí integrarías con tu sistema de carrito
    // Por ejemplo: addToCart(productId);
  };

  const handleViewProduct = (productId: string) => {
    // Aquí redirigirías a la página del producto
    console.log(`Ver producto ${productId}`);
    
    // En el futuro: router.push(`/productos/${productId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <HeroHeader slides={data.headerSlides} />
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts
        products={data.featuredProducts}
        onAddToCart={handleAddToCart}
        onViewProduct={handleViewProduct}
      />

      {/* Información adicional o CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas ayuda con tu pedido?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Contáctanos por WhatsApp y te ayudamos a completar tu compra
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-white text-primary font-medium px-6 py-3 transition-colors hover:bg-white/90"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.309"/>
              </svg>
              Contactar por WhatsApp
            </a>
            <span className="text-sm opacity-75">
              +56 9 1234 5678
            </span>
          </div>
        </div>
      </section>
    </div>
  );
} 