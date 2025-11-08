"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle,
  Search,
  Send,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/Button";

type ChatMessage = {
  id: string;
  sender: "guest" | "host";
  content: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  reservationId: string;
  hostName: string;
  propertyName: string;
  location: string;
  autoCreatedAt: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "pending" | "confirmed";
  messages: ChatMessage[];
};

const conversationsMock: Conversation[] = [
  {
    id: "CHAT-2045",
    reservationId: "RES-2045",
    hostName: "Ana Rodriguez",
    propertyName: "Loft moderno en Miraflores",
    location: "Lima, Peru",
    autoCreatedAt: "2025-10-24T17:35:00Z",
    checkIn: "2025-10-24T19:00:00Z",
    checkOut: "2025-10-28T11:00:00Z",
    guests: 2,
    status: "pending",
    messages: [
      {
        id: "m1",
        sender: "guest",
        content:
          "Hola Ana, acabo de enviar la solicitud. ?Podrias confirmar si el loft tiene escritorio amplio?",
        timestamp: "2025-10-24T17:36:00Z",
      },
      {
        id: "m2",
        sender: "host",
        content:
          "Hola Maria, si contamos con escritorio y monitor. ?Necesitas algo adicional?",
        timestamp: "2025-10-24T17:38:00Z",
      },
    ],
  },
  {
    id: "CHAT-2076",
    reservationId: "RES-2076",
    hostName: "Luis Flores",
    propertyName: "Casa frente al mar en Mancora",
    location: "Talara, Peru",
    autoCreatedAt: "2025-10-22T09:00:00Z",
    checkIn: "2025-12-12T15:00:00Z",
    checkOut: "2025-12-18T11:00:00Z",
    guests: 4,
    status: "confirmed",
    messages: [
      {
        id: "m1",
        sender: "host",
        content:
          "Gracias por confirmar la reserva. Te mando el video del recorrido virtual manana.",
        timestamp: "2025-10-23T10:12:00Z",
      },
      {
        id: "m2",
        sender: "guest",
        content: "Perfecto, estaremos atentos. ?Podriamos ingresar a las 2pm?",
        timestamp: "2025-10-23T10:14:00Z",
      },
    ],
  },
];

const GUEST_CHAT_STORAGE_KEY = "smart-guest-chats";

const readStoredGuestChats = (): Conversation[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", {
    month: "short",
    day: "numeric",
  });

