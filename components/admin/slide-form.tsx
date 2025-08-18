"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { slideService, getImageUrl } from "@/lib/api";
import { Slide, SlideFormData } from "@/lib/types";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Link,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface SlideFormProps {
  slide?: Slide | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function SlideForm({
  slide,
  onSubmit,
  onCancel,
}: SlideFormProps) {
  const [formData, setFormData] = useState<SlideFormData>({
    title: "",
    subtitle: "",
    image: null,
    link: "",
    is_active: true,
    show_title: true,
    show_subtitle: true,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when slide changes
  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title ?? "",
        subtitle: slide.subtitle ?? "",
        image: null,
        link: slide.link ?? "",
        is_active: slide.is_active,
        show_title: slide.show_title !== undefined ? !!slide.show_title : true,
        show_subtitle: slide.show_subtitle !== undefined ? !!slide.show_subtitle : true,
      });
      setPreviewImage(slide.image_url ? getImageUrl(slide.image_url) : null);
    } else {
      // Reset form for new slide
      setFormData({
        title: "",
        subtitle: "",
        image: null,
        link: "",
        is_active: true,
        show_title: true,
        show_subtitle: true,
      });
      setPreviewImage(null);
    }
    setErrors({});
  }, [slide]);

  const handleInputChange = (field: keyof SlideFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede ser mayor a 5MB");
      return false;
    }

    setFormData((prev) => ({ ...prev, image: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
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

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      validateAndProcessFile(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(slide?.image_url ? getImageUrl(slide.image_url) : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Título es opcional, solo validar longitud si se proporciona
    if (formData.title && formData.title.length > 255) {
      newErrors.title = "El título no puede exceder 255 caracteres";
    }
    
    // Subtítulo es opcional, solo validar longitud si se proporciona
    if (formData.subtitle && formData.subtitle.length > 1000) {
      newErrors.subtitle = "El subtítulo no puede exceder 1000 caracteres";
    }

    if (formData.link && formData.link.trim()) {
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.link.trim())) {
        newErrors.link = "El enlace debe ser una URL válida";
      }
    }

    if (!slide && !formData.image) {
      newErrors.image = "La imagen es requerida para un nuevo slide";
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
      apiFormData.append("title", formData.title.trim());
      apiFormData.append("subtitle", formData.subtitle?.trim() || "");
      apiFormData.append("link", formData.link?.trim() || "");
  apiFormData.append("is_active", formData.is_active ? "true" : "false");
      apiFormData.append("show_title", formData.show_title ? "1" : "0");
      apiFormData.append("show_subtitle", formData.show_subtitle ? "1" : "0");
      if (formData.image) {
        apiFormData.append("image", formData.image);
      }

      let response;
      if (slide) {
        // Update existing slide
        response = await slideService.update(slide.id.toString(), apiFormData);
      } else {
        // Create new slide
        response = await slideService.create(apiFormData);
      }

      if (response.success) {
        toast.success(
          slide ? "Slide actualizado exitosamente" : "Slide creado exitosamente"
        );
        onSubmit();
      }
    } catch (error: any) {
      console.error("Error saving slide:", error);
      toast.error(error.message || "Error al guardar el slide");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título del Slide (opcional)</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Ingresa el título del slide (opcional)"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
          <Textarea
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => handleInputChange("subtitle", e.target.value)}
            placeholder="Descripción o subtítulo del slide (opcional)..."
            rows={2}
            className={errors.subtitle ? "border-red-500" : ""}
          />
          {errors.subtitle && (
            <p className="text-sm text-red-500">{errors.subtitle}</p>
          )}
          <p className="text-xs text-gray-500">
            {formData.subtitle?.length || 0}/1000 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Enlace (Opcional)</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => handleInputChange("link", e.target.value)}
              placeholder="https://ejemplo.com o #seccion"
              className={`pl-10 ${errors.link ? "border-red-500" : ""}`}
            />
          </div>
          {errors.link && <p className="text-sm text-red-500">{errors.link}</p>}
          <p className="text-xs text-gray-500">
            Deja vacío si no quieres que el slide sea clickeable
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <Label htmlFor="is_active">Estado</Label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            id="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => handleInputChange("is_active", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <Label htmlFor="is_active" className="text-sm font-normal">
            Slide activo (visible en el carousel)
          </Label>
        </div>
        <div className="flex items-center space-x-4">
          <input
            id="show_title"
            type="checkbox"
            checked={formData.show_title}
            onChange={(e) => handleInputChange("show_title", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <Label htmlFor="show_title" className="text-sm font-normal">
            Mostrar título
          </Label>
          <input
            id="show_subtitle"
            type="checkbox"
            checked={formData.show_subtitle}
            onChange={(e) => handleInputChange("show_subtitle", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <Label htmlFor="show_subtitle" className="text-sm font-normal">
            Mostrar subtítulo
          </Label>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Imagen del Slide *</Label>

        {/* Info sobre medidas */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p>
                  <strong>Medidas recomendadas:</strong> Responsive automático
                  (Mobile: 250px, Tablet: 864x422px, Desktop: 1400x484px)
                </p>
                <p>
                  <strong>Formatos:</strong> JPG, PNG, WebP |{" "}
                  <strong>Máximo:</strong> 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImageIcon
                  className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                    isDragOver ? "text-blue-500" : "text-gray-400"
                  }`}
                />
                <p
                  className={`mb-2 transition-colors ${
                    isDragOver ? "text-blue-700 font-medium" : "text-gray-600"
                  }`}
                >
                  {isDragOver
                    ? "Suelta la imagen aquí"
                    : "Arrastra y suelta una imagen o haz clic para seleccionar"}
                </p>
                <p className="text-sm text-gray-500">
                  Recomendado: Responsive automático | PNG, JPG, WebP hasta 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {!previewImage && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen
              </Button>
            )}

            {previewImage && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cambiar Imagen
              </Button>
            )}

            {errors.image && (
              <p className="text-sm text-red-500 mt-2">{errors.image}</p>
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
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {slide ? "Actualizando..." : "Creando..."}
            </>
          ) : slide ? (
            "Actualizar Slide"
          ) : (
            "Crear Slide"
          )}
        </Button>
      </div>
    </form>
  );
}
