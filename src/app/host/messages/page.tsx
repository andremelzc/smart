"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Send,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";

// --- 1. Definición de Tipos (Compatible con el del Guest) ---

interface Message {
  id: string;
  sender: "guest" | "host";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  reservationId: string;
  hostName: string;
  // Agregamos guestName para la vista del host
  guestName?: string; 
  propertyName: string;
  location: string;
  autoCreatedAt: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "confirmed" | "pending";
  messages: Message[];
}

const CHAT_STORAGE_KEY = "smart-guest-chats";

// --- Datos Dummy Específicos para el Host (si está vacío) ---
const HOST_DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: "CHAT-RES-HOST-1",
    reservationId: "RES-HOST-1",
    hostName: "Yo (Anfitrión)", 
    guestName: "Carlos Mendoza", // El nombre que le interesa al host
    propertyName: "Tu Depto en Barranco",
    location: "Lima, Peru",
    autoCreatedAt: "2025-10-25T09:00:00Z",
    checkIn: "2025-12-01T15:00:00Z",
    checkOut: "2025-12-05T11:00:00Z",
    guests: 2,
    status: "pending",
    messages: [
      {
        id: "msg-1",
        sender: "guest",
        content: "Hola, me encanta tu espacio. ¿El check-in puede ser a las 10pm?",
        timestamp: "2025-10-25T09:05:00Z",
      },
    ],
  },
  {
    id: "CHAT-RES-HOST-2",
    reservationId: "RES-HOST-2",
    hostName: "Yo (Anfitrión)",
    guestName: "Lucía Campos",
    propertyName: "Casa de Playa en Asia",
    location: "Cañete, Peru",
    autoCreatedAt: "2025-10-20T14:00:00Z",
    checkIn: "2026-01-15T12:00:00Z",
    checkOut: "2026-01-20T10:00:00Z",
    guests: 6,
    status: "confirmed",
    messages: [
      {
        id: "msg-h-1",
        sender: "host",
        content: "¡Hola Lucía! Todo listo para tu llegada.",
        timestamp: "2025-10-20T14:10:00Z",
      },
      {
        id: "msg-g-1",
        sender: "guest",
        content: "¡Genial! Llevaremos un auto extra, ¿hay cochera?",
        timestamp: "2025-10-20T14:15:00Z",
      },
    ],
  },
];

// --- Inicializador de Datos ---
function initializeHostChats() {
  try {
    const rawData = window.localStorage.getItem(CHAT_STORAGE_KEY);
    const existing = rawData ? JSON.parse(rawData) : [];
    
    if (!Array.isArray(existing) || existing.length === 0) {
      // Si no hay nada, cargamos datos de prueba para el host
      window.localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(HOST_DUMMY_CONVERSATIONS)
      );
      return HOST_DUMMY_CONVERSATIONS;
    }
    return existing;
  } catch (error) {
    return HOST_DUMMY_CONVERSATIONS;
  }
}

// --- 2. Componente Principal ---

function HostMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeReservationId = searchParams.get("reservationId");

  // Cargar datos
  useEffect(() => {
    const allConvos = initializeHostChats();
    // Asegurar que tengan guestName (si vienen del lado guest, podria faltar)
    const enrichedConvos = allConvos.map((c: Conversation) => ({
      ...c,
      guestName: c.guestName || "Huésped (Usuario)", // Fallback name
    }));
    setConversations(enrichedConvos);

    // Seleccionar el primero por defecto si no hay ID
    if (!activeReservationId && enrichedConvos.length > 0) {
      router.replace(`/host/messages?reservationId=${enrichedConvos[0].reservationId}`);
    }
  }, [router, activeReservationId]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.reservationId === activeReservationId) || conversations[0] || null;
  }, [conversations, activeReservationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: `host-${Date.now()}`,
      sender: "host", // <--- IMPORTANTE: Ahora enviamos como HOST
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedConversations = conversations.map((convo) => {
      if (convo.id === activeConversation.id) {
        return { ...convo, messages: [...convo.messages, newMessage] };
      }
      return convo;
    });

    setConversations(updatedConversations);
    setCurrentMessage("");
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedConversations));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mensajes con Huéspedes</h1>
        <p className="text-gray-500 text-sm">Gestiona las consultas y solicitudes de tus reservas.</p>
      </div>

      <div className="flex-1 border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        
        {/* Sidebar: Lista de Chats */}
        <div className="border-r border-gray-200 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar huésped..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => router.push(`/host/messages?reservationId=${convo.reservationId}`)}
                className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                  activeConversation?.id === convo.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 truncate pr-2">
                    {convo.guestName}
                  </h3>
                  {convo.status === 'pending' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800">
                      Solicitud
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mb-2">{convo.propertyName}</p>
                
                {/* Preview último mensaje */}
                <p className="text-xs text-gray-600 truncate opacity-80">
                  {convo.messages.length > 0 ? (
                    <>
                      <span className="font-medium">
                        {convo.messages[convo.messages.length - 1].sender === 'host' ? 'Tú: ' : ''}
                      </span>
                      {convo.messages[convo.messages.length - 1].content}
                    </>
                  ) : (
                    <span className="italic">Sin mensajes</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col bg-white">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {activeConversation.guestName}
                    </h2>
                    {activeConversation.status === 'confirmed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className="font-medium text-blue-600">{activeConversation.propertyName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(activeConversation.checkIn).toLocaleDateString()} - {new Date(activeConversation.checkOut).toLocaleDateString()}
                    </span>
                  </button>
                </div>
                
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Reserva</p>
                  <p className="text-sm font-mono text-gray-600">{activeConversation.reservationId}</p>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {activeConversation.messages.map((msg) => {
                  const isMe = msg.sender === 'host'; // Ahora "Yo" soy el host
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${isMe ? "order-2" : "order-1"}`}>
                        <div
                          className={`p-4 rounded-2xl shadow-sm ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-[11px] text-gray-400 ${isMe ? "justify-end" : "justify-start"}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!currentMessage.trim()}
                    className="bg-blue-600 text-white rounded-xl px-6 py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Enviar</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>Selecciona una conversación para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 3. Wrapper con Suspense ---
export default function HostMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando chat...</div>}>
      <HostMessagesContent />
    </Suspense>
  );
}