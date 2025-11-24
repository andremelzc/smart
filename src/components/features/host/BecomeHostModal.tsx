"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import {
  X,
  Star,
  DollarSign,
  Users,
  Loader2,
  Home,
  Shield,
  TrendingUp,
} from "lucide-react";

import { userService } from "@/src/services/user.service";

interface BecomeHostModalProps {
  isOpen: boolean;

  onClose: () => void;
}

export default function BecomeHostModal({
  isOpen,
  onClose,
}: BecomeHostModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Prevenir scroll del body cuando el modal esta abierto

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      setError(null);

      const result = await userService.becomeHost();

      if (result.success) {
        onClose();

        router.push("/host/dashboard");
      } else {
        setError(result.error || "Error desconocido");
      }
    } catch (err: unknown) {
      setError("Error de conexion. Por favor, intentalo de nuevo.");

      console.error("Error en handleSubmit:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const benefits = [
    {
      icon: DollarSign,

      bgColor: "bg-emerald-100",

      iconColor: "text-emerald-600",

      title: "Genera ingresos pasivos",

      description: "Monetiza tu propiedad mientras no la uses",
    },

    {
      icon: Users,

      bgColor: "bg-blue-light-100",

      iconColor: "text-blue-light-600",

      title: "Conoce nuevas personas",

      description: "Conecta con viajeros de todo el mundo",
    },

    {
      icon: Shield,

      bgColor: "bg-purple-100",

      iconColor: "text-purple-600",

      title: "Proteccion garantizada",

      description: "Tu propiedad esta asegurada en cada reserva",
    },

    {
      icon: TrendingUp,

      bgColor: "bg-orange-100",

      iconColor: "text-orange-600",

      title: "Crece a tu ritmo",

      description: "Tu decides cuando y como alquilar",
    },
  ];

  return (
    <div
      className="animate-fadeIn fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="animate-slideUp mx-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}

        <div className="from-blue-light-500 to-blue-vivid-500 relative rounded-t-2xl bg-gradient-to-r p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/20 p-2 transition-all hover:bg-white/30"
            disabled={isLoading}
            type="button"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Home className="h-8 w-8 text-white" />
            </div>

            <div>
              <h2 className="mb-1 text-2xl font-bold text-white">
                Conviertete en anfitrion!
              </h2>

              <p className="text-blue-light-50">
                Unete a miles de anfitriones exitosos
              </p>
            </div>
          </div>
        </div>

        {/* Content */}

        <div className="p-8">
          {/* Texto introductorio */}

          <p className="text-gray-medium-400 mb-8 text-center text-lg">
            Transforma tu espacio en una oportunidad de ingresos y experiencias
            unicas
          </p>

          {/* Benefits grid */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={index}
                  className="group hover:border-blue-light-400 rounded-xl border border-neutral-500 p-4 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-12 w-12 ${benefit.bgColor} flex flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 ${benefit.iconColor}`} />
                    </div>

                    <div>
                      <h3 className="text-gray-dark-500 mb-1 font-semibold">
                        {benefit.title}
                      </h3>

                      <p className="text-gray-medium-400 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}

          <div className="from-blue-light-50 to-blue-vivid-50 mb-6 rounded-xl bg-gradient-to-r p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-blue-light-600 text-2xl font-bold">
                  10K+
                </div>

                <div className="text-gray-medium-500 text-xs">
                  Anfitriones activos
                </div>
              </div>

              <div>
                <div className="text-blue-vivid-600 text-2xl font-bold">
                  4.8
                </div>

                <div className="text-gray-medium-500 text-xs">
                  Calificacion promedio
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-emerald-600">$500+</div>

                <div className="text-gray-medium-500 text-xs">
                  Ingreso mensual avg.
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                <span className="text-xs font-bold text-white">!</span>
              </div>

              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex flex-col gap-3 p-8 pt-0 sm:flex-row">
          <button
            onClick={onClose}
            disabled={isLoading}
            type="button"
            className="text-gray-medium-500 flex-1 cursor-pointer rounded-xl border border-neutral-500 px-6 py-3 text-sm font-semibold transition-all hover:bg-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Quizas mas tarde
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            type="button"
            className="from-blue-light-500 to-blue-vivid-500 hover:from-blue-light-600 hover:to-blue-vivid-600 disabled:from-blue-light-300 disabled:to-blue-vivid-300 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Comenzar ahora
                <Star className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;

            transform: translateY(20px) scale(0.95);
          }

          to {
            opacity: 1;

            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
