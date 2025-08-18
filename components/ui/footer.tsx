"use client";

import { useEffect, useState } from "react";
import { categoryService } from "@/lib/api";
import { Category } from "@/lib/types";

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

interface CategoryWithSubcategories extends Category {
  subcategories?: Subcategory[];
}

export function Footer() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      setIsLoading(true);
      const categoriesResponse = await categoryService.getAll();

      if (categoriesResponse.success) {
        const categoriesData = categoriesResponse.data.categories;

        // Cargar subcategorías para cada categoría
        const categoriesWithSubcategories = await Promise.all(
          categoriesData.map(async (category: Category) => {
            try {
              const subcategoriesResponse =
                await categoryService.getSubcategories(category.id.toString());
              const subcategories = subcategoriesResponse.success
                ? subcategoriesResponse.data.subcategories
                : [];

              return {
                ...category,
                subcategories: subcategories || [],
              };
            } catch (error) {
              console.error(
                `Error loading subcategories for category ${category.id}:`,
                error
              );
              return {
                ...category,
                subcategories: [],
              };
            }
          })
        );

        setCategories(categoriesWithSubcategories);
      }
    } catch (error) {
      console.error("Error loading footer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener todas las subcategorías únicas
  const allSubcategories = categories.reduce((acc: Subcategory[], category) => {
    if (category.subcategories) {
      acc.push(...category.subcategories);
    }
    return acc;
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200 shadow-lg">
      {/* Categories Section */}

      {/* Separator */}

      {/* Company Info Section */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-xl font-bold text-red-600">LusoInsumos</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tu aliado confiable en productos de calidad para el hogar y
              negocio. Más de 5 años de experiencia en el mercado.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/5493417410787"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.309" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Enlaces Rápidos
            </h4>
            <nav className="space-y-2">
              <a
                href="/productos"
                className="block text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Todos los Productos
              </a>

              <a
                href="/nosotros"
                className="block text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Sobre Nosotros
              </a>
              <a
                href="/servicio-tecnico"
                className="block text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Servicio Técnico
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-4 h-4 text-red-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href="tel:+56912345678"
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  +5493417410787
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <svg
                  className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-gray-600">
                  <div>Lun - Vie: 9:00 - 18:00</div>
                  <div>Sáb: 9:00 - 14:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} LusoInsumos
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