export default function AccountMessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [localChats, setLocalChats] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [baseMessages, setBaseMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const initial: Record<string, ChatMessage[]> = {};
    conversationsMock.forEach((conversation) => {
      initial[conversation.id] = conversation.messages;
    });
    return initial;
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadChats = () => setLocalChats(readStoredGuestChats());
    loadChats();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === GUEST_CHAT_STORAGE_KEY) {
        loadChats();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const persistLocalChats = useCallback((updater: (prev: Conversation[]) => Conversation[]) => {
    setLocalChats((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(GUEST_CHAT_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const allConversations = useMemo(() => {
    const byId = new Map<string, Conversation>();
    [...localChats, ...conversationsMock].forEach((conversation) => {
      byId.set(conversation.id, conversation);
    });
    return Array.from(byId.values());
  }, [localChats]);

  const localChatIds = useMemo(
    () => new Set(localChats.map((conversation) => conversation.id)),
    [localChats],
  );

  useEffect(() => {
    if (allConversations.length === 0) {
      setActiveConversationId(null);
      return;
    }

    const reservationIdParam = searchParams.get("reservationId");
    if (reservationIdParam) {
      const byReservation = allConversations.find(
        (conversation) => conversation.reservationId === reservationIdParam,
      );
      if (byReservation) {
        setActiveConversationId(byReservation.id);
        return;
      }
    }

    if (!activeConversationId) {
      setActiveConversationId(allConversations[0].id);
      return;
    }

    if (!allConversations.some((conversation) => conversation.id === activeConversationId)) {
      setActiveConversationId(allConversations[0].id);
    }
  }, [activeConversationId, allConversations, searchParams]);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allConversations;
    return allConversations.filter(
      (conversation) =>
        conversation.hostName.toLowerCase().includes(term) ||
        conversation.propertyName.toLowerCase().includes(term) ||
        conversation.reservationId.toLowerCase().includes(term),
    );
  }, [searchTerm, allConversations]);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return (
      allConversations.find((conversation) => conversation.id === activeConversationId) ?? null
    );
  }, [activeConversationId, allConversations]);

  const getMessagesForConversation = useCallback(
    (conversationId: string) => {
      if (localChatIds.has(conversationId)) {
        return (
          localChats.find((conversation) => conversation.id === conversationId)?.messages ?? []
        );
      }

      return (
        baseMessages[conversationId] ??
        conversationsMock.find((conversation) => conversation.id === conversationId)?.messages ??
        []
      );
    },
    [baseMessages, localChatIds, localChats],
  );

  const activeMessages = activeConversation ? getMessagesForConversation(activeConversation.id) : [];

  const handleSendMessage = () => {
    if (!messageDraft.trim() || !activeConversation) return;

    const newMessage: ChatMessage = {
      id: `guest-${Date.now()}`,
      sender: "guest",
      content: messageDraft.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...activeMessages, newMessage];
    const isLocalConversation = localChatIds.has(activeConversation.id);

    if (isLocalConversation) {
      persistLocalChats((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversation.id
            ? { ...conversation, messages: updatedMessages }
            : conversation,
        ),
      );
    } else {
      setBaseMessages((prev) => ({
        ...prev,
        [activeConversation.id]: updatedMessages,
      }));
    }

    setMessageDraft("");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-light-50 px-3 py-1 text-xs font-semibold text-blue-light-700">
          <Sparkles className="h-4 w-4" />
          Chat disponible cuando envias una solicitud
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Mensajes</h1>
        <p className="text-gray-600 max-w-2xl text-sm">
          Cada vez que solicitas una reserva, Smart abre un canal directo con el anfitrion para
          resolver dudas y acelerar la confirmacion.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4 space-y-3">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar anfitrion o reserva"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500">
              Solo veras las conversaciones de reservas que tu iniciaste.
            </p>
          </div>

          <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const messages = getMessagesForConversation(conversation.id);
              const lastMessage = messages[messages.length - 1];

              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`w-full text-left px-4 py-4 flex flex-col gap-2 transition-colors ${
                    isActive ? "bg-blue-light-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{conversation.hostName}</p>
                      <p className="text-xs text-gray-500">{conversation.propertyName}</p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        conversation.status === "confirmed"
                          ? "text-emerald-600"
                          : "text-blue-light-600"
                      }`}
                    >
                      {conversation.status === "confirmed" ? "Confirmada" : "Pendiente"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Reserva {conversation.reservationId}</p>
                  {lastMessage && (
                    <p className="text-xs text-gray-500 truncate">
                      {lastMessage.sender === "guest" ? "Tu" : "Anfitrion"}: {lastMessage.content}
                    </p>
                  )}
                </button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">
                No encontramos conversaciones.
              </div>
            )}
          </div>
        </aside>

        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
          {activeConversation ? (
            <>
              <div className="border-b border-gray-100 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Chat generado automaticamente</p>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {activeConversation.hostName}
                    </h2>
                  </div>
                  <Link
                    href="/account/reservas"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-light-600 hover:text-blue-light-700"
                  >
                    Ver reserva
                    <LinkIcon className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {formatDate(activeConversation.checkIn)} -{" "}
                    {formatDate(activeConversation.checkOut)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {activeConversation.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    {activeConversation.guests}{" "}
                    {activeConversation.guests === 1 ? "huesped" : "huespedes"}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Creado el{" "}
                  {new Date(activeConversation.autoCreatedAt).toLocaleString("es-PE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  justo despues de enviar tu solicitud.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeMessages.map((message) => {
                  const isGuest = message.sender === "guest";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isGuest ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isGuest
                            ? "bg-blue-light-500 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }`}
                      >
                        <p>{message.content}</p>
                        <span
                          className={`mt-2 block text-xs ${
                            isGuest ? "text-blue-light-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 p-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50">
                  <textarea
                    rows={2}
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Comparte detalles con el anfitrion para acelerar la confirmacion..."
                    className="w-full resize-none rounded-2xl border-0 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                  <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                    <p className="text-xs text-gray-500">
                      Consejo: responde rapido para mantener tu lugar.
                    </p>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageDraft.trim()}
                      rightIcon={Send}
                      className="text-sm"
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-light-50 text-blue-light-600">
                <MessageCircle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  Aun no has seleccionado un chat
                </h3>
                <p className="text-sm text-gray-600">
                  Envia una solicitud de reserva o abre una de tus reservas activas para comenzar.
                </p>
              </div>
              <Button onClick={() => router.push("/account/reservas")}>
                Ver mis reservas
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
