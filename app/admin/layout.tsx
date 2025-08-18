"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // Si estamos en la página de login, no verificar auth
      if (pathname === '/admin/login') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.success && response.data) {
          setUser((response.data as { user: User }).user);
        } else {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
        }
      } catch (_) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si estamos en login, mostrar solo el children sin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Layout principal del admin
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 