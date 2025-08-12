"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categoryService } from "@/lib/api";
import { Category } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: () => void;
  onCancel: () => void;
}

interface CategoryFormData {
  name: string;
  description: string;
}

export default function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || ""
      });
    } else {
      setFormData({
        name: "",
        description: ""
      });
    }
    setErrors({});
  }, [category]);

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setIsLoading(true);

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      };

      let response;
      if (category) {
        // Update existing category
        response = await categoryService.update(category.id.toString(), categoryData);
      } else {
        // Create new category
        response = await categoryService.create(categoryData);
      }

      if (response.success) {
        const message = category 
          ? `Categoría "${formData.name}" actualizada exitosamente` 
          : `Categoría "${formData.name}" creada exitosamente`;
        toast.success(message, {
          description: category ? 'Los cambios se han guardado correctamente' : 'La nueva categoría está disponible para usar'
        });
        onSubmit();
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Error al guardar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Categoría *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Ingresa el nombre de la categoría"
          className={errors.name ? 'border-red-500' : ''}
          maxLength={100}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        <p className="text-xs text-gray-500">
          {formData.name.length}/100 caracteres
        </p>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe la categoría (opcional)..."
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
          maxLength={500}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        <p className="text-xs text-gray-500">
          {formData.description.length}/500 caracteres
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {category ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            category ? 'Actualizar Categoría' : 'Crear Categoría'
          )}
        </Button>
      </div>
    </form>
  );
} 