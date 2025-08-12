"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { HeaderSlide } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface HeroHeaderProps {
  slides: HeaderSlide[];
  className?: string;
}

export function HeroHeader({ slides, className }: HeroHeaderProps) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api || slides.length <= 1) return;

    const autoplayInterval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(autoplayInterval);
  }, [api, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="w-full flex justify-center">
        <div className={cn("w-full h-[250px] sm:w-[864px] sm:h-[421.54px] lg:w-[1292px] lg:h-[446.65px] xl:w-[1400px] xl:h-[484px] max-w-full bg-muted rounded-[20px] sm:rounded-[30px] lg:rounded-[35px] xl:rounded-[40px] flex items-center justify-center", className)}>
          <p className="text-muted-foreground">No hay imágenes para mostrar</p>
        </div>
      </div>
    );
  }

  // Si solo hay una imagen, mostrarla directamente sin carrusel
  if (slides.length === 1) {
    const slide = slides[0];
    return (
      <div className="w-full flex justify-center">
        <div className={cn("relative w-full h-[250px] sm:w-[864px] sm:h-[421.54px] lg:w-[1292px] lg:h-[446.65px] xl:w-[1400px] xl:h-[484px] max-w-full rounded-[20px] sm:rounded-[30px] lg:rounded-[35px] xl:rounded-[40px] overflow-hidden", className)}>
        <Image
          src={slide.image}
          alt={slide.title || "Header image"}
          fill
          className="object-cover w-full h-full"
          priority
        />
        {(slide.title || slide.subtitle) && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white px-4">
              {slide.title && (
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
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
    <div className={cn("w-full flex justify-center", className)}>
      <Carousel 
        className="w-full h-[250px] sm:w-[864px] sm:h-[421.54px] lg:w-[1292px] lg:h-[446.65px] xl:w-[1400px] xl:h-[484px] max-w-full"
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0">
                <CardContent className="p-0">
                  <div className="relative w-full h-[250px] sm:w-[864px] sm:h-[421.54px] lg:w-[1292px] lg:h-[446.65px] xl:w-[1400px] xl:h-[484px] max-w-full rounded-[20px] sm:rounded-[30px] lg:rounded-[35px] xl:rounded-[40px] overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.title || "Header image"}
                      fill
                      className="object-cover w-full h-full"
                      priority
                    />
                    {(slide.title || slide.subtitle) && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                          {slide.title && (
                            <h1 className="text-3xl md:text-5xl font-bold mb-4">
                              {slide.title}
                            </h1>
                          )}
                          {slide.subtitle && (
                            <p className="text-lg md:text-xl opacity-90">
                              {slide.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
} 