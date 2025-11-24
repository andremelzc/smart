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
    <div className="from-blue-light-25 to-blue-light-100 flex min-h-screen items-center justify-center bg-gradient-to-br px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header con logo y titulo */}
        <div className="text-center">
          <Link href="/" className="mb-8 inline-flex items-center gap-3">
            <div className="from-blue-light-500 to-blue-vivid-600 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
              <Home className="h-7 w-7 text-white" />
            </div>

            <h1 className="from-blue-light-600 to-blue-vivid-600 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
              smart
            </h1>
          </Link>

          <h2 className="text-gray-dark-800 mb-2 text-2xl font-bold">
            Únete a nosotros!
          </h2>

          <p className="text-gray-medium-500">
            Crea tu cuenta y comienza tu aventura
          </p>
        </div>

        {/* Formulario principal */}
        <div className="border-blue-light-200 space-y-6 rounded-3xl border bg-white p-8 shadow-xl">
          {/* Boton de Google */}
          <GoogleButton
            size="lg"
            variant="light"
            callbackUrl="/"
            className="focus:ring-blue-light-500 h-14 w-full rounded-2xl border-2 border-gray-300 shadow-sm hover:border-gray-400 hover:shadow-md"
          >
            Registrarse con Google
          </GoogleButton>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="text-gray-medium-500 bg-white px-4 font-medium">
                O regístrate con email
              </span>
            </div>
          </div>

          {/* Formulario de registro */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nombres */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="firstName"
                  className="text-gray-dark-700 mb-2 block text-sm font-semibold"
                >
                  Nombre
                </label>

                <div className="relative">
                  <User className="text-gray-medium-400 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                    className="border-blue-light-300 bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:ring-blue-light-500 w-full rounded-2xl border-2 py-4 pr-4 pl-12 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              {/* Apellido */}
              <div>
                <label
                  htmlFor="lastName"
                  className="text-gray-dark-700 mb-2 block text-sm font-semibold"
                >
                  Apellido
                </label>

                <div className="relative">
                  <User className="text-gray-medium-400 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Tu apellido"
                    className="border-blue-light-300 bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:ring-blue-light-500 w-full rounded-2xl border-2 py-4 pr-4 pl-12 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="text-gray-dark-700 mb-2 block text-sm font-semibold"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail className="text-gray-medium-400 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  className="border-blue-light-300 bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:ring-blue-light-500 w-full rounded-2xl border-2 py-4 pr-4 pl-12 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Campo Contrasena */}
            <div>
              <label
                htmlFor="password"
                className="text-gray-dark-700 mb-2 block text-sm font-semibold"
              >
                Contraseña
              </label>

              <div className="relative">
                <Lock className="text-gray-medium-400 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Escribe tu contraseña"
                  className="border-blue-light-300 bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:ring-blue-light-500 w-full rounded-2xl border-2 py-4 pr-12 pl-12 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-medium-400 hover:text-gray-dark-600 absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {formData.password.length > 0 && (
                <p
                  className={`mt-1.5 text-xs font-medium ${
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
                className="text-gray-dark-700 mb-2 block text-sm font-semibold"
              >
                Confirmar contraseña
              </label>

              <div className="relative">
                <Lock className="text-gray-medium-400 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repite tu contraseña"
                  className="border-blue-light-300 bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:ring-blue-light-500 w-full rounded-2xl border-2 py-4 pr-12 pl-12 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-medium-400 hover:text-gray-dark-600 absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {formData.confirmPassword.length > 0 && (
                <p
                  className={`mt-1.5 text-xs font-medium ${
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
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Mensaje de exito */}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            {/* Boton de registro */}
            <button
              type="submit"
              disabled={isLoading || !isAbleToSubmit}
              className="from-blue-light-500 to-blue-vivid-500 hover:from-blue-light-600 hover:to-blue-vivid-600 focus:ring-blue-light-500 w-full rounded-2xl bg-gradient-to-r px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta...
                </div>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          {/* Links adicionales */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div className="text-center">
              <span className="text-gray-medium-500 text-sm">
                Ya tienes una cuenta?{" "}
              </span>

              <Link
                href="/login"
                className="text-blue-light-600 hover:text-blue-light-700 text-sm font-semibold transition-colors"
              >
                Inicia sesion aqui
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-medium-400 text-xs">
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
