import { ProductDisplay } from "@/lib/types";
import ProductCard from "./product-card";

interface FeaturedProductsProps {
  products: ProductDisplay[];
  onAddToCart?: (product: ProductDisplay) => void;
  onViewProduct?: (product: ProductDisplay) => void;
}

export function FeaturedProducts({ 
  products, 
  onAddToCart, 
  onViewProduct 
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
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Productos Destacados
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra selección especial de productos más populares y mejor valorados
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            // ProductDisplay received correctly
            
            return (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onView={onViewProduct}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}