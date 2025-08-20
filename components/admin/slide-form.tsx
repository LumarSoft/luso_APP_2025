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
    mobile_image: null,
    link: "",
    is_active: true,
    show_title: true,
    show_subtitle: true,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewMobileImage, setPreviewMobileImage] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMobileDragOver, setIsMobileDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [removeDesktopImage, setRemoveDesktopImage] = useState(false);
  const [removeMobileImageFlag, setRemoveMobileImageFlag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when slide changes
  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title ?? "",
        subtitle: slide.subtitle ?? "",
        image: null,
        mobile_image: null,
        link: slide.link ?? "",
        is_active: slide.is_active,
        show_title: slide.show_title !== undefined ? !!slide.show_title : true,
        show_subtitle:
          slide.show_subtitle !== undefined ? !!slide.show_subtitle : true,
      });
      setPreviewImage(slide.image_url ? getImageUrl(slide.image_url) : null);
      setPreviewMobileImage(
        slide.image_url_mobile ? getImageUrl(slide.image_url_mobile) : null
      );
      setRemoveDesktopImage(false);
      setRemoveMobileImageFlag(false);
    } else {
      // Reset form for new slide
      setFormData({
        title: "",
        subtitle: "",
        image: null,
        mobile_image: null,
        link: "",
        is_active: true,
        show_title: true,
        show_subtitle: true,
      });
      setPreviewImage(null);
      setPreviewMobileImage(null);
      setRemoveDesktopImage(false);
      setRemoveMobileImageFlag(false);
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

  const validateAndProcessFile = (file: File, isMobile: boolean = false) => {
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

    if (isMobile) {
      setFormData((prev) => ({ ...prev, mobile_image: file }));
      setRemoveMobileImageFlag(false);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewMobileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, image: file }));
      setRemoveDesktopImage(false);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    return true;
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleMobileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndProcessFile(file, true);
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

  const handleMobileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileDragOver(true);
  };

  const handleMobileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileDragOver(false);
  };

  const handleMobileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      validateAndProcessFile(file, true);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImage(null);
    setRemoveDesktopImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMobileImage = () => {
    setFormData((prev) => ({ ...prev, mobile_image: null }));
    setPreviewMobileImage(null);
    setRemoveMobileImageFlag(true);
    if (mobileFileInputRef.current) {
      mobileFileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Título es obligatorio
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = "El título es obligatorio";
    } else if (formData.title.trim().length > 255) {
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

    // Para slides existentes, verificar que no se elimine la imagen desktop sin subir una nueva
    if (slide && removeDesktopImage && !formData.image) {
      newErrors.image =
        "No puedes eliminar la imagen desktop sin subir una nueva";
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
      if (formData.mobile_image) {
        apiFormData.append("mobile_image", formData.mobile_image);
      }
      // Si se está editando y se removió la imagen mobile, enviar flag
      if (slide && removeMobileImageFlag) {
        apiFormData.append("remove_mobile_image", "true");
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
          <Label htmlFor="title">Título del Slide *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Ingresa el título del slide"
            className={errors.title ? "border-red-500" : ""}
            required
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
            onChange={(e) =>
              handleInputChange("show_subtitle", e.target.checked)
            }
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
              <div className="text-xs text-blue-700 space-y-2">
                <p className="font-semibold">
                  Medidas recomendadas (Ancho x Alto):
                </p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="font-medium">Desktop:</span>
                    <span>1400px × 484px (ratio 2.9:1)</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-medium">Mobile:</span>
                    <span>
                      Si no subís imagen mobile, se va a usar esta imagen
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 pt-1 border-t border-blue-300">
                  <span>
                    <span className="font-medium">Formatos:</span> JPG, PNG,
                    WebP
                  </span>
                  <span>
                    <span className="font-medium">Máximo:</span> 5MB
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {previewImage && !removeDesktopImage ? (
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
                  <span className="font-medium">Desktop:</span> 1400×484px |
                  Para desktop
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

            {(!previewImage || removeDesktopImage) && (
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

            {previewImage && !removeDesktopImage && (
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

      {/* Mobile Image Upload */}
      <div className="space-y-2">
        <Label>Imagen Mobile (Opcional)</Label>
        <p className="text-sm text-gray-600">
          Si no subís una imagen específica para mobile, se usará la imagen de
          desktop automáticamente.
        </p>

        {/* Info sobre medidas mobile */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-xs text-green-700 space-y-2">
                <p className="font-semibold">
                  Medidas recomendadas para Mobile (Ancho x Alto):
                </p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="font-medium">Ideal:</span>
                    <span>
                      375px × 240px (proporción optimizada, se ve completa)
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-medium">Ratio:</span>
                    <span>1.56:1 (horizontal, sin distorsión)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-1 border-t border-green-300">
                  <span>
                    <span className="font-medium">Formatos:</span> JPG, PNG,
                    WebP
                  </span>
                  <span>
                    <span className="font-medium">Máximo:</span> 5MB
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {previewMobileImage && !removeMobileImageFlag ? (
              <div className="relative">
                <img
                  src={previewMobileImage}
                  alt="Preview Mobile"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeMobileImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isMobileDragOver
                    ? "border-green-500 bg-green-50 scale-105"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => mobileFileInputRef.current?.click()}
                onDragOver={handleMobileDragOver}
                onDragLeave={handleMobileDragLeave}
                onDrop={handleMobileDrop}
              >
                <ImageIcon
                  className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                    isMobileDragOver ? "text-green-500" : "text-gray-400"
                  }`}
                />
                <p
                  className={`mb-2 transition-colors ${
                    isMobileDragOver
                      ? "text-green-700 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {isMobileDragOver
                    ? "Suelta la imagen mobile aquí"
                    : "Arrastra y suelta una imagen mobile o haz clic para seleccionar"}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Mobile:</span> 375×240px | Sin
                  distorsión, pegado al navbar
                </p>
              </div>
            )}

            <input
              ref={mobileFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleMobileImageChange}
              className="hidden"
            />

            {(!previewMobileImage || removeMobileImageFlag) && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={() => mobileFileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen Mobile (Opcional)
              </Button>
            )}

            {previewMobileImage && !removeMobileImageFlag && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={() => mobileFileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cambiar Imagen Mobile
              </Button>
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
