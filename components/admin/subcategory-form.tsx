"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { subcategoryService } from "@/lib/api";
import { Category, Subcategory } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubcategoryFormProps {
  subcategory?: Subcategory | null;
  categories: Category[];
  selectedCategory?: Category | null;
  onSubmit: () => void;
  onCancel: () => void;
}

interface SubcategoryFormData {
  name: string;
  description: string;
  category_id: number;
}

export default function SubcategoryForm({ 
  subcategory, 
  categories, 
  selectedCategory, 
  onSubmit, 
  onCancel 
}: SubcategoryFormProps) {
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: "",
    description: "",
    category_id: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when subcategory or selectedCategory changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        description: subcategory.description || "",
        category_id: subcategory.category_id
      });
    } else if (selectedCategory) {
      setFormData({
        name: "",
        description: "",
        category_id: selectedCategory.id
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category_id: 0
      });
    }
    setErrors({});
  }, [subcategory, selectedCategory]);

  const handleInputChange = (field: keyof SubcategoryFormData, value: any) => {
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

    if (!formData.category_id) {
      newErrors.category_id = 'Debe seleccionar una categoría';
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

      const subcategoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category_id: formData.category_id
      };

      let response;
      if (subcategory) {
        // Update existing subcategory
        response = await subcategoryService.update(subcategory.id.toString(), subcategoryData);
      } else {
        // Create new subcategory
        response = await subcategoryService.create(subcategoryData);
      }

      if (response.success) {
        const categoryName = categories.find(cat => cat.id === formData.category_id)?.name || 'la categoría seleccionada';
        const message = subcategory 
          ? `Subcategoría "${formData.name}" actualizada exitosamente` 
          : `Subcategoría "${formData.name}" creada exitosamente`;
        toast.success(message, {
          description: subcategory 
            ? 'Los cambios se han guardado correctamente' 
            : `Nueva subcategoría agregada a "${categoryName}"`
        });
        onSubmit();
      }
    } catch (error: any) {
      console.error('Error saving subcategory:', error);
      toast.error(error.message || 'Error al guardar la subcategoría');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategoryObj = categories.find(cat => cat.id === formData.category_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoría Principal *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.category_id.toString()}
          onChange={(e) => handleInputChange('category_id', parseInt(e.target.value))}
          disabled={!!selectedCategory && !subcategory} // Disable if creating for specific category
        >
          <option value="0">Seleccionar categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
        {selectedCategoryObj && (
          <p className="text-xs text-blue-600">
            Esta subcategoría pertenecerá a "{selectedCategoryObj.name}"
          </p>
        )}
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Subcategoría *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Ingresa el nombre de la subcategoría"
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
          placeholder="Describe la subcategoría (opcional)..."
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
              {subcategory ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            subcategory ? 'Actualizar Subcategoría' : 'Crear Subcategoría'
          )}
        </Button>
      </div>
    </form>
  );
} 