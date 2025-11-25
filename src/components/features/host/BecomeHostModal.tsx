"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  const { update: updateSession } = useSession();

  // Prevenir scroll del body cuando el modal esta abierto
  useEffect(() => {
    if (isOpen) {
      console.log("🚪 Modal ABIERTO");
      document.body.style.overflow = "hidden";
    } else {
      console.log("🚪 Modal CERRADO");
      document.body.style.overflow = "unset";
    }

    return () => {
      console.log("🧹 Modal DESMONTADO (cleanup)");
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    console.log("🚀 handleSubmit iniciado");
    try {
      setIsLoading(true);
      setError(null);

      console.log("📞 Llamando a userService.becomeHost()...");
      const result = await userService.becomeHost();
      console.log("📥 Resultado de becomeHost:", result);

      if (result.success) {
        // Forzar actualización de la sesión para reflejar isHost = true
        console.log("🔄 Actualizando sesión después de convertirse en host...");
        await updateSession();

        console.log("✅ Proceso completado, cerrando modal y redirigiendo...");
        onClose();
        router.push("/host/dashboard");
      } else {
        console.error("❌ Error en becomeHost:", result.error);
        setError(result.error || "Error desconocido");
      }
    } catch (err: unknown) {
      console.error("💥 Error en handleSubmit:", err);
      setError("Error de conexion. Por favor, intentalo de nuevo.");
    } finally {
      console.log("🔚 handleSubmit finalizando, setIsLoading(false)");
      setIsLoading(false);
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) {
    console.log("❌ BecomeHostModal no se renderiza:", { isOpen, isMounted });
    return null;
  }

  console.log("✅ BecomeHostModal renderizándose:", { isOpen, isMounted });

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

  console.log("🎭 BecomeHostModal creando modalContent...");

  // FIX: Handler separado para el backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("🖱️ Backdrop clickeado", {
      target: e.target,
      currentTarget: e.currentTarget,
      isBackdrop: e.target === e.currentTarget,
    });
    // Solo cerrar si el click fue directamente en el backdrop
    if (e.target === e.currentTarget) {
      console.log("✅ Click en backdrop confirmado, cerrando modal");
      onClose();
    } else {
      console.log("❌ Click no fue en backdrop, ignorando");
    }
  };

  // FIX: Handler separado para el botón de cerrar
  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🖱️ Botón X clickeado");
    e.stopPropagation();
    onClose();
  };

  // FIX: Handler separado para "Quizás más tarde"
  const handleMaybeLater = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🖱️ Botón 'Quizás más tarde' clickeado");
    e.stopPropagation();
    onClose();
  };

  // FIX: Handler mejorado para el botón principal
  const handleBeginClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🖱️ Botón 'Comenzar ahora' clickeado", { isLoading });
    console.log("🔍 Event details:", {
      type: e.type,
      target: e.target,
      currentTarget: e.currentTarget,
      button: e.button,
    });

    e.preventDefault();
    e.stopPropagation();

    console.log("⏸️ Propagación detenida");

    if (!isLoading) {
      console.log("✅ No está cargando, llamando a handleSubmit...");
      await handleSubmit();
    } else {
      console.log("⏳ Ya está cargando, ignorando click");
    }
  };

  const modalContent = (
    <div
      className="animate-fadeIn fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onMouseDown={(_e) => console.log("🌑 MouseDown en BACKDROP")}
      onMouseUp={(_e) => console.log("🌑 MouseUp en BACKDROP")}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="animate-slideUp relative mx-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => {
          console.log("🖱️ Modal content clickeado, deteniendo propagación");
          e.stopPropagation();
        }}
        onClickCapture={(e) => {
          console.log("🎯 Click CAPTURE en modal content", {
            target: e.target,
            type: (e.target as HTMLElement).tagName,
          });
        }}
      >
        {/* Header con gradiente */}
        <div className="from-blue-light-500 to-blue-vivid-500 relative rounded-t-2xl bg-gradient-to-r p-8">
          <button
            onClick={handleCloseClick}
            className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/20 p-2 transition-all hover:bg-white/30"
            disabled={isLoading}
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
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
            onClick={handleMaybeLater}
            disabled={isLoading}
            type="button"
            className="text-gray-medium-500 flex-1 cursor-pointer rounded-xl border border-neutral-500 px-6 py-3 text-sm font-semibold transition-all hover:bg-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            Quizas mas tarde
          </button>

          <button
            onClick={(e) => {
              console.log("🎯 onClick DIRECTO ejecutado!");
              handleBeginClick(e);
            }}
            disabled={isLoading}
            type="button"
            className="from-blue-light-500 to-blue-vivid-500 hover:from-blue-light-600 hover:to-blue-vivid-600 disabled:from-blue-light-300 disabled:to-blue-vivid-300 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed"
            onMouseDown={(e) => {
              console.log("🖱️ MouseDown en botón 'Comenzar ahora'", {
                disabled: isLoading,
              });
              e.stopPropagation(); // ¡CRÍTICO! Evita que llegue al backdrop
            }}
            onMouseUp={(e) => {
              console.log("🖱️ MouseUp en botón 'Comenzar ahora'");
              e.stopPropagation();
            }}
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

  console.log("🚪 BecomeHostModal creando portal en document.body");

  try {
    const portal = createPortal(modalContent, document.body);
    console.log("✅ Portal creado exitosamente");
    return portal;
  } catch (error) {
    console.error("❌ Error creando portal:", error);
    return null;
  }
}
