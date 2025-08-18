const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api';

// Tipos para las respuestas de la API
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface ApiError {
  success: false;
  message: string;
}

// Función helper para hacer requests
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Agregar token de autorización si existe
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Crear un error personalizado que incluye el código de estado
      const error = new Error(data.message || `Error ${response.status}`) as any;
      error.status = response.status;
      error.isBusinessError = response.status === 400; // Los errores 400 son errores de negocio
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Función helper para requests con FormData (para uploads)
async function apiFormRequest<T = any>(
  endpoint: string,
  formData: FormData,
  method: string = 'POST'
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    body: formData,
  };

  // Agregar token de autorización si existe
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers = {
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Servicios de autenticación
export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async (): Promise<ApiResponse> => {
    return apiRequest('/auth/me');
  },

  logout: async (): Promise<ApiResponse> => {
    const result = await apiRequest('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('admin_token');
    return result;
  },
};

// Servicios de productos
export const productService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    subcategory?: string;
    stock_filter?: string;
    sort_by?: string;
    sort_direction?: string;
  }): Promise<ApiResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.subcategory) searchParams.append('subcategory', params.subcategory);
    if (params?.stock_filter) searchParams.append('stock_filter', params.stock_filter);
    // Mapear parámetros del frontend a los que espera el backend
    if (params?.sort_by) searchParams.append('orderBy', params.sort_by);
    if (params?.sort_direction) searchParams.append('orderDirection', params.sort_direction.toUpperCase());

    const queryString = searchParams.toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/products/${id}`);
  },

  create: async (productData: FormData): Promise<ApiResponse> => {
    return apiFormRequest('/products', productData, 'POST');
  },

  update: async (id: string, productData: FormData): Promise<ApiResponse> => {
    return apiFormRequest(`/products/${id}`, productData, 'PUT');
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  getFeatured: async (limit?: number): Promise<ApiResponse> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest(`/products/featured${params}`);
  },
};

// Servicios de slides
export const slideService = {
  getAll: async (): Promise<ApiResponse> => {
    return apiRequest('/slides');
  },

  getActive: async (): Promise<ApiResponse> => {
    return apiRequest('/slides/active');
  },

  getById: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/slides/${id}`);
  },

  create: async (slideData: FormData): Promise<ApiResponse> => {
    return apiFormRequest('/slides', slideData, 'POST');
  },

  update: async (id: string, slideData: FormData): Promise<ApiResponse> => {
    return apiFormRequest(`/slides/${id}`, slideData, 'PUT');
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/slides/${id}`, {
      method: 'DELETE',
    });
  },

  reorder: async (slides: Array<{id: number, sort_order: number}>): Promise<ApiResponse> => {
    return apiRequest('/slides/reorder', {
      method: 'PUT',
      body: JSON.stringify({ slides }),
    });
  },
};

// Servicios de categorías
export const categoryService = {
  getAll: async (): Promise<ApiResponse> => {
    return apiRequest('/categories');
  },

  getById: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/categories/${id}`);
  },

  create: async (categoryData: { name: string; description?: string }): Promise<ApiResponse> => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (id: string, categoryData: { name: string; description?: string }): Promise<ApiResponse> => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  getSubcategories: async (categoryId: string): Promise<ApiResponse> => {
    return apiRequest(`/categories/${categoryId}/subcategories`);
  },
};

// Servicios de subcategorías
export const subcategoryService = {
  getAll: async (): Promise<ApiResponse> => {
    return apiRequest('/subcategories');
  },

  getById: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/subcategories/${id}`);
  },

  create: async (subcategoryData: { name: string; description?: string; category_id: number }): Promise<ApiResponse> => {
    return apiRequest('/subcategories', {
      method: 'POST',
      body: JSON.stringify(subcategoryData),
    });
  },

  update: async (id: string, subcategoryData: { name: string; description?: string; category_id: number }): Promise<ApiResponse> => {
    return apiRequest(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subcategoryData),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/subcategories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Servicio para gestión de usuarios (solo superadmin)
export const userService = {
  getUsers: async (): Promise<ApiResponse> => {
    return apiRequest('/users');
  },

  getUserById: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/users/${id}`);
  },

  createUser: async (userData: { name: string; email: string; password: string; role?: string }): Promise<ApiResponse> => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: number, userData: { name: string; email: string; role?: string }): Promise<ApiResponse> => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: number): Promise<ApiResponse> => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Helper para manejar errores de token expirado
export const handleAuthError = (error: any) => {
  if (error.message?.includes('Token inválido') || error.message?.includes('Token de acceso requerido')) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  }
  throw error;
};

// Helper para obtener URL completa de imagen [[memory:5282313]]
export const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x200/e5e7eb/6b7280?text=Sin+imagen';
  }
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Construir URL completa
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3006';
  
  // Si imagePath ya empieza con /, no agregar otra /
  const fullUrl = imagePath.startsWith('/') 
    ? `${baseUrl}${imagePath}` 
    : `${baseUrl}/${imagePath}`;
  
  console.log('🖼️ Image URL constructed:', { imagePath, baseUrl, fullUrl });
  
  return fullUrl;
};