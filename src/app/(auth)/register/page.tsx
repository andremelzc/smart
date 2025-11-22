"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Home,
  User,
  CheckCircle2,
} from "lucide-react";
import { GoogleButton } from "@/src/components/features/auth/GoogleButton";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores al empezar a escribir
    if (error) setError("");
    if (success) setSuccess("");
  };

  const isAbleToSubmit =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("El nombre es obligatorio");
      return false;
    }

    if (!formData.lastName.trim()) {
      setError("El apellido es obligatorio");
      return false;
    }

    if (!formData.email.trim()) {
      setError("El correo electrónico es obligatorio");
      return false;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear la cuenta");
      }

      setSuccess("Cuenta creada exitosamente! Redirigiendo...");

      // Redirigir al login despues de un breve delay
      setTimeout(() => {
        router.push("/login?message=account-created");
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error de conexion. Intentalo nuevamente.");
      }

      console.error("Error en registro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-light-25 to-blue-light-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header con logo y titulo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-light-500 to-blue-vivid-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-light-600 to-blue-vivid-600 bg-clip-text text-transparent">
              smart
            </h1>
          </Link>

          <h2 className="text-2xl font-bold text-gray-dark-800 mb-2">
            Únete a nosotros!
          </h2>

          <p className="text-gray-medium-500">
            Crea tu cuenta y comienza tu aventura
          </p>
        </div>

        {/* Formulario principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-light-200 p-8 space-y-6">
          {/* Boton de Google */}
          <GoogleButton
            size="lg"
            variant="light"
            callbackUrl="/"
            className="w-full h-14 rounded-2xl border-2 border-gray-300 hover:border-gray-400 focus:ring-blue-light-500 shadow-sm hover:shadow-md"
          >
            Registrarse con Google
          </GoogleButton>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-medium-500 font-medium">
                O regístrate con email
              </span>
            </div>
          </div>

          {/* Formulario de registro */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nombres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-dark-700 mb-2"
                >
                  Nombre
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-medium-400" />

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                    className="w-full pl-12 pr-4 py-4 border-2 border-blue-light-300 rounded-2xl bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Apellido */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-dark-700 mb-2"
                >
                  Apellido
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-medium-400" />

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Tu apellido"
                    className="w-full pl-12 pr-4 py-4 border-2 border-blue-light-300 rounded-2xl bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-dark-700 mb-2"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-medium-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-blue-light-300 rounded-2xl bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Campo Contrasena */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-dark-700 mb-2"
              >
                Contraseña
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-medium-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Escribe tu contraseña"
                  className="w-full pl-12 pr-12 py-4 border-2 border-blue-light-300 rounded-2xl bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-medium-400 hover:text-gray-dark-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {formData.password.length > 0 && (
                <p
                  className={`text-xs mt-1.5 font-medium ${
                    formData.password.length >= 6
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {formData.password.length >= 6
                    ? "✓ Contraseña válida"
                    : `Mínimo 6 caracteres (${formData.password.length}/6)`}
                </p>
              )}
            </div>

            {/* Confirmar Contrasena */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-dark-700 mb-2"
              >
                Confirmar contraseña
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-medium-400" />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repite tu contraseña"
                  className="w-full pl-12 pr-12 py-4 border-2 border-blue-light-300 rounded-2xl bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-medium-400 hover:text-gray-dark-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {formData.confirmPassword.length > 0 && (
                <p
                  className={`text-xs mt-1.5 font-medium ${
                    formData.password === formData.confirmPassword
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {formData.password === formData.confirmPassword
                    ? "✓ Las contraseñas coinciden"
                    : "✗ Las contraseñas no coinciden"}
                </p>
              )}
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Mensaje de exito */}
            {success && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            {/* Boton de registro */}
            <button
              type="submit"
              disabled={isLoading || !isAbleToSubmit}
              className="w-full bg-gradient-to-r from-blue-light-500 to-blue-vivid-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-light-600 hover:to-blue-vivid-600 focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando cuenta...
                </div>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          {/* Links adicionales */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <span className="text-gray-medium-500 text-sm">
                Ya tienes una cuenta?{" "}
              </span>

              <Link
                href="/login"
                className="text-blue-light-600 hover:text-blue-light-700 font-semibold text-sm transition-colors"
              >
                Inicia sesion aqui
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-medium-400">
            Al registrarte, aceptas nuestros{" "}
            <Link href="/terms" className="text-blue-light-600 hover:underline">
              Terminos de Servicio
            </Link>{" "}
            y{" "}
            <Link
              href="/privacy"
              className="text-blue-light-600 hover:underline"
            >
              Politica de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}