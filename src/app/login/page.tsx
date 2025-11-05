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
  Home
} from "lucide-react";
import { GoogleButton } from "@/src/components/features/auth/GoogleButton";
import { authService } from "@/src/services/auth.service";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      await authService.signInWithCredentials(formData.email, formData.password);
      
      // Si llega aquí, el login fue exitoso
      const session = await getSession();
      if (session) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error de conexión. Inténtalo nuevamente.");
      }
      console.error("Error en email login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-light-25 to-blue-light-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header con logo y título */}
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
            ¡Bienvenido de vuelta!
          </h2>
          <p className="text-gray-medium-500">
            Inicia sesión para continuar tu aventura
          </p>
        </div>

        {/* Formulario principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-light-200 p-8 space-y-6">
          
          {/* Botón de Google */}
          <GoogleButton
            size="lg"
            variant="light"
            callbackUrl="/"
            className="w-full h-14 rounded-2xl border-2 border-gray-300 hover:border-gray-400 focus:ring-blue-light-500 shadow-sm hover:shadow-md"
          >
            Continuar con Google
          </GoogleButton>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-medium-500 font-medium">
                O continúa con email
              </span>
            </div>
          </div>

          {/* Formulario de email */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-dark-700 mb-2">
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

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-dark-700 mb-2">
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
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 border-2 border-blue-light-300 rounded-2xl bg-blue-light-25 text-gray-dark-800 placeholder-gray-medium-400 focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-medium-400 hover:text-gray-dark-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-light-500 to-blue-vivid-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-light-600 hover:to-blue-vivid-600 focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Links adicionales */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-blue-light-600 hover:text-blue-light-700 font-medium text-sm transition-colors"
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
                className="text-blue-light-600 hover:text-blue-light-700 font-semibold text-sm transition-colors"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-medium-400">
            Al continuar, aceptas nuestros{" "}
            <Link href="/terms" className="text-blue-light-600 hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="text-blue-light-600 hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}