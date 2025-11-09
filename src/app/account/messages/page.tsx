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
  MessageCircle,
} from "lucide-react";

// --- 1. Definición de Tipos (basado en tu lógica de reservas) ---

// Estructura del mensaje individual
interface Message {
  id: string;
  sender: "guest" | "host";
  content: string;
  timestamp: string;
}

// Estructura de la conversación guardada en Local Storage
interface Conversation {
  id: string; // "CHAT-RES-XXXX"
  reservationId: string; // "RES-XXXX"
  hostName: string;
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

// --- NUEVO: Datos Dummy para el prototipo (basado en tu mockup) ---
const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: "CHAT-RES-2045",
    reservationId: "RES-2045",
    hostName: "Ana Rodriguez",
    propertyName: "Loft moderno en Miraflores",
    location: "Lima, Peru",
    autoCreatedAt: "2025-10-24T12:35:00Z",
    checkIn: "2025-10-24T14:00:00Z",
    checkOut: "2025-10-28T11:00:00Z",
    guests: 2,
    status: "pending",
    messages: [
      {
        id: "guest-1",
        sender: "guest",
        content:
          "Hola Ana, acabo de enviar la solicitud. ¿Podrías confirmar si el loft tiene escritorio amplio?",
        timestamp: "2025-10-24T12:38:00Z",
      },
      {
        id: "host-1",
        sender: "host",
        content:
          "Hola María, si contamos con escritorio y monitor. ¿Necesitas algo adicional?",
        timestamp: "2025-10-24T12:39:00Z",
      },
    ],
  },
  {
    id: "CHAT-RES-2078",
    reservationId: "RES-2078",
    hostName: "Luis Flores",
    propertyName: "Casa frente al mar en Mancora",
    location: "Mancora, Peru",
    autoCreatedAt: "2025-10-22T10:00:00Z",
    checkIn: "2025-11-15T14:00:00Z",
    checkOut: "2025-11-20T11:00:00Z",
    guests: 4,
    status: "confirmed",
    messages: [
      {
        id: "host-2",
        sender: "host",
        content: "¡Reserva confirmada! Los esperamos.",
        timestamp: "2025-10-22T10:28:00Z",
      },
      {
        id: "guest-2",
        sender: "guest",
        content:
          "Perfecto, estaremos atentos. ¿Podríamos ingresar un poco antes?",
        timestamp: "2025-10-22T10:29:00Z",
      },
    ],
  },
];

// --- NUEVO: Función para inicializar los datos dummy ---
/**
 * Comprueba Local Storage. Si está vacío, inyecta los datos dummy.
 */
function initializeDummyChats() {
  try {
    const rawData = window.localStorage.getItem(CHAT_STORAGE_KEY);
    const existingConvos = rawData ? JSON.parse(rawData) : [];
    if (!Array.isArray(existingConvos) || existingConvos.length === 0) {
      // Solo inyecta si el Local Storage está vacío
      window.localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(DUMMY_CONVERSATIONS)
      );
      return DUMMY_CONVERSATIONS;
    }
    return existingConvos;
  } catch (error) {
    console.error("Error al inicializar chats:", error);
    // En caso de error (ej. JSON malformado), forzamos los dummies
    window.localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify(DUMMY_CONVERSATIONS)
    );
    return DUMMY_CONVERSATIONS;
  }
}

// --- 2. Componente Principal del Chat (Contenido de la Página) ---

function AccountMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtiene el ID de la conversación activa desde la URL
  const activeReservationId = searchParams.get("reservationId");

  // --- Carga de Datos y Sincronización ---

  // Cargar conversaciones desde Local Storage al montar el componente
  useEffect(() => {
    try {
      // --- MODIFICADO: Usamos la función de inicialización ---
      const allConvos = initializeDummyChats();
      setConversations(allConvos);

      // --- NUEVO: Seleccionar el primer chat si no hay ninguno activo ---
      const currentReservationId = searchParams.get("reservationId");
      if (!currentReservationId && allConvos.length > 0) {
        // Redirige para seleccionar el primer chat de la lista
        router.replace(
          `/account/messages?reservationId=${allConvos[0].reservationId}`
        );
      }
    } catch (error) {
      console.error("Error al cargar chats:", error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [router, searchParams]);

  // Encontrar la conversación activa
  const activeConversation = useMemo(() => {
    // --- MODIFICADO: Selecciona el primero si no hay ID en URL ---
    if (!activeReservationId) {
      // Si no hay ID en la URL pero ya tenemos conversaciones, mostramos la primera
      return conversations[0] || null;
    }
    return (
      conversations.find((c) => c.reservationId === activeReservationId) || null
    );
  }, [conversations, activeReservationId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages]);

  // --- Manejadores de Eventos ---

  // Cambiar de conversación activa
  const handleSelectConversation = useCallback(
    (reservationId: string) => {
      // Actualiza la URL sin recargar la página
      router.push(`/account/messages?reservationId=${reservationId}`);
    },
    [router]
  );

  // Enviar un nuevo mensaje
  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentMessage.trim() || !activeConversation) return;

      const newMessage: Message = {
        id: `guest-${Date.now()}`,
        sender: "guest",
        content: currentMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      // Actualiza el estado y Local Storage
      const updatedConversations = conversations.map((convo) => {
        if (convo.id === activeConversation.id) {
          return {
            ...convo,
            messages: [...convo.messages, newMessage],
          };
        }
        return convo;
      });

      setConversations(updatedConversations);
      setCurrentMessage("");
      window.localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(updatedConversations)
      );

      // TODO: Aquí iría la llamada a la API del backend para enviar el mensaje
      // await chatService.sendMessage(activeConversation.id, newMessage);
    },
    [currentMessage, activeConversation, conversations]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="text-gray-500">Cargando conversaciones...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Título de la sección (igual al mockup) */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <p className="text-sm font-semibold text-gray-700">
          Chat disponible cuando envías una solicitud
        </p>
      </div>
      <h1 className="text-3xl font-semibold text-gray-dark-900 mb-2">
        Mensajes
      </h1>
      <p className="text-gray-dark-600 -mt-4">
        Cada vez que solicitas una reserva, Smart abre un canal directo con el
        anfitrión para resolver dudas y acelerar la confirmación.
      </p>

      {/* Contenedor principal del chat (2 columnas) */}
      <div className="border border-gray-200 rounded-2xl h-[calc(100vh-300px)] min-h-[500px] grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        {/* Columna Izquierda: Lista de Conversaciones */}
        <div className="flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar anfitrión o reserva"
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {/* --- NUEVO: Texto de ayuda del mockup --- */}
            <p className="text-xs text-gray-500 mt-2">
              Solo verás las conversaciones de reservas que tú iniciaste.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-center text-gray-500">
                No tienes conversaciones. Inicia un chat desde una de tus
                reservas.
              </p>
            ) : (
              conversations.map((convo) => (
                <ConversationListItem
                  key={convo.id}
                  conversation={convo}
                  isActive={convo.reservationId === activeReservationId}
                  onSelect={handleSelectConversation}
                />
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Chat Activo */}
        <div className="md:col-span-2 flex flex-col bg-gray-50 h-full">
          {!activeConversation ? (
            <ChatPlaceholder />
          ) : (
            <>
              {/* Header del Chat Activo */}
              <ChatHeader conversation={activeConversation} />

              {/* Cuerpo de Mensajes */}
              <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
                {/* --- NUEVO: Mensaje de "Chat generado" del mockup --- */}
                <p className="text-xs text-center text-gray-400">
                  Chat generado automaticamente <br />
                  Creado el{" "}
                  {new Date(
                    activeConversation.autoCreatedAt
                  ).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  p. m. justo después de enviar tu solicitud.
                </p>

                {activeConversation.messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isGuest={msg.sender === "guest"}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensaje */}
              <ChatInput
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                onSendMessage={handleSendMessage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 3. Sub-componente: Item de la Lista de Conversaciones ---

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (reservationId: string) => void;
}

function ConversationListItem({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const statusLabel =
    conversation.status === "pending" ? "Pendiente" : "Confirmada";
  const statusClass =
    conversation.status === "pending"
      ? "text-yellow-600 bg-yellow-100" // --- MODIFICADO: Colores del mockup
      : "text-green-600 bg-green-100"; // --- MODIFICADO: Colores del mockup

  return (
    <button
      onClick={() => onSelect(conversation.reservationId)}
      className={`w-full text-left p-4 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-50 border border-blue-200"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-gray-800">
          {conversation.hostName}
        </h3>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded ${statusClass}`} // --- MODIFICADO: "rounded" en vez de "rounded-full"
        >
          {statusLabel}
        </span>
      </div>
      <p className="text-sm text-gray-600 truncate">
        {conversation.propertyName}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {conversation.reservationId}
      </p>
      {lastMessage && (
        <p className="text-sm text-gray-500 mt-2 truncate">
          <span className="font-medium">
            {lastMessage.sender === "guest" ? "Tú: " : "Anfitrión: "}
          </span>
          {lastMessage.content}
        </p>
      )}
    </button>
  );
}

// --- 4. Sub-componente: Header del Chat Activo ---

function ChatHeader({ conversation }: { conversation: Conversation }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {conversation.hostName}
          </h2>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(conversation.checkIn)} -{" "}
              {formatDate(conversation.checkOut)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {conversation.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {conversation.guests} huésped
              {conversation.guests > 1 ? "es" : ""}
            </span>
          </div>
        </div>
        <a
          href="#" // TODO: Cambiar por un Link a /properties/[id] o /account/reservas
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Ver reserva
        </a>
      </div>
    </div>
  );
}

// --- 5. Sub-componente: Burbuja de Mensaje ---

function MessageBubble({
  message,
  isGuest,
}: {
  message: Message;
  isGuest: boolean;
}) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isGuest ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
          isGuest
            ? "bg-blue-600 text-white rounded-br-lg"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-lg"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isGuest ? "text-blue-100/70 text-right" : "text-gray-400" // --- MODIFICADO: hora alineada
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

// --- 6. Sub-componente: Input de Mensaje ---

interface ChatInputProps {
  currentMessage: string;
  setCurrentMessage: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

function ChatInput({
  currentMessage,
  setCurrentMessage,
  onSendMessage,
}: ChatInputProps) {
  return (
    <form
      onSubmit={onSendMessage}
      className="p-4 bg-white border-t border-gray-200"
    >
      {/* --- NUEVO: Mensaje de "Comparte detalles" del mockup --- */}
      <div className="p-3 rounded-lg bg-gray-100 text-center mb-3">
        <p className="text-sm text-gray-600">
          Comparte detalles con el anfitrión para acelerar la confirmación...
        </p>
      </div>

      <div className="flex items-center gap-3">
        <textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          rows={1}
          className="flex-1 p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage(e);
            }
          }}
        />
        <button
          type="submit"
          className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!currentMessage.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {/* --- NUEVO: Texto de "Consejo" del mockup --- */}
      <p className="text-xs text-gray-400 mt-2 text-center">
        Consejo: responde rápido para mantener tu lugar.
      </p>
    </form>
  );
}

// --- 7. Sub-componente: Placeholder de Chat Vacío ---

function ChatPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <MessageCircle className="w-16 h-16 text-gray-300" />
      <h3 className="mt-4 text-lg font-semibold text-gray-700">
        Selecciona una conversación
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Elige un chat de la lista para ver los mensajes.
      </p>
    </div>
  );
}

// --- 8. Exportación con Suspense (para useSearchParams) ---

export default function AccountMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <span className="text-gray-500">Cargando...</span>
        </div>
      }
    >
      <AccountMessagesContent />
    </Suspense>
  );
}