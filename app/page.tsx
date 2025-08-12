"use client";

import { useEffect, useState } from "react";
import { HomePage } from "@/components/home/home-page";
import { productService, slideService, getImageUrl } from "@/lib/api";
import { Product, HomePageData, ProductDisplay, Slide } from "@/lib/types";

// Helper function to convert API Product to legacy ProductDisplay format
const convertProductToDisplay = (product: Product): ProductDisplay => {
  // Product conversion completed successfully
  
  // Manejar las imágenes con fallback apropiado
  const primaryImage = product.image_url || (product.images && product.images.length > 0 ? product.images[0].image_url : null);
  const allImages = product.images && product.images.length > 0 
    ? product.images.map(img => getImageUrl(img.image_url))
    : (product.image_url ? [getImageUrl(product.image_url)] : []);

  return {
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    image: getImageUrl(primaryImage),
    images: allImages,
    category: product.category_name || 'Sin categoría',
    inStock: Number(product.stock) > 0, // Asegurar conversión a número
    isFeature: true // For featured products
  };
};

// Helper function to convert API Slide to legacy HeaderSlide format
const convertSlideToHeaderSlide = (slide: Slide) => ({
  id: slide.id.toString(),
  image: getImageUrl(slide.image_url),
  title: slide.title || undefined,
  subtitle: slide.subtitle || undefined,
  link: slide.link || undefined
});

export default function Home() {
  const [homePageData, setHomePageData] = useState<HomePageData>({
    headerSlides: [],
    featuredProducts: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [slidesResponse, productsResponse] = await Promise.all([
          slideService.getActive(),
          productService.getAll({ limit: 12 })
        ]);

        let headerSlides = [];
        let featuredProducts = [];

        // Procesar slides
        if (slidesResponse.success && slidesResponse.data.slides) {
          headerSlides = slidesResponse.data.slides.map(convertSlideToHeaderSlide);
        }

        // Si no hay slides de la API, usar uno por defecto
        if (headerSlides.length === 0) {
          headerSlides = [
            {
              id: "default",
              image: "https://via.placeholder.com/1200x500/2563eb/ffffff?text=LusoInsumos+-+Tu+tienda+de+confianza",
              title: "Bienvenido a LusoInsumos",
              subtitle: "Tu tienda de confianza para productos de calidad",
              link: "#productos"
            }
          ];
        }

        // Procesar productos
        if (productsResponse.success && productsResponse.data.products) {
          // Tomar máximo 8 productos (ya no filtramos por imagen ya que tenemos placeholder)
          const products = productsResponse.data.products.slice(0, 8);
          
          featuredProducts = products.map(convertProductToDisplay);
        }

        setHomePageData({
          headerSlides,
          featuredProducts
        });

      } catch (error) {
        console.error('Error loading home data:', error);
        // Use fallback slide if API fails
        setHomePageData({
          headerSlides: [
            {
              id: "fallback",
              image: "https://via.placeholder.com/1200x500/2563eb/ffffff?text=LusoInsumos+-+Tu+tienda+de+confianza",
              title: "Bienvenido a LusoInsumos",
              subtitle: "Tu tienda de confianza para productos de calidad",
              link: "#productos"
            }
          ],
          featuredProducts: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">
          Cargando...
        </div>
      </div>
    );
  }

  return <HomePage data={homePageData} />;
}
