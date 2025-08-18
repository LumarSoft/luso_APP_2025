"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sidebar } from "@/components/admin/sidebar";
import { authService, productService, categoryService } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import {
  Package,
  Tags,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Activity,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  recentProducts: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    recentProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Cargar datos del usuario
        const userResponse = await authService.getMe();
        if (userResponse.success && userResponse.data) {
          setUser((userResponse.data as { user: User }).user);
        }

        // Cargar productos
        const productsResponse = await productService.getAll({ limit: 1000 });
        const categoriesResponse = await categoryService.getAll();

        if (productsResponse.success && categoriesResponse.success && productsResponse.data && categoriesResponse.data) {
          const products = (productsResponse.data as { products: Product[] }).products;
          const categories = (categoriesResponse.data as { categories: Category[] }).categories;

          // Calcular estadísticas
          const lowStock = products.filter(
            (product: Product) => product.stock < 10
          ).length;
          const recent = products.filter((product: Product) => {
            const createdAt = new Date(product.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdAt > weekAgo;
          }).length;

          setStats({
            totalProducts: products.length,
            totalCategories: categories.length,
            lowStockProducts: lowStock,
            recentProducts: recent,
          });
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Productos",
      value: stats.totalProducts,
      description: "Productos en el catálogo",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Categorías",
      value: stats.totalCategories,
      description: "Categorías disponibles",
      icon: Tags,
      color: "bg-green-500",
    },
    {
      title: "Stock Bajo",
      value: stats.lowStockProducts,
      description: "Productos con menos de 10 unidades",
      icon: AlertCircle,
      color: "bg-yellow-500",
    },
    {
      title: "Productos Nuevos",
      value: stats.recentProducts,
      description: "Agregados esta semana",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user || undefined} />

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Bienvenido de vuelta, {user?.name}. Aquí tienes un resumen de tu
              tienda.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription>
                  Gestiona tu tienda rápidamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a
                    href="/admin/slides"
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Package className="mr-3 h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Gestionar Slides</div>
                        <div className="text-sm text-gray-500">
                          Gestiona los slides de la página principal
                        </div>
                      </div>
                    </div>
                  </a>

                  <a
                    href="/admin/products"
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="mr-3 h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Ver Productos</div>
                        <div className="text-sm text-gray-500">
                          Gestionar catálogo
                        </div>
                      </div>
                    </div>
                  </a>

                  <a
                    href="/admin/categories"
                    className="block w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Tags className="mr-3 h-5 w-5 text-purple-500" />
                      <div>
                        <div className="font-medium">Gestionar Categorías</div>
                        <div className="text-sm text-gray-500">
                          Organizar productos
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Alertas del Sistema
                </CardTitle>
                <CardDescription>
                  Información importante que requiere atención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.lowStockProducts > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="mr-3 h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-medium text-yellow-800">
                            Stock Bajo
                          </div>
                          <div className="text-sm text-yellow-600">
                            {stats.lowStockProducts} productos con stock bajo
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.recentProducts > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="mr-3 h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-800">
                            Productos Nuevos
                          </div>
                          <div className="text-sm text-green-600">
                            {stats.recentProducts} productos agregados esta
                            semana
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.lowStockProducts === 0 &&
                    stats.recentProducts === 0 && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-center text-gray-500">
                          No hay alertas en este momento
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
              <CardDescription>
                Estado actual del panel de administración
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Usuario:</span>
                  <span className="ml-2 text-gray-900">{user?.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Rol:</span>
                  <span className="ml-2 text-gray-900 capitalize">
                    {user?.role}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Última actualización:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
