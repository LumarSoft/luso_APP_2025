"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { productService, categoryService, getImageUrl } from "@/lib/api";
import { Product, Category, Subcategory, ProductFormData } from "@/lib/types";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category_id: 0,
    subcategory_id: null,
    featured: false,
    image: null,
    images: [],
  });

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id,
        featured: Boolean(product.featured),
        image: null,
        images: [],
      });

      // Configurar imágenes de vista previa
      const existingImages =
        product.images?.map((img) => getImageUrl(img.image_url)) || [];
      if (existingImages.length === 0 && product.image_url) {
        existingImages.push(getImageUrl(product.image_url));
      }
      setPreviewImages(existingImages);

      // Load subcategories for the product's category
      if (product.category_id) {
        loadSubcategories(product.category_id);
      }
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category_id: 0,
        featured: false,
        subcategory_id: null,
        image: null,
        images: [],
      });
      setPreviewImages([]);
      setSubcategories([]);
    }
    setErrors({});
  }, [product]);

  const loadSubcategories = async (categoryId: number) => {
    try {
      setIsLoadingSubcategories(true);
      const response = await categoryService.getSubcategories(
        categoryId.toString()
      );
      if (response.success) {
        setSubcategories(response.data.subcategories || []);
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Load subcategories when category changes
    if (field === "category_id" && value !== formData.category_id) {
      setFormData((prev) => ({ ...prev, subcategory_id: null }));
      setSubcategories([]);
      if (value) {
        loadSubcategories(Number(value));
      }
    }
  };

  // Image validation
  const validateImage = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Tipo de archivo no válido. Solo se permiten JPEG, PNG y WebP."
      );
      return false;
    }

    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande. Máximo 2MB.");
      return false;
    }

    return true;
  };

  // Validate multiple images
  const validateImages = (files: FileList): File[] => {
    const validFiles: File[] = [];
    const maxImages = 5;

    if (files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas.`);
      return [];
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (validateImage(file)) {
        validFiles.push(file);
      }
    }

    return validFiles;
  };

  // Handle multiple image selection
  const handleImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const validFiles = validateImages(files);

      if (validFiles.length > 0) {
        // Combinar con imágenes existentes, máximo 5 total
        const currentImages = formData.images || [];
        const totalImages = currentImages.length + validFiles.length;

        if (totalImages > 5) {
          toast.error(
            `Solo puedes tener máximo 5 imágenes. Actualmente tienes ${currentImages.length}.`
          );
          return;
        }

        const newImages = [...currentImages, ...validFiles];
        setFormData({ ...formData, images: newImages });

        // Create previews for new images
        const newPreviews: string[] = [];
        validFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push(e.target?.result as string);
            if (newPreviews.length === validFiles.length) {
              setPreviewImages((prev) => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const validFiles = validateImages(files);

      if (validFiles.length > 0) {
        // Combinar con imágenes existentes, máximo 5 total
        const currentImages = formData.images || [];
        const totalImages = currentImages.length + validFiles.length;

        if (totalImages > 5) {
          toast.error(
            `Solo puedes tener máximo 5 imágenes. Actualmente tienes ${currentImages.length}.`
          );
          return;
        }

        const newImages = [...currentImages, ...validFiles];
        setFormData({ ...formData, images: newImages });

        // Create previews for new images
        const newPreviews: string[] = [];
        validFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push(e.target?.result as string);
            if (newPreviews.length === validFiles.length) {
              setPreviewImages((prev) => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  // Remove specific image
  const removeImage = (index: number) => {
    const newImages = formData.images?.filter((_, i) => i !== index) || [];
    const newPreviews = previewImages.filter((_, i) => i !== index);

    setFormData({ ...formData, images: newImages });
    setPreviewImages(newPreviews);
  };

  // Remove all images
  const removeAllImages = () => {
    setFormData({ ...formData, images: [] });
    setPreviewImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    } else if (formData.name.length > 150) {
      newErrors.name = "El nombre no puede exceder 150 caracteres";
    }

    if (formData.description.length > 1000) {
      newErrors.description = "La descripción no puede exceder 1000 caracteres";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }

    if (formData.stock < 0) {
      newErrors.stock = "El stock no puede ser negativo";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Debe seleccionar una categoría";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    try {
      setIsLoading(true);

      // Create FormData for API request
      const apiFormData = new FormData();
      apiFormData.append("name", formData.name.trim());
      apiFormData.append("description", formData.description.trim());
      apiFormData.append("price", formData.price.toString());
      apiFormData.append("stock", formData.stock.toString());
      apiFormData.append("category_id", formData.category_id.toString());
      apiFormData.append("featured", formData.featured ? "1" : "0");

      if (formData.subcategory_id) {
        apiFormData.append(
          "subcategory_id",
          formData.subcategory_id.toString()
        );
      }

      // Append images if present
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          apiFormData.append("images", image);
        });
      }

      let response;
      if (product) {
        // Update existing product
        response = await productService.update(
          product.id.toString(),
          apiFormData
        );
      } else {
        // Create new product
        response = await productService.create(apiFormData);
      }

      if (response.success) {
        toast.success(
          product
            ? "Producto actualizado exitosamente"
            : "Producto creado exitosamente"
        );
        onSubmit();
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Producto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Ingresa el nombre del producto"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe el producto..."
            rows={3}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
          <p className="text-xs text-gray-500">
            {formData.description.length}/1000 caracteres
          </p>
        </div>
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio (ARS) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              handleInputChange("price", parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) =>
              handleInputChange("stock", parseInt(e.target.value) || 0)
            }
            placeholder="0"
            className={errors.stock ? "border-red-500" : ""}
          />
          {errors.stock && (
            <p className="text-sm text-red-500">{errors.stock}</p>
          )}
        </div>
      </div>

      {/* Featured Product */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            id="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => handleInputChange("featured", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="featured" className="text-sm font-medium">
            Producto Destacado
          </Label>
        </div>
        <p className="text-xs text-gray-500">
          Los productos destacados aparecerán en la sección principal de la
          página de inicio
        </p>
      </div>

      {/* Category and Subcategory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select
            value={formData.category_id.toString()}
            onValueChange={(value) =>
              handleInputChange("category_id", parseInt(value))
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              side="top" 
              align="start" 
              className="w-full min-w-[200px]"
              sideOffset={4}
            >
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && (
            <p className="text-sm text-red-500">{errors.category_id}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategoría</Label>
          <Select
            value={formData.subcategory_id?.toString() || ""}
            onValueChange={(value) =>
              handleInputChange(
                "subcategory_id",
                value ? parseInt(value) : null
              )
            }
            disabled={!formData.category_id || isLoadingSubcategories}
          >
            <SelectTrigger className="h-10">
              <SelectValue 
                placeholder={
                  isLoadingSubcategories
                    ? "Cargando subcategorías..."
                    : "Seleccionar subcategoría (opcional)"
                } 
              />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              side="top" 
              align="start" 
              className="w-full min-w-[200px]"
              sideOffset={4}
            >
              {subcategories.map((subcategory: any) => (
                <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Images Upload */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <Label>Imágenes del Producto (Máximo 5)</Label>
          {previewImages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeAllImages}
              className="text-red-600 hover:text-red-500 self-start sm:self-auto"
            >
              Eliminar todas
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-all duration-200 touch-manipulation ${
                isDragOver
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-gray-400 active:border-blue-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onTouchStart={() => setIsDragOver(true)}
              onTouchEnd={() => setIsDragOver(false)}
            >
              <ImageIcon
                className={`h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 transition-colors ${
                  isDragOver ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <p
                className={`mb-2 text-sm sm:text-base transition-colors ${
                  isDragOver ? "text-blue-700 font-medium" : "text-gray-600"
                }`}
              >
                {isDragOver
                  ? "Suelta las imágenes aquí"
                  : "Arrastra y suelta imágenes o haz clic para seleccionar"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                PNG, JPG, JPEG hasta 2MB cada una. Máximo 5 imágenes.
              </p>
              {previewImages.length > 0 && (
                <p className="text-xs sm:text-sm text-blue-600 mt-2">
                  {previewImages.length}/5 imágenes seleccionadas
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {previewImages.length > 0
                ? "Agregar más imágenes"
                : "Seleccionar Imágenes"}
            </Button>

            {/* Images Preview Grid */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Vista previa ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 sm:h-8 sm:w-8 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t text-center justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto order-2 sm:order-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {product ? "Actualizando..." : "Creando..."}
            </>
          ) : product ? (
            "Actualizar Producto"
          ) : (
            "Crear Producto"
          )}
        </Button>
      </div>
    </form>
  );
}
