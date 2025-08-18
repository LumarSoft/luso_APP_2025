"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Users } from "lucide-react";
import { Sidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { userService, authService } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar usuario actual
  const loadCurrentUser = async () => {
    try {
      const response = await authService.getMe();
              if (response.success && response.data) {
          setCurrentUser((response.data as { user: User }).user);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      if (response.success && response.data) {
        setUsers((response.data as { users: User[] }).users);
      }
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } };
      console.error("Error al cargar usuarios:", err);
      toast.error(err.response?.data?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  // Validar formulario
  const validateForm = (data: UserFormData, isEdit = false): boolean => {
    const errors: Partial<UserFormData> = {};

    if (!data.name.trim()) {
      errors.name = "El nombre es requerido";
    } else if (data.name.length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!data.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "El email debe tener un formato válido";
    }

    if (!isEdit && (!data.password || !data.password.trim())) {
      errors.password = "La contraseña es requerida";
    } else if (!isEdit && data.password && data.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!data.role) {
      errors.role = "El rol es requerido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Crear usuario
  const handleCreate = async () => {
    if (!validateForm(formData)) return;

    try {
      setIsSubmitting(true);
      await userService.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password || "", // Ensure password is always a string
        role: formData.role,
      });
      toast.success("Usuario creado exitosamente");
      setIsCreateDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      toast.error(error.response?.data?.message || "Error al crear usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar usuario
  const handleUpdate = async () => {
    if (!selectedUser || !validateForm(formData, true)) return;

    try {
      setIsSubmitting(true);
      const updateData: Partial<UserFormData> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }
      await userService.updateUser(selectedUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.password && { password: formData.password }),
      });
      toast.success("Usuario actualizado exitosamente");
      setIsEditDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error);
      toast.error(
        error.response?.data?.message || "Error al actualizar usuario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await userService.deleteUser(selectedUser.id);
      toast.success("Usuario eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error);
      toast.error(error.response?.data?.message || "Error al eliminar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
    setFormErrors({});
    setShowPassword(false);
  };

  // Abrir diálogo de edición
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  // Abrir diálogo de eliminación
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar user={currentUser || undefined} />
        <div className="lg:pl-64">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={currentUser || undefined} />

      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header mejorado */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-600 mt-2">
                  Administra los usuarios administradores del sistema
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(true);
                  }}
                  className="shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Administrador
                </Button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Usuarios
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Administradores
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.filter((user) => user.role === "admin").length}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Superadmins
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {
                          users.filter((user) => user.role === "superadmin")
                            .length
                        }
                      </p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      Super
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Gestiona los usuarios administradores del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "superadmin" ? "default" : "secondary"
                          }
                        >
                          {user.role === "superadmin" ? "Super Admin" : "Admin"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo de crear usuario */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa los datos para crear un nuevo administrador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre completo"
              />
              {formErrors.name && (
                <p className="text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="correo@ejemplo.com"
              />
              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Contraseña"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="admin">Administrador</option>
              </select>
              {formErrors.role && (
                <p className="text-sm text-red-600">{formErrors.role}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de editar usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre completo"
              />
              {formErrors.name && (
                <p className="text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="correo@ejemplo.com"
              />
              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Dejar vacío para mantener la actual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Rol</Label>
              <select
                id="edit-role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="admin">Administrador</option>
              </select>
              {formErrors.role && (
                <p className="text-sm text-red-600">{formErrors.role}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminar usuario */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                <strong>Nombre:</strong> {selectedUser.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Rol:</strong> {selectedUser.role}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
