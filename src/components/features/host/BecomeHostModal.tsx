"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Star, DollarSign, Users, Loader2, Home, Shield, TrendingUp } from "lucide-react";
import { userService } from "@/src/services/user.service";

interface BecomeHostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeHostModal({ isOpen, onClose }: BecomeHostModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Animación de entrada
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await userService.becomeHost();

      if (result.success) {
        onClose();
        router.push('/host/dashboard');
      } else {
        setError(result.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError('Error de conexión. Por favor, inténtalo de nuevo.');
      console.error('Error en handleSubmit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  const benefits = [
    {
      icon: DollarSign,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      title: "Genera ingresos pasivos",
      description: "Monetiza tu propiedad mientras no la uses"
    },
    {
      icon: Users,
      bgColor: "bg-blue-light-100",
      iconColor: "text-blue-light-600",
      title: "Conoce nuevas personas",
      description: "Conecta con viajeros de todo el mundo"
    },
    {
      icon: Shield,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Protección garantizada",
      description: "Tu propiedad está asegurada en cada reserva"
    },
    {
      icon: TrendingUp,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Crece a tu ritmo",
      description: "Tú decides cuándo y cómo alquilar"
    }
  ];

  return (
    <div 
      className={`fixed inset-0 bg-gray-dark-500/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto transform transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente de tu paleta */}
        <div className="relative bg-gradient-to-r from-blue-light-500 to-blue-vivid-500 p-8 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 cursor-pointer hover:bg-white/30 transition-all"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                ¡Conviértete en anfitrión!
              </h2>
              <p className="text-blue-light-50">
                Únete a miles de anfitriones exitosos
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Texto introductorio */}
          <p className="text-gray-medium-400 text-center mb-8 text-lg">
            Transforma tu espacio en una oportunidad de ingresos y experiencias únicas
          </p>

          {/* Benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="group p-4 rounded-xl border border-neutral-500 hover:border-blue-light-400 hover:shadow-md transition-all duration-200 cursor-default"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 ${benefit.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`w-6 h-6 ${benefit.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-dark-500 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-medium-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-blue-light-50 to-blue-vivid-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-light-600">10K+</div>
                <div className="text-xs text-gray-medium-500">Anfitriones activos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-vivid-600">4.8★</div>
                <div className="text-xs text-gray-medium-500">Calificación promedio</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">$500+</div>
                <div className="text-xs text-gray-medium-500">Ingreso mensual avg.</div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 text-sm font-semibold cursor-pointer text-gray-medium-500 hover:bg-neutral-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-neutral-500"
          >
            Quizás más tarde
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-light-500 to-blue-vivid-500 cursor-pointer hover:from-blue-light-600 hover:to-blue-vivid-600 disabled:from-blue-light-300 disabled:to-blue-vivid-300 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Comenzar ahora
                <Star className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}