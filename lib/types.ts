// Product Image type
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

// Product types matching API structure
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: number;
  subcategory_id: number | null;
  created_at: string;
  updated_at: string;
  // Relationship data (when available)
  category_name?: string;
  subcategory_name?: string;
  images?: ProductImage[]; // Array de imágenes
}

// For frontend display (legacy compatibility)
export interface ProductDisplay {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Array de URLs de imágenes
  category: string;
  isFeature?: boolean;
  inStock: boolean;
  badge?: string;
}

// Slide types
export interface Slide {
  id: number;
  title?: string | null;
  subtitle?: string | null;
  image_url: string;
  link?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlideFormData {
  title: string;
  subtitle?: string;
  image: File | null;
  link?: string;
  is_active: boolean;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

// Product form data
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  subcategory_id: number | null;
  image?: File | null; // Mantener para compatibilidad
  images?: File[]; // Array de archivos de imagen
}

// Pagination
export interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// API Response types
export interface ProductsResponse {
  products: Product[];
  pagination: PaginationData;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface SubcategoriesResponse {
  subcategories: Subcategory[];
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Legacy types for homepage
export interface HeaderSlide {
  id: string;
  image: string;
  title?: string | null;
  subtitle?: string | null;
  link?: string | null;
}

export interface HomePageData {
  headerSlides: HeaderSlide[];
  featuredProducts: ProductDisplay[];
}