"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Badge
} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  authService,
  productService,
  categoryService,
  getImageUrl,
} from "@/lib/api";
import {
  Product,
  Category,
  User,
  ProductsResponse,
  CategoriesResponse,
} from "@/lib/types";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  SlidersHorizontal,
  Download,
  Upload,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ProductForm from "@/components/admin/product-form";

type SortField = "name" | "price" | "stock" | "created_at";
type SortDirection = "asc" | "desc";

export default function ProductsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in_stock" | "low_stock" | "out_of_stock"
  >("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [
    currentPage,
    searchTerm,
    selectedCategory,
    stockFilter,
    sortField,
    sortDirection,
    itemsPerPage,
  ]);

  const loadInitialData = async () => {
    try {
      const [userResponse, categoriesResponse] = await Promise.all([
        authService.getMe(),
        categoryService.getAll(),
      ]);

      if (userResponse.success) {
        setUser(userResponse.data.user);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar datos iniciales");
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: selectedCategory,
        stock_filter: stockFilter,
        sort_by: sortField,
        sort_direction: sortDirection,
      });

      if (response.success) {
        const data = response.data as ProductsResponse;
        setProducts(data.products);
        setTotalPages(data.pagination.total_pages);
        setTotalItems(data.pagination.total_items);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setStockFilter("all");
    setSortField("name");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || selectedCategory || stockFilter !== "all";

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!deletingProduct) {
      setDeletingProduct(product);
      return;
    }

    try {
      const response = await productService.delete(product.id.toString());
      if (response.success) {
        toast.success("Producto eliminado exitosamente");
        loadProducts();
        setDeletingProduct(null);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar producto");
    }
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setEditingProduct(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Minus className="h-3 w-3" />
          Sin stock
        </Badge>
      );
    } else if (stock < 10) {
      return (
        <Badge
          variant="secondary"
          className="gap-1 bg-orange-100 text-orange-800 hover:bg-orange-200"
        >
          <TrendingDown className="h-3 w-3" />
          Stock bajo
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="default"
          className="gap-1 bg-green-100 text-green-800 hover:bg-green-200"
        >
          <TrendingUp className="h-3 w-3" />
          En stock
        </Badge>
      );
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getSortTooltip = (field: SortField) => {
    if (sortField !== field)
      return `Ordenar por ${
        field === "name" ? "nombre" : field === "price" ? "precio" : "stock"
      }`;

    const fieldName =
      field === "name" ? "nombre" : field === "price" ? "precio" : "stock";
    if (sortDirection === "asc") {
      switch (field) {
        case "name":
          return "Ordenado A-Z, clic para Z-A";
        case "price":
          return "Ordenado: más barato → más caro, clic para invertir";
        case "stock":
          return "Ordenado: menor → mayor stock, clic para invertir";
        default:
          return `Ordenado ascendente por ${fieldName}`;
      }
    } else {
      switch (field) {
        case "name":
          return "Ordenado Z-A, clic para A-Z";
        case "price":
          return "Ordenado: más caro → más barato, clic para invertir";
        case "stock":
          return "Ordenado: mayor → menor stock, clic para invertir";
        default:
          return `Ordenado descendente por ${fieldName}`;
      }
    }
  };

  const getFilteredProductsCount = () => {
    const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const inStock = products.filter((p) => p.stock >= 10).length;

    return { lowStock, outOfStock, inStock };
  };

  const stats = getFilteredProductsCount();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user || undefined} />

      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header mejorado */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  Gestión de Productos
                </h1>
                <p className="text-gray-600 mt-2">
                  Administra el catálogo de productos de tu tienda
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleOpenForm}
                  className="shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalItems}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        En Stock
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.inStock}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Stock Bajo
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats.lowStock}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-orange-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Sin Stock
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats.outOfStock}
                      </p>
                    </div>
                    <Minus className="h-8 w-8 text-red-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Búsqueda y filtros mejorados */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Barra de búsqueda principal */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar productos por nombre, descripción o SKU..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-12 h-12 text-base border-2 focus:border-blue-500 transition-colors"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSearch("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-12 px-6"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                    {hasActiveFilters && (
                      <Badge
                        variant="secondary"
                        className="ml-2 px-1.5 py-0.5 text-xs"
                      >
                        {
                          [
                            searchTerm ? 1 : 0,
                            selectedCategory ? 1 : 0,
                            stockFilter !== "all" ? 1 : 0,
                          ].filter(Boolean).length
                        }
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Filtros expandibles */}
                {showFilters && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Categoría
                        </label>
                        <Select
                          value={selectedCategory || "all"}
                          onValueChange={(value) =>
                            setSelectedCategory(value === "all" ? "" : value)
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Todas las categorías" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              Todas las categorías
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Estado de Stock
                        </label>
                        <Select
                          value={stockFilter}
                          onValueChange={(value: typeof stockFilter) =>
                            setStockFilter(value)
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              Todos los productos
                            </SelectItem>
                            <SelectItem value="in_stock">
                              En stock (10+)
                            </SelectItem>
                            <SelectItem value="low_stock">
                              Stock bajo (1-9)
                            </SelectItem>
                            <SelectItem value="out_of_stock">
                              Sin stock
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Productos por página
                        </label>
                        <Select
                          value={itemsPerPage.toString()}
                          onValueChange={(value) =>
                            setItemsPerPage(parseInt(value))
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 productos</SelectItem>
                            <SelectItem value="25">25 productos</SelectItem>
                            <SelectItem value="50">50 productos</SelectItem>
                            <SelectItem value="100">100 productos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Filter className="h-4 w-4" />
                          Filtros activos:
                          {searchTerm && (
                            <Badge variant="outline">
                              Búsqueda: "{searchTerm}"
                            </Badge>
                          )}
                          {selectedCategory && (
                            <Badge variant="outline">Categoría</Badge>
                          )}
                          {stockFilter !== "all" && (
                            <Badge variant="outline">Stock</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Limpiar filtros
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabla de productos mejorada */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-20">Imagen</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("name")}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                          title={getSortTooltip("name")}
                        >
                          Producto {getSortIcon("name")}
                        </Button>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Categoría</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("price")}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                          title={getSortTooltip("price")}
                        >
                          Precio {getSortIcon("price")}
                        </Button>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("stock")}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                          title={getSortTooltip("stock")}
                        >
                          Stock {getSortIcon("stock")}
                        </Button>
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">Estado</TableHead>
                      <TableHead className="hidden xl:table-cell">Destacado</TableHead>
                      <TableHead className="w-20">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: itemsPerPage }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={7}>
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-pulse text-gray-500 text-center">
                                <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p>Cargando productos...</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <Package className="h-16 w-16 mb-4 opacity-30" />
                            <h3 className="text-lg font-semibold mb-2">
                              No hay productos
                            </h3>
                            <p className="text-center max-w-md">
                              {searchTerm ||
                              selectedCategory ||
                              stockFilter !== "all"
                                ? "No se encontraron productos que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda."
                                : "Parece que aún no has agregado productos a tu catálogo. ¡Comienza creando tu primer producto!"}
                            </p>
                            {!hasActiveFilters && (
                              <Button
                                onClick={() => setIsFormOpen(true)}
                                className="mt-4"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Crear primer producto
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>
                            <div className="relative">
                              <img
                                src={getImageUrl(product.image_url)}
                                alt={product.name}
                                className="w-14 h-14 object-cover rounded-xl shadow-sm border"
                              />
                              {product.stock === 0 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    SIN
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-sm">
                              <p className="font-semibold text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {product.description}
                              </p>
                              {/* Información adicional para móviles */}
                              <div className="md:hidden mt-2 space-y-1">
                                <p className="text-sm font-medium text-green-600">
                                  {formatPrice(product.price)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Stock: {product.stock}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm">
                              <span className="font-medium">
                                {product.category_name}
                              </span>
                              {product.subcategory_name && (
                                <span className="text-gray-500 block text-xs">
                                  {product.subcategory_name}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell font-bold text-lg">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span
                              className={`font-bold text-lg ${
                                product.stock === 0
                                  ? "text-red-600"
                                  : product.stock < 10
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{getStockBadge(product.stock)}</TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Badge
                              variant={
                                product.featured === 1 ? "default" : "secondary"
                              }
                              className={
                                product.featured === 1
                                  ? "bg-yellow-500 hover:bg-yellow-600"
                                  : ""
                              }
                            >
                              {product.featured === 1 ? "Destacado" : "Normal"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar producto
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteProduct(product)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación mejorada */}
              {totalPages > 1 && (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 py-4 border-t bg-gray-50">
                  <p className="text-sm text-gray-700 text-center lg:text-left">
                    Mostrando{" "}
                    <span className="font-semibold">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{" "}
                    de <span className="font-semibold">{totalItems}</span>{" "}
                    productos
                  </p>
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="hidden sm:inline-flex"
                    >
                      Primero
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    <div className="flex items-center space-x-1">
                      {/* Páginas simplificadas para mobile */}
                      <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded">
                        {currentPage}
                      </span>
                      <span className="text-sm text-gray-500">
                        de {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:inline-flex"
                    >
                      Último
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal del Formulario de Productos */}
          <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
            <DialogContent 
              className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl"
              style={{
                maxWidth: 'min(896px, 95vw)',
                width: '95vw',
                maxHeight: '90vh',
                padding: 0,
                borderRadius: '12px'
              }}
              showCloseButton={false}
            >
              {/* Header del Modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                      {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                      {editingProduct
                        ? "Modifica los datos del producto"
                        : "Completa los datos para crear un nuevo producto"}
                    </DialogDescription>
                  </div>
                  
                  {/* Botón de cerrar personalizado */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseForm}
                    className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Contenido del Formulario con Scroll */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                <div className="px-4 sm:px-6 py-4">
                  <ProductForm
                    product={editingProduct}
                    categories={categories}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseForm}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!deletingProduct}
            onOpenChange={() => setDeletingProduct(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar el producto{" "}
                  <strong>"{deletingProduct?.name}"</strong>? Esta acción no se
                  puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDeletingProduct(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    deletingProduct && handleDeleteProduct(deletingProduct)
                  }
                  className="shadow-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
