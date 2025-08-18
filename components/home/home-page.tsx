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
    setCartItems((prev) => [...prev, productId]);

    // Aquí podrías agregar una notificación toast
    console.log(`Producto ${productId} agregado al carrito`);

    // En el futuro, aquí integrarías con tu sistema de carrito
    // Por ejemplo: addToCart(productId);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-white to-red-50/80 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,165,0,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.1),transparent_70%)]"></div>
      
      <div className="relative z-10">
        {/* Header Hero Section */}
        <section className="container mx-auto px-4 py-8">
          <HeroHeader slides={data.headerSlides} />
        </section>

        {/* Featured Products Section */}
        <FeaturedProducts
          products={data.featuredProducts}
          onAddToCart={(product) => handleAddToCart(product.id)}
        />
      </div>
    </div>
  );
}
