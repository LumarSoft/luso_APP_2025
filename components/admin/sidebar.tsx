"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Vista general"
  },
  {
    name: "Productos",
    href: "/admin/products",
    icon: Package,
    description: "Gestionar productos"
  },
  {
    name: "Categorías",
    href: "/admin/categories",
    icon: Tags,
    description: "Gestionar categorías"
  },
  {
    name: "Slides",
    href: "/admin/slides",
    icon: Monitor,
    description: "Gestionar carousel"
  },
  {
    name: "Usuarios",
    href: "/admin/users",
    icon: Users,
    description: "Gestionar administradores"
  },
  {
    name: "Configuración",
    href: "/admin/settings",
    icon: Settings,
    description: "Configuraciones"
  }
];

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/admin/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      localStorage.removeItem("admin_token");
      router.push("/admin/login");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-gray-200",
        collapsed ? "px-2" : "px-4"
      )}>
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-gray-900">LusoInsumos</span>
          </div>
        )}
        
        {/* Toggle button - solo desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Close button - solo mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* Link al sitio público */}
        <Link
          href="/"
          className={cn(
            "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
            "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Home className="mr-3 h-5 w-5 flex-shrink-0" />
          {!collapsed && "Ver Sitio"}
        </Link>

        <div className="border-t border-gray-200 my-2"></div>

        {/* Menu items */}
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {!collapsed && (
                <div className="flex-1">
                  <div>{item.name}</div>
                  {!collapsed && (
                    <div className="text-xs opacity-75">{item.description}</div>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-gray-200 p-4">
        {!collapsed && user && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-primary font-medium capitalize">{user.role}</p>
          </div>
        )}
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            collapsed ? "px-2" : "px-2"
          )}
        >
          <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
          {!collapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:bg-white lg:border-r lg:border-gray-200 transition-all duration-300",
        collapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-md border border-gray-200"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
} 