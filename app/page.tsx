"use client";

import { useEffect, useState } from "react";
import { HomePage } from "@/components/home/home-page";
import { productService, slideService, getImageUrl } from "@/lib/api";
import { Product, HomePageData, ProductDisplay, Slide } from "@/lib/types";

// Helper function to convert API Product to legacy ProductDisplay format
const convertProductToDisplay = (product: Product): ProductDisplay => {
  // Manejar las imágenes con fallback apropiado
  const primaryImage =
    product.image_url ||
    (product.images && product.images.length > 0
      ? product.images[0].image_url
      : null);

  const allImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => getImageUrl(img.image_url))
      : product.image_url
      ? [getImageUrl(product.image_url)]
      : [];

  return {
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    image: getImageUrl(primaryImage),
    images: allImages,
    category: product.category_name || "Sin categoría",
    inStock: Number(product.stock) > 0, // Asegurar conversión a número
    isFeature: true, // For featured products
  };
};

// Helper function to convert API Slide to legacy HeaderSlide format
const convertSlideToHeaderSlide = (slide: Slide) => {
  const imageUrl = getImageUrl(slide.image_url);

  return {
    id: slide.id.toString(),
    image: imageUrl,
    title: slide.title || undefined,
    subtitle: slide.subtitle || undefined,
    link: slide.link || undefined,
    show_title: slide.show_title !== undefined ? !!slide.show_title : true,
    show_subtitle:
      slide.show_subtitle !== undefined ? !!slide.show_subtitle : true,
  };
};

export default function Home() {
  const [homePageData, setHomePageData] = useState<HomePageData>({
    headerSlides: [],
    featuredProducts: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [slidesResponse, productsResponse] = await Promise.all([
          slideService.getActive(),
          productService.getFeatured(8),
        ]);

        let headerSlides = [];
        let featuredProducts = [];

        // Procesar slides
        if (slidesResponse.success && slidesResponse.data.slides) {
          headerSlides = slidesResponse.data.slides.map(
            convertSlideToHeaderSlide
          );
        }

        // Procesar productos destacados
        if (productsResponse.success && productsResponse.data.products) {
          featuredProducts = productsResponse.data.products.map(
            convertProductToDisplay
          );
        } else {
        }

        setHomePageData({
          headerSlides,
          featuredProducts,
        });
      } catch (error) {
        // Use fallback slide if API fails
        setHomePageData({
          headerSlides: [
            {
              id: "fallback",
              image: "/placeholder-product.jpg",
              title: "Bienvenido a LusoInsumos",
              subtitle: "Tu tienda de confianza para productos de calidad",
              link: "/productos",
              show_title: true,
              show_subtitle: true,
            },
          ],
          featuredProducts: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Skeleton de contenido en lugar de spinner grande */}
            <div className="animate-pulse">
              {/* Hero skeleton */}
              <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>

              {/* Featured products skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-gray-200 h-80 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <HomePage data={homePageData} />;
}
