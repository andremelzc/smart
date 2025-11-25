"use client";

import { useState } from "react";
import { getSession } from "next-auth/react";
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
} from "lucide-react";

import { GoogleButton } from "@/src/components/features/auth/GoogleButton";
import { authService } from "@/src/services/auth.service";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));

    // Limpiar error al empezar a escribir

    if (error) setError("");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Por favor, completa todos los campos");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await authService.signInWithCredentials(
        formData.email,
        formData.password
      );

      // Si llega aqui, el login fue exitoso

      const session = await getSession();

      if (session) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error de conexion. Intentalo nuevamente.");
      }

      console.error("Error en email login:", err);
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
            ¡Bienvenido de vuelta!
          </h2>

          <p className="text-gray-medium-500">
            Inicia sesión para continuar tu aventura
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
            Continuar con Google
          </GoogleButton>

          {/* Divisor */}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="text-gray-medium-500 bg-white px-4 font-medium">
                O continua con email
              </span>
            </div>
          </div>

          {/* Formulario de email */}

          <form onSubmit={handleEmailLogin} className="space-y-5">
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
                  placeholder=""
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
            </div>

            {/* Mensaje de error */}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />

                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Boton de envio */}

            <button
              type="submit"
              disabled={isLoading}
              className="from-blue-light-500 to-blue-vivid-500 hover:from-blue-light-600 hover:to-blue-vivid-600 focus:ring-blue-light-500 w-full rounded-2xl bg-gradient-to-r px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Iniciando sesion...
                </div>
              ) : (
                "Iniciar sesion"
              )}
            </button>
          </form>

          {/* Links adicionales */}

          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-blue-light-600 hover:text-blue-light-700 text-sm font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="text-center">
              <span className="text-gray-medium-500 text-sm">
                ¿No tienes una cuenta?{" "}
              </span>

              <Link
                href="/register"
                className="text-blue-light-600 hover:text-blue-light-700 text-sm font-semibold transition-colors"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="text-center">
          <p className="text-gray-medium-400 text-xs">
            Al continuar, aceptas nuestros{" "}
            <Link href="/terms" className="text-blue-light-600 hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link
              href="/privacy"
              className="text-blue-light-600 hover:underline"
            >
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
