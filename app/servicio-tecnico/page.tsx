"use client";

import { useState } from "react";
import {
  Wrench,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Cpu,
  Monitor,
  Wifi,
} from "lucide-react";

interface ServiceFormData {
  nombre: string;
  telefono: string;
  email: string;
  tipoEquipo: string;
  otroEquipo: string;
  marca: string;
  modelo: string;
  problema: string;
  ubicacion: string;
  urgencia: string;
}

export default function ServicioTecnicoPage() {
  const [formData, setFormData] = useState<ServiceFormData>({
    nombre: "",
    telefono: "",
    email: "",
    tipoEquipo: "",
    otroEquipo: "",
    marca: "",
    modelo: "",
    problema: "",
    ubicacion: "",
    urgencia: "normal",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const equipmentTypes = [
    { value: "computadora", label: "Computadora/PC", icon: Monitor },
    { value: "Notebook", label: "Notebook", icon: Monitor },
    { value: "red", label: "Equipos de Red", icon: Wifi },
    { value: "servidor", label: "Servidor", icon: Cpu },
    { value: "otro", label: "Otro", icon: Wrench },
  ];

  const urgencyLevels = [
    {
      value: "baja",
      label: "Baja",
      description: "No es urgente (1-3 días)",
      color: "text-green-600",
    },
    {
      value: "normal",
      label: "Normal",
      description: "Prioridad estándar (24-48 hrs)",
      color: "text-blue-600",
    },
    {
      value: "alta",
      label: "Alta",
      description: "Urgente (12-24 hrs)",
      color: "text-orange-600",
    },
    {
      value: "critica",
      label: "Crítica",
      description: "Inmediato (2-6 hrs)",
      color: "text-red-600",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateWhatsAppMessage = (): string => {
    const selectedEquipment = equipmentTypes.find(
      (eq) => eq.value === formData.tipoEquipo
    );
    const selectedUrgency = urgencyLevels.find(
      (ur) => ur.value === formData.urgencia
    );

    const equipmentType =
      formData.tipoEquipo === "otro"
        ? formData.otroEquipo
        : selectedEquipment?.label || formData.tipoEquipo;

    const message = `*SOLICITUD DE SERVICIO TECNICO*

*URGENCIA:* ${selectedUrgency?.label.toUpperCase()} (${
      selectedUrgency?.description
    })

*DATOS DEL CLIENTE*
- Nombre: ${formData.nombre}
- Telefono: ${formData.telefono}
${formData.email ? `- Email: ${formData.email}` : ""}
- Ubicacion: ${formData.ubicacion}

*EQUIPO*
- Tipo: ${equipmentType}
${formData.marca ? `- Marca: ${formData.marca}` : ""}
${formData.modelo ? `- Modelo: ${formData.modelo}` : ""}

*PROBLEMA REPORTADO*
${formData.problema}

---
Solicitud generada desde LusoInsumos`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular un pequeño delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const message = generateWhatsAppMessage();
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, "_blank");

    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        tipoEquipo: "",
        otroEquipo: "",
        marca: "",
        modelo: "",
        problema: "",
        ubicacion: "",
        urgencia: "normal",
      });
    }, 3000);
  };

  const isFormValid =
    formData.nombre &&
    formData.telefono &&
    formData.tipoEquipo &&
    formData.problema &&
    formData.ubicacion &&
    (formData.tipoEquipo !== "otro" || formData.otroEquipo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-orange-600 text-white p-4 rounded-full">
                <Wrench className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-orange-600 to-blue-700 bg-clip-text text-transparent">
              Servicio Técnico
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-orange-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              ¿Problemas con tu equipo? Nuestro equipo técnico especializado
              está aquí para ayudarte. Completa el formulario y nos pondremos en
              contacto contigo de inmediato.
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    ¡Solicitud enviada!
                  </h3>
                  <p className="text-green-700 text-sm">
                    Te hemos redirigido a WhatsApp. Nos pondremos en contacto
                    contigo pronto.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Datos del Cliente */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  👤 Datos del Cliente
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Tu número de teléfono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email{" "}
                      <span className="text-gray-400 font-normal">
                        (opcional)
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ciudad, dirección o zona"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Equipo */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  💻 Información del Equipo
                </h2>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de equipo *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {equipmentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <label
                          key={type.value}
                          className={`relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.tipoEquipo === type.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipoEquipo"
                            value={type.value}
                            checked={formData.tipoEquipo === type.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <Icon
                            className={`h-5 w-5 ${
                              formData.tipoEquipo === type.value
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              formData.tipoEquipo === type.value
                                ? "text-blue-900"
                                : "text-gray-700"
                            }`}
                          >
                            {type.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Campo condicional para "Otro" */}
                {formData.tipoEquipo === "otro" && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especifica el tipo de equipo *
                    </label>
                    <input
                      type="text"
                      name="otroEquipo"
                      value={formData.otroEquipo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Describe el tipo de equipo que necesita servicio"
                      required={formData.tipoEquipo === "otro"}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marca{" "}
                      <span className="text-gray-400 font-normal">
                        (opcional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ej: HP, Dell, Apple, Samsung..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modelo{" "}
                      <span className="text-gray-400 font-normal">
                        (opcional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="modelo"
                      value={formData.modelo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Modelo específico del equipo"
                    />
                  </div>
                </div>
              </div>

              {/* Problema */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  🔧 Descripción del Problema
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe el problema *
                  </label>
                  <textarea
                    name="problema"
                    value={formData.problema}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Describe detalladamente el problema que está experimentando. Incluye cualquier mensaje de error, cuándo comenzó el problema, qué estabas haciendo cuando ocurrió, etc."
                    required
                  />
                </div>
              </div>

              {/* Urgencia */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  ⚡ Nivel de Urgencia
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {urgencyLevels.map((level) => (
                    <label
                      key={level.value}
                      className={`relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.urgencia === level.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgencia"
                        value={level.value}
                        checked={formData.urgencia === level.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            formData.urgencia === level.value
                              ? "text-blue-900"
                              : level.color
                          }`}
                        >
                          {level.label}
                        </div>
                        <div
                          className={`text-sm ${
                            formData.urgencia === level.value
                              ? "text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          {level.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 ${
                    isFormValid && !isSubmitting
                      ? "bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5" />
                      Enviar solicitud por WhatsApp
                    </>
                  )}
                </button>

                {!isFormValid && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    Completa todos los campos obligatorios (*)
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Respuesta Rápida
              </h3>
              <p className="text-gray-600 text-sm">
                Te contactamos en menos de 30 minutos durante horario laboral
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Técnicos Certificados
              </h3>
              <p className="text-gray-600 text-sm">
                Personal capacitado con experiencia en múltiples marcas
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Garantía</h3>
              <p className="text-gray-600 text-sm">
                Todos nuestros servicios incluyen garantía de satisfacción
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
