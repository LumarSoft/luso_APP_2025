"use client";

import { useState, useEffect, use } from "react";
import { productService, categoryService, getImageUrl } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { Package, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/toast";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = use(searchParams);
  const categoria = params.categoria;
  const subcategoria = params.subcategoria;
  const search = params.search;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [subcategoryName, setSubcategoryName] = useState<string>("");
  const [isLoadingCategoryNames, setIsLoadingCategoryNames] = useState(false);

  const { addItem } = useCart();
  const { addToast } = useToast();

  const itemsPerPage = 12;

  useEffect(() => {
    loadProducts();
    loadCategoryNames();
  }, [categoria, subcategoria, search, currentPage]);

  const loadCategoryNames = async () => {
    if (categoria) {
      try {
        setIsLoadingCategoryNames(true);
        const categoriesResponse = await categoryService.getAll();
        if (categoriesResponse.success) {
          const foundCategory = categoriesResponse.data.categories.find(
            (cat: Category) => cat.id.toString() === categoria
          );

          if (foundCategory) {
            setCategoryName(foundCategory.name);

            // Si también hay subcategoría, buscarla
            if (subcategoria) {
              const subcategoriesResponse =
                await categoryService.getSubcategories(categoria as string);
              if (subcategoriesResponse.success) {
                const foundSubcategory =
                  subcategoriesResponse.data.subcategories.find(
                    (sub: any) => sub.id.toString() === subcategoria
                  );
                if (foundSubcategory) {
                  setSubcategoryName(foundSubcategory.name);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading category names:", error);
      } finally {
        setIsLoadingCategoryNames(false);
      }
    } else {
      setCategoryName("");
      setSubcategoryName("");
      setIsLoadingCategoryNames(false);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(search && { search: search as string }),
        ...(categoria && { category: categoria as string }),
        ...(subcategoria && { subcategory: subcategoria as string }),
      };

      const response = await productService.getAll(params);

      if (response.success) {
        setProducts(response.data.products || []);

        if (response.data.pagination) {
          setTotalPages(response.data.pagination.total_pages);
          setTotalItems(response.data.pagination.total_items);
        }
      } else {
        setError("Error al cargar los productos");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Error al conectar con el servidor");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      addToast({
        type: "error",
        title: "Producto agotado",
        description: "Este producto no está disponible en este momento",
        duration: 3000,
      });
      return;
    }

    addItem(product);
    addToast({
      type: "success",
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent mb-4">
              {search ? `Resultados para "${search}"` : "Nuestros Productos"}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 mx-auto rounded-full"></div>
          </div>

          {(categoria || search) && (
            <div className="mb-8 text-center">
              <div className="inline-block bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-full border border-orange-200">
                <p className="text-lg font-medium text-gray-700">
                  {search ? (
                    <>
                      <span className="text-orange-600 font-semibold">
                        Búsqueda:
                      </span>{" "}
                      {search}
                      {categoria && (
                        <>
                          <span className="mx-2 text-orange-400">•</span>
                          <span className="text-red-600 font-semibold">
                            en:
                          </span>
                          {isLoadingCategoryNames ? (
                            <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse ml-1">
                              {" "}
                            </span>
                          ) : (
                            categoryName || categoria
                          )}
                        </>
                      )}
                    </>
                  ) : categoria ? (
                    subcategoria ? (
                      <>
                        <span className="text-orange-600 font-semibold">
                          Categoría:
                        </span>
                        {isLoadingCategoryNames ? (
                          <span className="inline-block w-20 h-4 bg-gray-200 rounded animate-pulse ml-1"></span>
                        ) : (
                          categoryName || categoria
                        )}
                        <span className="mx-2 text-orange-400">•</span>
                        <span className="text-red-600 font-semibold">
                          Subcategoría:
                        </span>
                        {isLoadingCategoryNames ? (
                          <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse ml-1"></span>
                        ) : (
                          subcategoryName || subcategoria
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-orange-600 font-semibold">
                          Categoría:
                        </span>
                        {isLoadingCategoryNames ? (
                          <span className="inline-block w-20 h-4 bg-gray-200 rounded animate-pulse ml-1"></span>
                        ) : (
                          categoryName || categoria
                        )}
                      </>
                    )
                  ) : null}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Error al cargar productos
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadProducts}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && (
            <>
              {products.length > 0 ? (
                <>
                  {/* Results Info */}
                  <div className="mb-6 text-center">
                    <p className="text-gray-600">
                      Mostrando {products.length} de {totalItems} productos
                      {currentPage > 1 &&
                        ` • Página ${currentPage} de ${totalPages}`}
                    </p>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 auto-rows-fr max-w-7xl mx-auto">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col w-full h-auto"
                      >
                        <div className="h-40 bg-white flex items-center justify-center relative overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={getImageUrl(product.image_url)}
                              alt={product.name}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                          ) : (
                            <Package className="h-12 w-12 text-gray-400" />
                          )}
                          <div className="hidden absolute inset-0 flex items-center justify-center bg-white">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>

                          {/* Stock Badge */}
                          <div className="absolute top-3 right-3">
                            {product.stock > 0 ? (
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
                          {product.featured === 1 && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Destacado
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>

                          {product.category_name && (
                            <p className="text-xs text-orange-600 mb-2 font-medium">
                              {product.category_name}
                              {product.subcategory_name &&
                                ` • ${product.subcategory_name}`}
                            </p>
                          )}

                          <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-2 flex-1">
                            {product.description ||
                              "Sin descripción disponible"}
                          </p>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col">
                              <span className="text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Stock: {product.stock}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto">
                            {product.stock > 0 ? (
                              <button
                                onClick={() => handleAddToCart(product)}
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
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${
                          currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        } transition-colors`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isNearCurrent = Math.abs(page - currentPage) <= 2;
                        const isFirst = page === 1;
                        const isLast = page === totalPages;

                        if (isNearCurrent || isFirst || isLast) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md"
                                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === 2 && currentPage > 4) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        } else if (
                          page === totalPages - 1 &&
                          currentPage < totalPages - 3
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${
                          currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        } transition-colors`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* No Products Found */
                <div className="text-center py-16">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-8 max-w-md mx-auto">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No se encontraron productos
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {search
                        ? `No hay productos que coincidan con "${search}"`
                        : categoria
                        ? `No hay productos en esta categoría`
                        : "No hay productos disponibles en este momento"}
                    </p>
                    <Link
                      href="/productos"
                      className="inline-block px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium"
                    >
                      Ver todos los productos
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
