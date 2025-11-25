"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense, // <--- Importante importar Suspense
} from "react";
import {
  MessageCircle,
  Search,
  Send,
  MapPin,
  Calendar,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useSearchParams } from "next/navigation";

// --- Tipos Unificados ---

type ChatMessage = {
  id: string;
  sender: "host" | "guest";
  content: string;
  timestamp: string;
};

// Interfaz que soporta tanto los campos del Host como los del Guest
type Conversation = {
  id: string;
  // Campos comunes
  propertyName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "pending" | "accepted" | "confirmed";
  messages: ChatMessage[];

  // Campos específicos del Host
  guestName?: string;
  intentSummary?: string;
  interestChannel?: string;
  requestId?: string;
  roomId?: string;

  // Campos específicos del Guest
  reservationId?: string;
  hostName?: string;
  autoCreatedAt?: string;
};

const SHARED_STORAGE_KEY = "smart-guest-chats";

// Función para leer y ADAPTAR los chats
const readStoredChats = (): Conversation[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHARED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((chat: Conversation) => ({
          ...chat,
          guestName: chat.guestName || "Huésped (Usuario)",
          requestId: chat.requestId || chat.reservationId || "SOL-GENERIC",
          intentSummary:
            chat.intentSummary ||
            `Solicitud de reserva para ${chat.guests} personas`,
          interestChannel: chat.interestChannel || "Reserva Directa",
          roomId: chat.roomId || "GENERAL",
        }))
      : [];
  } catch {
    return [];
  }
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("es-PE", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

// --- COMPONENTE DE CONTENIDO (Lógica Principal) ---
function HostMessagesContent() {
  const searchParams = useSearchParams();
  const initialReservationId = searchParams.get("reservationId");

  const [searchTerm, setSearchTerm] = useState("");
  const [messageDraft, setMessageDraft] = useState("");

  // Cargar chats al inicio usando useMemo para evitar setState en useEffect
  const initialChats = useMemo(() => readStoredChats(), []);
  const [localChats, setLocalChats] = useState<Conversation[]>(initialChats);

  // Calcular la conversación inicial basada en el parámetro de URL
  const initialActiveId = useMemo(() => {
    if (!initialReservationId || initialChats.length === 0) return null;
    const target = initialChats.find(
      (c) =>
        c.reservationId === initialReservationId ||
        c.id === initialReservationId ||
        c.requestId === initialReservationId
    );
    return target?.id ?? null;
  }, [initialReservationId, initialChats]);

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(initialActiveId);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SHARED_STORAGE_KEY) {
        setLocalChats(readStoredChats());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const persistLocalChats = useCallback((newChats: Conversation[]) => {
    setLocalChats(newChats);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(newChats));
    }
  }, []);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return localChats;
    return localChats.filter(
      (conversation) =>
        (conversation.guestName?.toLowerCase() || "").includes(term) ||
        (conversation.propertyName?.toLowerCase() || "").includes(term) ||
        (conversation.requestId?.toLowerCase() || "").includes(term)
    );
  }, [searchTerm, localChats]);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return localChats.find((c) => c.id === activeConversationId) ?? null;
  }, [activeConversationId, localChats]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageDraft.trim() || !activeConversation) return;

    const newMessage: ChatMessage = {
      id: `host-${Date.now()}`,
      sender: "host",
      content: messageDraft.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedChats = localChats.map((c) => {
      if (c.id === activeConversation.id) {
        return { ...c, messages: [...c.messages, newMessage] };
      }
      return c;
    });

    persistLocalChats(updatedChats);
    setMessageDraft("");
  };

  const messagesEndRef = useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        node.scrollIntoView({ behavior: "smooth" });
      }
    },
    [] // No necesita dependencias ya que solo hace scroll
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="bg-blue-light-50 text-blue-light-700 mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
          <Sparkles className="h-4 w-4" />
          Chat habilitado
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
        <p className="text-sm text-gray-600">
          Gestiona la comunicación directa con tus huéspedes interesados.
        </p>
      </div>

      <div className="grid flex-1 gap-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col border-r border-gray-100 bg-white">
          <div className="space-y-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar anfitrión o reserva"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <p className="px-1 text-xs text-gray-500">
              Solo verás las conversaciones de reservas activas.
            </p>
          </div>

          <div className="flex-1 divide-y divide-gray-50 overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];

              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`w-full p-4 text-left transition-all hover:bg-gray-50 ${
                    isActive
                      ? "border-l-4 border-blue-500 bg-blue-50/60"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <span className="max-w-[160px] truncate text-sm font-bold text-gray-900">
                      {conversation.guestName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        conversation.status === "pending"
                          ? "bg-blue-100 text-blue-700"
                          : conversation.status === "accepted" ||
                              conversation.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {conversation.status === "pending"
                        ? "Pendiente"
                        : "Confirmada"}
                    </span>
                  </div>

                  <p className="mb-2 truncate text-xs text-gray-500">
                    {conversation.propertyName}
                  </p>
                  <p className="mb-1 font-mono text-xs text-gray-400">
                    {conversation.requestId}
                  </p>

                  <p className="mt-2 flex items-center gap-1 truncate text-xs text-gray-600">
                    {lastMessage ? (
                      <>
                        <span className="font-medium text-gray-800">
                          {lastMessage.sender === "host" ? "Tú: " : ""}
                        </span>
                        {lastMessage.content}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Sin mensajes</span>
                    )}
                  </p>
                </button>
              );
            })}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">
                No se encontraron chats
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex h-full flex-col overflow-hidden bg-gray-50/30">
          {activeConversation ? (
            <>
              {/* Header Chat */}
              <div className="flex flex-col justify-between gap-4 border-b border-gray-100 bg-white p-6 sm:flex-row">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Chat generado automáticamente
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeConversation.guestName}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatDate(activeConversation.checkIn)} -{" "}
                        {formatDate(activeConversation.checkOut)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{activeConversation.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{activeConversation.guests} huéspedes</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Creado el{" "}
                    {formatDate(
                      activeConversation.messages[0]?.timestamp ||
                        new Date().toISOString()
                    )}
                    , justo después de enviar tu solicitud.
                  </p>
                </div>

                <div className="flex flex-col items-end justify-start">
                  <Button
                    variant="text"
                    className="px-0 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Ver reserva
                  </Button>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 space-y-6 overflow-y-auto bg-white p-6">
                {activeConversation.messages.map((msg) => {
                  const isHost = msg.sender === "host";
                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${
                        isHost ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                          isHost
                            ? "rounded-br-none bg-blue-600 text-white"
                            : "rounded-bl-none bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`mt-2 text-right text-[10px] ${
                            isHost ? "text-blue-200" : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-100 bg-white p-4">
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Comparte detalles con el anfitrión para acelerar la
                      confirmación...
                    </p>
                    <p className="text-xs font-medium text-blue-600">
                      Consejo: responde rápido para mantener tu lugar.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    className="max-h-[120px] min-h-[48px] flex-1 resize-none rounded-2xl border-transparent bg-gray-50 px-4 py-3 text-sm focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    rows={1}
                  />
                  <Button
                    type="submit"
                    disabled={!messageDraft.trim()}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 p-0 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-gray-50/30 p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <MessageCircle className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No hay chat seleccionado
              </h3>
              <p className="mt-1 max-w-xs text-gray-500">
                Selecciona una conversación de la lista para ver los detalles y
                responder.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// --- COMPONENTE PADRE CON SUSPENSE ---
export default function HostMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <HostMessagesContent />
    </Suspense>
  );
}
