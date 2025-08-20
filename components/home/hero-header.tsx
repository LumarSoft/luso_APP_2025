"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { HeaderSlide } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Hook para detectar si es dispositivo móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

interface HeroHeaderProps {
  slides: HeaderSlide[];
  className?: string;
}

export function HeroHeader({ slides, className }: HeroHeaderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const isMobile = useIsMobile();

  // Función para obtener la imagen correcta según el dispositivo
  const getSlideImage = (slide: HeaderSlide) => {
    // Si es mobile y hay imagen mobile, usar esa
    if (isMobile && slide.image_url_mobile) {
      return slide.image_url_mobile;
    }
    // Caso contrario, usar imagen desktop
    return slide.image;
  };

  useEffect(() => {
    if (!api || slides.length <= 1) return;

    const autoplayInterval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(autoplayInterval);
  }, [api, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="w-full flex justify-center sm:px-4">
        <div
          className={cn(
            // Mobile: ancho completo, altura mucho mayor, sin bordes redondeados
            "w-full h-[240px] rounded-none",
            // Desktop: mantener diseño actual con bordes redondeados y contenedor
            "sm:w-[864px] sm:h-[421.54px] sm:rounded-[30px]",
            "lg:w-[1292px] lg:h-[446.65px] lg:rounded-[35px]",
            "xl:w-[1400px] xl:h-[484px] xl:rounded-[40px]",
            "sm:max-w-full flex items-center justify-center",
            className
          )}
        >
          <p className="text-muted-foreground">No hay imágenes para mostrar</p>
        </div>
      </div>
    );
  }

  // Si solo hay una imagen, mostrarla directamente sin carrusel
  if (slides.length === 1) {
    const slide = slides[0];
    return (
      <div className="w-full flex justify-center sm:px-4">
        <div
          className={cn(
            // Mobile: ancho completo, altura optimizada como CompraGamer
            "relative w-full h-[240px] rounded-none",
            // Desktop: mantener diseño actual con bordes redondeados y contenedor
            "sm:w-[864px] sm:h-[421.54px] sm:rounded-[30px]",
            "lg:w-[1292px] lg:h-[446.65px] lg:rounded-[35px]",
            "xl:w-[1400px] xl:h-[484px] xl:rounded-[40px]",
            "sm:max-w-full overflow-hidden",
            className
          )}
        >
          <Image
            src={getSlideImage(slide)}
            alt={slide.title || "Header image"}
            fill
                              className="object-contain sm:object-cover w-full h-full"
            priority
          />
          {((slide.title && slide.show_title) ||
            (slide.subtitle && slide.show_subtitle)) && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                {slide.title && slide.show_title && (
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && slide.show_subtitle && (
                  <p className="text-lg md:text-xl opacity-90">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Si hay múltiples imágenes, mostrar carrusel
  return (
    <div className={cn("w-full flex justify-center sm:px-4", className)}>
      <Carousel
        className={cn(
          // Mobile: ancho completo, altura optimizada como CompraGamer
          "w-full h-[240px]",
          // Desktop: mantener tamaños actuales
          "sm:w-[864px] sm:h-[421.54px]",
          "lg:w-[1292px] lg:h-[446.65px]",
          "xl:w-[1400px] xl:h-[484px]",
          "sm:max-w-full"
        )}
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div
                className={cn(
                                  // Mobile: ancho completo, altura optimizada como CompraGamer
                "relative w-full h-[240px] rounded-none",
                  // Desktop: mantener diseño actual con bordes redondeados
                  "sm:w-[864px] sm:h-[421.54px] sm:rounded-[30px]",
                  "lg:w-[1292px] lg:h-[446.65px] lg:rounded-[35px]",
                  "xl:w-[1400px] xl:h-[484px] xl:rounded-[40px]",
                  "sm:max-w-full overflow-hidden"
                )}
              >
                <Image
                  src={getSlideImage(slide)}
                  alt={slide.title || "Header image"}
                  fill
                  className="object-contain sm:object-cover w-full h-full"
                  priority
                />
                {((slide.title && slide.show_title) ||
                  (slide.subtitle && slide.show_subtitle)) && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      {slide.title && slide.show_title && (
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                          {slide.title}
                        </h1>
                      )}
                      {slide.subtitle && slide.show_subtitle && (
                        <p className="text-lg md:text-xl opacity-90">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
