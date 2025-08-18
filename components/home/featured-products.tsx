import { ProductDisplay } from "@/lib/types";
import ProductCard from "./product-card";

interface FeaturedProductsProps {
  products: ProductDisplay[];
  onAddToCart?: (product: ProductDisplay) => void;
}

export function FeaturedProducts({ 
  products, 
  onAddToCart
}: FeaturedProductsProps) {
  if (products.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Productos Destacados
          </h2>
          <div className="text-center text-muted-foreground">
            <p>No hay productos destacados para mostrar</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-full border border-orange-200">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-orange-800 font-semibold text-sm uppercase tracking-wide">Selección Especial</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
            Productos Destacados
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 mx-auto rounded-full mb-6"></div>
          
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Descubre nuestra selección especial de productos más populares y mejor valorados por nuestros clientes
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
          {products.map((product) => {
            // ProductDisplay received correctly
            
            return (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}