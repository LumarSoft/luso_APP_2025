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
  WideDialog,
  WideDialogContent,
  WideDialogDescription,
  WideDialogHeader,
  WideDialogTitle,
} from "@/components/ui/wide-dialog";
import { Badge } from "@/components/ui/badge";
import { authService, slideService, getImageUrl } from "@/lib/api";
import { Slide, User } from "@/lib/types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  EyeOff,
  GripVertical,
  Monitor,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import SlideForm from "@/components/admin/slide-form";

export default function SlidesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [deletingSlide, setDeletingSlide] = useState<Slide | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [userResponse, slidesResponse] = await Promise.all([
        authService.getMe(),
        slideService.getAll(),
      ]);

      if (userResponse.success) {
        setUser(userResponse.data.user);
      }

      if (slidesResponse.success) {
        setSlides(slidesResponse.data.slides || []);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar datos iniciales");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSlides = async () => {
    try {
      setIsLoading(true);
      const response = await slideService.getAll();
      if (response.success) {
        setSlides(response.data.slides || []);
      }
    } catch (error) {
      console.error("Error loading slides:", error);
      toast.error("Error al cargar slides");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlide = () => {
    setEditingSlide(null);
    setIsFormOpen(true);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setIsFormOpen(true);
  };

  const handleDeleteSlide = async (slide: Slide) => {
    if (!deletingSlide) {
      setDeletingSlide(slide);
      return;
    }

    try {
      const response = await slideService.delete(slide.id.toString());
      if (response.success) {
        toast.success(`Slide "${slide.title}" eliminado exitosamente`);
        loadSlides();
        setDeletingSlide(null);
      }
    } catch (error: any) {
      console.error("Error deleting slide:", error);

      if (error.isBusinessError) {
        toast.warning(`No se puede eliminar el slide "${slide.title}"`, {
          description: error.message,
        });
      } else {
        toast.error(`Error al eliminar el slide "${slide.title}"`, {
          description: error.message || "Error interno del servidor",
        });
      }
    }
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingSlide(null);
    loadSlides();
  };

  const toggleSlideStatus = async (slide: Slide) => {
    // Actualizar inmediatamente el estado local para feedback visual
    const newStatus = !slide.is_active;
    setSlides((prevSlides) =>
      prevSlides.map((s) =>
        s.id === slide.id ? { ...s, is_active: newStatus } : s
      )
    );

    try {
      const formData = new FormData();
      formData.append("title", slide.title || "");
      formData.append("subtitle", slide.subtitle || "");
      formData.append("link", slide.link || "");
      formData.append("is_active", newStatus ? "true" : "false");

      const response = await slideService.update(slide.id.toString(), formData);
      if (response.success) {
        toast.success(
          `Slide ${slide.is_active ? "ocultado" : "mostrado"} exitosamente`
        );
        // Recargar para confirmar el estado del servidor
        loadSlides();
      } else {
        // Si falla, revertir el cambio local
        setSlides((prevSlides) =>
          prevSlides.map((s) =>
            s.id === slide.id ? { ...s, is_active: slide.is_active } : s
          )
        );
        toast.error("Error al cambiar el estado del slide");
      }
    } catch (error: any) {
      console.error("Error updating slide status:", error);
      // Revertir el cambio local si hay error
      setSlides((prevSlides) =>
        prevSlides.map((s) =>
          s.id === slide.id ? { ...s, is_active: slide.is_active } : s
        )
      );
      toast.error("Error al cambiar el estado del slide");
    }
  };

  const filteredSlides = slides.filter(
    (slide) =>
      slide.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slide.subtitle &&
        slide.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeSlides = slides.filter((slide) => slide.is_active).length;
  const inactiveSlides = slides.filter((slide) => !slide.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user || undefined} />

      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-blue-600" />
                  Gestión de Slides
                </h1>
                <p className="text-gray-600 mt-2">
                  Administra los slides del carousel principal de tu tienda
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleCreateSlide} className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Slide
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
                        {slides.length}
                      </p>
                    </div>
                    <Monitor className="h-8 w-8 text-blue-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Activos
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {activeSlides}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-green-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Inactivos
                      </p>
                      <p className="text-2xl font-bold text-gray-600">
                        {inactiveSlides}
                      </p>
                    </div>
                    <EyeOff className="h-8 w-8 text-gray-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Creados
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {slides.length}
                      </p>
                    </div>
                    <Monitor className="h-8 w-8 text-purple-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Información sobre medidas */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Especificaciones para imágenes de slides
                  </h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      <strong>Resolución recomendada:</strong> Responsive
                      automático (Mobile: 250px, Tablet: 864x422px, Desktop:
                      1400x484px)
                    </p>
                    <p>
                      <strong>Formatos aceptados:</strong> JPG, PNG, WebP
                    </p>
                    <p>
                      <strong>Tamaño máximo:</strong> 5MB
                    </p>
                    <p>
                      <strong>Nota:</strong> Las imágenes se adaptarán
                      automáticamente a diferentes tamaños de pantalla
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Búsqueda */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar slides por título o subtítulo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabla de slides */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-20">Imagen</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Subtítulo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-20">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={5}>
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-pulse text-gray-500 text-center">
                                <Monitor className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p>Cargando slides...</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredSlides.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <Monitor className="h-16 w-16 mb-4 opacity-30" />
                            <h3 className="text-lg font-semibold mb-2">
                              No hay slides
                            </h3>
                            <p className="text-center max-w-md">
                              {searchTerm
                                ? "No se encontraron slides que coincidan con la búsqueda."
                                : "Parece que aún no has creado slides para el carousel. ¡Comienza creando tu primer slide!"}
                            </p>
                            {!searchTerm && (
                              <Button
                                onClick={handleCreateSlide}
                                className="mt-4"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Crear primer slide
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSlides.map((slide) => (
                        <TableRow
                          key={slide.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>
                            <div className="relative">
                              <img
                                src={getImageUrl(slide.image_url) || ""}
                                alt={slide.title || ""}
                                className="w-16 h-10 object-cover rounded-lg shadow-sm border"
                              />
                              {!slide.is_active && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                  <EyeOff className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-sm">
                              <p className="font-semibold text-gray-900 truncate">
                                {slide.title}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-sm">
                              <p className="text-sm text-gray-500 truncate">
                                {slide.subtitle || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  slide.is_active ? "default" : "secondary"
                                }
                                className={
                                  slide.is_active
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }
                              >
                                {slide.is_active ? (
                                  <>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Visible
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Oculto
                                  </>
                                )}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSlideStatus(slide)}
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                                title={
                                  slide.is_active
                                    ? "Ocultar slide"
                                    : "Mostrar slide"
                                }
                              >
                                {slide.is_active ? (
                                  <Eye className="h-3 w-3 text-green-600" />
                                ) : (
                                  <EyeOff className="h-3 w-3 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <span className="sr-only">Abrir menú</span>
                                  <span className="h-4 w-4">⋮</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleEditSlide(slide)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar slide
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleSlideStatus(slide)}
                                >
                                  {slide.is_active ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Ocultar
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Mostrar
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteSlide(slide)}
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
            </CardContent>
          </Card>

          {/* Slide Form Dialog */}
          <WideDialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <WideDialogContent className="max-h-[90vh] overflow-y-auto">
              <WideDialogHeader>
                <WideDialogTitle>
                  {editingSlide ? "Editar Slide" : "Nuevo Slide"}
                </WideDialogTitle>
                <WideDialogDescription>
                  {editingSlide
                    ? "Modifica los datos del slide del carousel"
                    : "Completa los datos para crear un nuevo slide"}
                </WideDialogDescription>
              </WideDialogHeader>
              <SlideForm
                slide={editingSlide}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingSlide(null);
                }}
              />
            </WideDialogContent>
          </WideDialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={!!deletingSlide}
            onOpenChange={() => setDeletingSlide(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar el slide{" "}
                  <strong>"{deletingSlide?.title}"</strong>? Esta acción no se
                  puede deshacer y se eliminará también la imagen asociada.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDeletingSlide(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    deletingSlide && handleDeleteSlide(deletingSlide)
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
