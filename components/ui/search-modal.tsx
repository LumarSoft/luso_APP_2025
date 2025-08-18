"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Package, Clock } from "lucide-react";
import { productService, getImageUrl } from "@/lib/api";
import { Product } from "@/lib/types";
import Link from "next/link";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Cargar búsquedas recientes del localStorage solo en el cliente
    if (typeof window !== 'undefined') {
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await productService.getAll({
          search: searchTerm,
          limit: 6
        });

        if (response.success) {
          setSearchResults(response.data.products || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      // Agregar a búsquedas recientes solo en el cliente
      if (typeof window !== 'undefined') {
        const updatedSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        
        // Redirigir a página de productos con búsqueda
        window.location.href = `/productos?search=${encodeURIComponent(term)}`;
      }
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-6 border-b border-gray-100">
          <div className="flex items-center flex-1 bg-gray-50 rounded-xl px-4 py-3">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar productos..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {searchTerm.trim().length === 0 ? (
            <div className="p-6 space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="flex items-center text-sm font-semibold text-gray-900 mb-3">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    Búsquedas Recientes
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="flex items-center w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Search className="h-4 w-4 mr-3 text-gray-400" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}


            </div>
          ) : (
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
                  <span className="ml-3 text-gray-600">Buscando...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Productos encontrados ({searchResults.length})
                  </h3>
                                     {searchResults.map((product) => (
                     <Link
                       key={product.id}
                       href={`/productos?categoria=${product.category_id}${product.subcategory_id ? `&subcategoria=${product.subcategory_id}` : ''}`}
                       onClick={onClose}
                       className="group block p-3 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-orange-200 bg-white hover:bg-orange-50/50"
                     >
                       <div className="flex items-center space-x-4">
                                                   <div className="relative w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                           {product.image_url ? (
                             <img
                               src={getImageUrl(product.image_url)}
                               alt={product.name}
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = 'none';
                                 target.nextElementSibling?.classList.remove('hidden');
                               }}
                             />
                           ) : (
                             <Package className="h-8 w-8 text-gray-400" />
                           )}
                           <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                             <Package className="h-8 w-8 text-gray-400" />
                           </div>
                           
                           {/* Stock Badge */}
                           <div className="absolute -top-1 -right-1">
                             {product.stock > 0 ? (
                               <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                             ) : (
                               <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                             )}
                           </div>
                         </div>
                         
                         <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 text-base">
                             {product.name}
                           </h4>
                           
                           {product.category_name && (
                             <p className="text-sm text-orange-600 font-medium mt-1">
                               {product.category_name}
                               {product.subcategory_name && ` • ${product.subcategory_name}`}
                             </p>
                           )}
                           
                           <div className="flex items-center justify-between mt-2">
                             <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                               ${product.price.toFixed(2)}
                             </span>
                             <span className="text-xs text-gray-500">
                               Stock: {product.stock}
                             </span>
                           </div>
                         </div>
                       </div>
                     </Link>
                   ))}
                  
                  {/* Ver todos los resultados */}
                                     <button
                     onClick={() => handleSearch(searchTerm)}
                     className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all duration-200 font-medium"
                   >
                     Ver todos los resultados para "{searchTerm}"
                   </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-500">
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 