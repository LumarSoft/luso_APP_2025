"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X, Search } from "lucide-react";
import { categoryService } from "@/lib/api";
import { Category, Subcategory } from "@/lib/types";
import { SearchModal } from "./search-modal";

interface CategoryWithSubcategories extends Category {
  subcategories?: Subcategory[];
}

export function Navbar() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMounted]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryService.getAll();

      if (response.success && response.data) {
        // Para cada categoría, obtener sus subcategorías
        const categoriesWithSubs = await Promise.all(
          (response.data as { categories: Category[] }).categories.map(
            async (category: Category) => {
              try {
                const subcategoriesResponse =
                  await categoryService.getSubcategories(
                    category.id.toString()
                  );
                return {
                  ...category,
                  subcategories:
                    subcategoriesResponse.success && subcategoriesResponse.data
                      ? (
                          subcategoriesResponse.data as {
                            subcategories: Subcategory[];
                          }
                        ).subcategories
                      : [],
                };
              } catch (error) {
                console.error(
                  `Error loading subcategories for category ${category.id}:`,
                  error
                );
                return { ...category, subcategories: [] };
              }
            }
          )
        );

        setCategories(categoriesWithSubs);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownToggle = (categoryId: number) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  return (
    <nav className="bg-gradient-to-r from-white to-orange-50 shadow-lg border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Fixed width to prevent compression */}
          <div className="flex-shrink-0 w-48">
            <Link href="/" className="flex items-center group">
              <div className="relative h-26 w-32 sm:h-38 sm:w-48 transition-all duration-200 group-hover:scale-105">
                <Image
                  src="/98b87bc8-8177-445e-b283-da11fce10e6e.png"
                  alt="LusoInsumos - Redes y Soporte IT"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Flexible center with overflow handling */}
          <div className="hidden lg:block flex-1 mx-8">
            <div className="flex items-baseline justify-center space-x-2 min-w-0">
              <Link
                href="/"
                className="text-gray-900 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group flex-shrink-0"
              >
                <span className="relative z-10">Inicio</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 rounded-md transition-all duration-200"></div>
              </Link>

              {/* Categories Dropdown - Scrollable if needed */}
              <div className="flex items-baseline space-x-1 min-w-0 overflow-hidden">
                {!isLoading &&
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="relative group flex-shrink-0"
                      onMouseEnter={() => setOpenDropdown(category.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button className="text-gray-900 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 relative group whitespace-nowrap">
                        <span className="relative z-10">{category.name}</span>
                        {category.subcategories &&
                          category.subcategories.length > 0 && (
                            <ChevronDown className="h-4 w-4 relative z-10 group-hover:text-red-600 transition-colors duration-200" />
                          )}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 rounded-md transition-all duration-200"></div>
                      </button>

                      {/* Dropdown Menu */}
                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <div
                            className={`absolute left-0 mt-1 w-56 rounded-lg shadow-xl bg-white border border-gray-200 transition-all duration-200 z-50 ${
                              openDropdown === category.id
                                ? "opacity-100 scale-100 visible"
                                : "opacity-0 scale-95 invisible"
                            }`}
                          >
                            <div className="py-3" role="menu">
                              {/* Category Title */}
                              <div className="px-4 mb-2">
                                <Link
                                  href={`/productos?categoria=${category.id}`}
                                  className="block text-sm font-bold bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent hover:from-orange-600 hover:to-red-600 transition-all duration-200 uppercase tracking-wider"
                                  role="menuitem"
                                >
                                  {category.name}
                                </Link>
                              </div>

                              {/* Divider */}
                              <div className="border-t border-gray-100 my-2"></div>

                              {/* Subcategories */}
                              <div className="px-2">
                                {category.subcategories.map((subcategory) => (
                                  <Link
                                    key={subcategory.id}
                                    href={`/productos?categoria=${category.id}&subcategoria=${subcategory.id}`}
                                    className="block px-2 py-2 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600 rounded-md transition-all duration-200 font-normal hover:shadow-sm"
                                    role="menuitem"
                                  >
                                    {subcategory.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
              </div>

              <Link
                href="/productos"
                className="text-gray-900 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group flex-shrink-0"
              >
                <span className="relative z-10">Todos los Productos</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 rounded-md transition-all duration-200"></div>
              </Link>
            </div>
          </div>

          {/* Right side - Fixed width to prevent compression */}
          <div className="flex-shrink-0 w-48 flex items-center justify-end space-x-3">
            {/* Service Technical Button */}
            <Link
              href="/servicio-tecnico"
              className="text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex-shrink-0"
            >
              Servicio Técnico
            </Link>

            {/* Search button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 hover:shadow-sm flex-shrink-0"
              aria-label="Buscar productos"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-400 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 hover:shadow-sm"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-orange-600 hover:bg-white transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>

              {!isLoading &&
                categories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    {category.subcategories &&
                    category.subcategories.length > 0 ? (
                      <>
                        <button
                          onClick={() => handleDropdownToggle(category.id)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-orange-600 hover:bg-white transition-colors duration-200"
                        >
                          <span>{category.name}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              openDropdown === category.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {openDropdown === category.id && (
                          <div className="pl-4 space-y-1 bg-gray-50 rounded-md p-3 ml-2">
                            {/* Category Title Mobile */}
                            <Link
                              href={`/productos?categoria=${category.id}`}
                              className="block px-2 py-1 rounded-md text-sm font-bold text-gray-900 hover:text-orange-600 hover:bg-white transition-colors duration-200 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {category.name}
                            </Link>

                            {/* Subcategories Mobile */}
                            <div className="space-y-1">
                              {category.subcategories.map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  href={`/productos?categoria=${category.id}&subcategoria=${subcategory.id}`}
                                  className="block px-2 py-1.5 rounded-md text-sm text-gray-600 hover:text-orange-600 hover:bg-white transition-colors duration-200"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={`/productos?categoria=${category.id}`}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-orange-600 hover:bg-white transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    )}
                  </div>
                ))}

              <Link
                href="/productos"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-orange-600 hover:bg-white transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Todos los Productos
              </Link>

              <Link
                href="/servicio-tecnico"
                className="block mx-3 my-2 text-center text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Servicio Técnico
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isMounted && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </nav>
  );
}
