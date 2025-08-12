"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { authService, categoryService, subcategoryService } from "@/lib/api";
import { Category, Subcategory, User } from "@/lib/types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tags,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  MoreHorizontal
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CategoryForm from "@/components/admin/category-form";
import SubcategoryForm from "@/components/admin/subcategory-form";

interface CategoryWithSubcategories extends Category {
  subcategories?: Subcategory[];
  isExpanded?: boolean;
  subcategoryCount?: number;
}

export default function CategoriesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form states
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isSubcategoryFormOpen, setIsSubcategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<Category | null>(null);
  
  // Delete states
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState<Subcategory | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [userResponse, categoriesResponse] = await Promise.all([
        authService.getMe(),
        categoryService.getAll()
      ]);

      if (userResponse.success) {
        setUser(userResponse.data.user);
      }

      if (categoriesResponse.success) {
        const categoriesData = categoriesResponse.data.categories;
        
        // Load subcategories for each category
        const categoriesWithSubcategories = await Promise.all(
          categoriesData.map(async (category: Category) => {
            try {
              const subcategoriesResponse = await categoryService.getSubcategories(category.id.toString());
              const subcategories = subcategoriesResponse.success ? subcategoriesResponse.data.subcategories : [];
              
              return {
                ...category,
                subcategories: subcategories || [],
                subcategoryCount: subcategories?.length || 0,
                isExpanded: false
              };
            } catch (error) {
              console.error(`Error loading subcategories for category ${category.id}:`, error);
              return {
                ...category,
                subcategories: [],
                subcategoryCount: 0,
                isExpanded: false
              };
            }
          })
        );

        setCategories(categoriesWithSubcategories);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar datos iniciales');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, isExpanded: !cat.isExpanded }
          : cat
      )
    );
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleCreateSubcategory = (category: Category) => {
    setSelectedCategoryForSubcategory(category);
    setEditingSubcategory(null);
    setIsSubcategoryFormOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    const parentCategory = categories.find(cat => cat.id === subcategory.category_id);
    setSelectedCategoryForSubcategory(parentCategory || null);
    setEditingSubcategory(subcategory);
    setIsSubcategoryFormOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!deletingCategory) {
      setDeletingCategory(category);
      return;
    }

    try {
      const response = await categoryService.delete(category.id.toString());
      if (response.success) {
        toast.success(`Categoría "${category.name}" eliminada exitosamente`, {
          description: 'La categoría y todas sus subcategorías han sido eliminadas'
        });
        loadInitialData();
        setDeletingCategory(null);
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      
      // Distinguir entre errores de negocio y errores técnicos
      if (error.isBusinessError) {
        // Error de negocio (400) - mostrar como advertencia
        toast.warning(`No se puede eliminar la categoría "${category.name}"`, {
          description: error.message || 'La categoría tiene productos asociados'
        });
      } else {
        // Error técnico (500, etc.) - mostrar como error
        toast.error(`Error al eliminar la categoría "${category.name}"`, {
          description: error.message || 'Error interno del servidor. Inténtalo de nuevo o contacta al administrador'
        });
      }
    }
  };

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    if (!deletingSubcategory) {
      setDeletingSubcategory(subcategory);
      return;
    }

    try {
      const response = await subcategoryService.delete(subcategory.id.toString());
      if (response.success) {
        toast.success(`Subcategoría "${subcategory.name}" eliminada exitosamente`, {
          description: 'Los productos de esta subcategoría ya no estarán categorizados'
        });
        loadInitialData();
        setDeletingSubcategory(null);
      }
    } catch (error: any) {
      console.error('Error deleting subcategory:', error);
      
      // Distinguir entre errores de negocio y errores técnicos
      if (error.isBusinessError) {
        // Error de negocio (400) - mostrar como advertencia
        toast.warning(`No se puede eliminar la subcategoría "${subcategory.name}"`, {
          description: error.message || 'La subcategoría tiene productos asociados'
        });
      } else {
        // Error técnico (500, etc.) - mostrar como error
        toast.error(`Error al eliminar la subcategoría "${subcategory.name}"`, {
          description: error.message || 'Error interno del servidor. Inténtalo de nuevo o contacta al administrador'
        });
      }
    }
  };

  const handleFormSubmit = () => {
    setIsCategoryFormOpen(false);
    setIsSubcategoryFormOpen(false);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setSelectedCategoryForSubcategory(null);
    loadInitialData();
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories?.some(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalSubcategories = categories.reduce((total, cat) => total + (cat.subcategoryCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user || undefined} />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
            <p className="text-gray-600 mt-2">
              Administra las categorías y subcategorías de tu tienda
            </p>
          </div>

          {/* Actions and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                <Tags className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground">
                  categorías principales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subcategorías</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubcategories}</div>
                <p className="text-xs text-muted-foreground">
                  subcategorías totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={handleCreateCategory} className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar categorías y subcategorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Categorías y Subcategorías
              </CardTitle>
              <CardDescription>
                Vista jerárquica de todas las categorías del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Subcategorías</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="w-20">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-pulse text-gray-500">
                              Cargando categorías...
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Tags className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No hay categorías</p>
                            <p className="text-sm">
                              {searchTerm 
                                ? 'No se encontraron categorías con el término de búsqueda'
                                : 'Comienza creando tu primera categoría'
                              }
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => {
                        const categoryRows = [];
                        
                        // Category Row
                        categoryRows.push(
                          <TableRow key={`category-${category.id}`} className="bg-gray-50">
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCategoryExpansion(category.id)}
                                className="p-0 h-8 w-8"
                              >
                                {category.subcategories && category.subcategories.length > 0 ? (
                                  category.isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )
                                ) : (
                                  <Folder className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Tags className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{category.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {category.description || 'Sin descripción'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {category.subcategoryCount || 0} subcategorías
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCreateSubcategory(category)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Agregar
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-500">
                                {category.created_at ? new Date(category.created_at).toLocaleDateString('es-ES') : 'Sin fecha'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteCategory(category)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );

                        // Subcategories Rows
                        if (category.isExpanded && category.subcategories) {
                          category.subcategories.forEach((subcategory) => {
                            categoryRows.push(
                              <TableRow key={`subcategory-${subcategory.id}`} className="bg-white">
                                <TableCell className="pl-8">
                                  <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 rounded-bl-md"></div>
                                </TableCell>
                                <TableCell className="pl-2">
                                  <div className="flex items-center gap-2">
                                    <FolderOpen className="h-4 w-4 text-orange-600" />
                                    <span>{subcategory.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600">
                                    {subcategory.description || 'Sin descripción'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">Subcategoría</Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-500">
                                    {subcategory.created_at ? new Date(subcategory.created_at).toLocaleDateString('es-ES') : 'Sin fecha'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditSubcategory(subcategory)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteSubcategory(subcategory)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          });
                        }

                        return categoryRows;
                      }).flat()
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Category Form Dialog */}
          <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Modifica los datos de la categoría'
                    : 'Completa los datos para crear una nueva categoría'
                  }
                </DialogDescription>
              </DialogHeader>
              <CategoryForm 
                category={editingCategory}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsCategoryFormOpen(false);
                  setEditingCategory(null);
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Subcategory Form Dialog */}
          <Dialog open={isSubcategoryFormOpen} onOpenChange={setIsSubcategoryFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
                </DialogTitle>
                <DialogDescription>
                  {editingSubcategory 
                    ? 'Modifica los datos de la subcategoría'
                    : `Crear nueva subcategoría en "${selectedCategoryForSubcategory?.name}"`
                  }
                </DialogDescription>
              </DialogHeader>
              <SubcategoryForm 
                subcategory={editingSubcategory}
                categories={categories}
                selectedCategory={selectedCategoryForSubcategory}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsSubcategoryFormOpen(false);
                  setEditingSubcategory(null);
                  setSelectedCategoryForSubcategory(null);
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Category Confirmation */}
          <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar la categoría "{deletingCategory?.name}"?
                  {deletingCategory && categories.find(c => c.id === deletingCategory.id)?.subcategoryCount! > 0 && (
                    <span className="block mt-2 text-orange-600 font-medium">
                      Esta categoría tiene subcategorías asociadas que también serán eliminadas.
                    </span>
                  )}
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setDeletingCategory(null)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deletingCategory && handleDeleteCategory(deletingCategory)}
                >
                  Eliminar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Subcategory Confirmation */}
          <Dialog open={!!deletingSubcategory} onOpenChange={() => setDeletingSubcategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar la subcategoría "{deletingSubcategory?.name}"?
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setDeletingSubcategory(null)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deletingSubcategory && handleDeleteSubcategory(deletingSubcategory)}
                >
                  Eliminar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={4000}
      />
    </div>
  );
} 