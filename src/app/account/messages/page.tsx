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

// --- 1. Definición de Tipos (API) ---

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isMe: boolean;
}

interface Conversation {
  id: number;
  reservationId: string | null;
  hostName: string;
  propertyName: string;
  location: string;
  autoCreatedAt: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  lastMessage: {
    content: string;
    senderId: number;
    timestamp: string;
  };
}

// --- 2. Componente Principal del Chat (Contenido de la Página) ---

function AccountMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtiene el ID de la conversación activa desde la URL
  // Nota: La URL usa "reservationId" por legado, pero ahora usaremos conversationId (id numérico)
  // Si el param es numérico, asumimos que es conversationId.
  const activeConversationIdParam = searchParams.get("conversationId");

  // --- Carga de Conversaciones ---
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) throw new Error("Error fetching conversations");
        const data = await res.json();
        setConversations(data);

        // Si no hay conversación seleccionada y hay conversaciones, seleccionar la primera
        if (!activeConversationIdParam && data.length > 0) {
          router.replace(`/account/messages?conversationId=${data[0].id}`);
        }
      } catch (error) {
        console.error("Error cargando conversaciones:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [router, activeConversationIdParam]);

  // Encontrar la conversación activa
  const activeConversation = useMemo(() => {
    if (!activeConversationIdParam) return null;
    return (
      conversations.find(
        (c) => c.id.toString() === activeConversationIdParam
      ) || null
    );
  }, [conversations, activeConversationIdParam]);

  // --- Carga de Mensajes ---
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(
          `/api/conversations/${activeConversation.id}/messages`
        );
        if (!res.ok) throw new Error("Error fetching messages");
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error cargando mensajes:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Polling simple para nuevos mensajes (opcional, cada 10s)
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Manejadores de Eventos ---

  // Cambiar de conversación activa
  const handleSelectConversation = useCallback(
    (conversationId: number) => {
      router.push(`/account/messages?conversationId=${conversationId}`);
    },
    [router]
  );

  // Enviar un nuevo mensaje
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentMessage.trim() || !activeConversation) return;

      const content = currentMessage.trim();
      setCurrentMessage(""); // Limpiar input inmediatamente

      try {
        const res = await fetch(
          `/api/conversations/${activeConversation.id}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          }
        );

        if (!res.ok) throw new Error("Error enviando mensaje");

        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);

        // Actualizar la última mensaje en la lista de conversaciones (opcional pero recomendado)
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  lastMessage: {
                    content: newMessage.content,
                    senderId: newMessage.senderId,
                    timestamp: newMessage.timestamp,
                  },
                }
              : c
          )
        );
      } catch (error) {
        console.error("Error enviando mensaje:", error);
        // Aquí podrías mostrar un toast de error o restaurar el mensaje en el input
      }
    },
    [currentMessage, activeConversation]
  );

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="text-gray-500">Cargando conversaciones...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <p className="text-sm font-semibold text-gray-700">
          Chat disponible cuando envías una solicitud
        </p>
      </div>
      <h1 className="text-gray-dark-900 mb-2 text-3xl font-semibold">
        Mensajes
      </h1>
      <p className="text-gray-dark-600 -mt-4">
        Cada vez que solicitas una reserva, Smart abre un canal directo con el
        anfitrión para resolver dudas y acelerar la confirmación.
      </p>

      <div className="grid h-[calc(100vh-300px)] min-h-[500px] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 md:grid-cols-3">
        {/* Columna Izquierda: Lista de Conversaciones */}
        <div className="flex flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar anfitrión o reserva"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-4 pl-10 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Solo verás las conversaciones de reservas que tú iniciaste.
            </p>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">
                No tienes conversaciones. Inicia un chat desde una de tus
                reservas.
              </p>
            ) : (
              conversations.map((convo) => (
                <ConversationListItem
                  key={convo.id}
                  conversation={convo}
                  isActive={convo.id === activeConversation?.id}
                  onSelect={handleSelectConversation}
                />
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Chat Activo */}
        <div className="flex h-full flex-col bg-gray-50 md:col-span-2">
          {!activeConversation ? (
            <ChatPlaceholder />
          ) : (
            <>
              <ChatHeader conversation={activeConversation} />

              <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                <p className="text-center text-xs text-gray-400">
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

                {isLoadingMessages ? (
                  <div className="flex justify-center p-4">
                    <span className="text-xs text-gray-400">
                      Cargando mensajes...
                    </span>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} isMe={msg.isMe} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

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
  onSelect: (id: number) => void;
}

function ConversationListItem({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemProps) {
  const lastMessage = conversation.lastMessage;
  const statusLabel =
    conversation.status === "PENDING" ? "Pendiente" : "Confirmada"; // Ajustar según valores reales de DB
  const statusClass =
    conversation.status === "PENDING"
      ? "text-yellow-600 bg-yellow-100"
      : "text-green-600 bg-green-100";

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full rounded-lg p-4 text-left transition-colors ${
        isActive ? "border border-blue-200 bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{conversation.hostName}</h3>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>
      <p className="truncate text-sm text-gray-600">
        {conversation.propertyName}
      </p>
      <p className="mt-1 text-xs text-gray-400">{conversation.reservationId}</p>
      {lastMessage && lastMessage.content && (
        <p className="mt-2 truncate text-sm text-gray-500">
          <span className="font-medium">
            {/* Aquí no sabemos si el último mensaje fue "Tú" sin comparar IDs, pero podemos omitirlo o mejorarlo luego */}
            Mensaje:
          </span>{" "}
          {lastMessage.content}
        </p>
      )}
    </button>
  );
}

// --- 4. Sub-componente: Header del Chat Activo ---

function ChatHeader({ conversation }: { conversation: Conversation }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="border-b border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {conversation.hostName}
          </h2>
          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(conversation.checkIn)} -{" "}
              {formatDate(conversation.checkOut)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {conversation.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {conversation.guests} huésped
              {conversation.guests > 1 ? "es" : ""}
            </span>
          </div>
        </div>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Ver reserva
        </a>
      </div>
    </div>
  );
}

// --- 5. Sub-componente: Burbuja de Mensaje ---

function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-2xl p-3 md:max-w-md ${
          isMe
            ? "rounded-br-lg bg-blue-600 text-white"
            : "rounded-bl-lg border border-gray-200 bg-white text-gray-800"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={`mt-1 text-xs ${
            isMe ? "text-right text-blue-100/70" : "text-gray-400"
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
      className="border-t border-gray-200 bg-white p-4"
    >
      <div className="mb-3 rounded-lg bg-gray-100 p-3 text-center">
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
          className="flex-1 resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage(e);
            }
          }}
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          disabled={!currentMessage.trim()}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">
        Consejo: responde rápido para mantener tu lugar.
      </p>
    </form>
  );
}

// --- 7. Sub-componente: Placeholder de Chat Vacío ---

function ChatPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <MessageCircle className="h-16 w-16 text-gray-300" />
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
