"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type ChatMessage = {
  id: string;
  sender: "host" | "guest";
  content: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  guestName: string;
  propertyName: string;
  location: string;
  intentSummary: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "pending" | "accepted";
  interestChannel: string;
  requestId: string;
  roomId: string;
  messages: ChatMessage[];
};

const conversationsMock: Conversation[] = [
  {
    id: "REQ-2101",
    guestName: "María López",
    propertyName: "Loft creativo en Barranco",
    location: "Lima, Perú",
    intentSummary:
      "Interesada en reservar del 12 al 15 de noviembre para un viaje de trabajo con sesiones híbridas.",
    checkIn: "2025-11-12T15:00:00Z",
    checkOut: "2025-11-15T11:00:00Z",
    guests: 2,
    status: "pending",
    interestChannel: "Solicitud directa",
    requestId: "SOL-98231",
    roomId: "ROOM-13B",
    messages: [
      {
        id: "m1",
        sender: "guest",
        content:
          "Hola! ¿Tu espacio sigue disponible? Necesito una sala tranquila para reuniones virtuales.",
        timestamp: "2025-10-26T09:40:00Z",
      },
      {
        id: "m2",
        sender: "host",
        content:
          "Hola María, sí está disponible. ¿Requieres algún equipamiento adicional?",
        timestamp: "2025-10-26T09:45:00Z",
      },
      {
        id: "m3",
        sender: "guest",
        content:
          "Solo un escritorio amplio y buena conexión. También quisiera confirmar estacionamiento.",
        timestamp: "2025-10-26T09:47:00Z",
      },
    ],
  },
  {
    id: "REQ-2102",
    guestName: "Carlos Fernández",
    propertyName: "Casa familiar con terraza",
    location: "Arequipa, Perú",
    intentSummary:
      "Busca confirmar disponibilidad para diciembre; desea visita previa virtual.",
    checkIn: "2025-12-02T14:00:00Z",
    checkOut: "2025-12-06T11:00:00Z",
    guests: 4,
    status: "accepted",
    interestChannel: "Recomendación Smart",
    requestId: "SOL-98245",
    roomId: "ROOM-07A",
    messages: [
      {
        id: "m1",
        sender: "guest",
        content:
          "Hola, estoy organizando una estadía familiar. ¿Puedo hacer una videollamada para conocer la casa?",
        timestamp: "2025-10-24T18:20:00Z",
      },
      {
        id: "m2",
        sender: "host",
        content:
          "Hola Carlos, claro. Te puedo compartir un enlace mañana a las 7pm.",
        timestamp: "2025-10-24T18:23:00Z",
      },
      {
        id: "m3",
        sender: "guest",
        content: "Perfecto, quedo atento al enlace. ¡Gracias!",
        timestamp: "2025-10-24T18:24:00Z",
      },
    ],
  },
  {
    id: "REQ-2103",
    guestName: "Lucía Medina",
    propertyName: "Cabaña ecológica en Oxapampa",
    location: "Pasco, Perú",
    intentSummary:
      "Interesada en retiro creativo. Solicita confirmar disponibilidad de estudio acústico.",
    checkIn: "2025-11-28T13:00:00Z",
    checkOut: "2025-12-02T12:00:00Z",
    guests: 3,
    status: "pending",
    interestChannel: "Campaña Host Destacado",
    requestId: "SOL-98255",
    roomId: "ROOM-02F",
    messages: [
      {
        id: "m1",
        sender: "guest",
        content:
          "Hola, me enamoré de la cabaña. Quiero confirmar si cuentan con estudio acústico.",
        timestamp: "2025-10-27T16:10:00Z",
      },
      {
        id: "m2",
        sender: "host",
        content:
          "Hola Lucía, sí contamos con un espacio adaptado. ¿Planeas sesiones nocturnas?",
        timestamp: "2025-10-27T16:13:00Z",
      },
      {
        id: "m3",
        sender: "guest",
        content:
          "Un par de sesiones nocturnas. También quisiera confirmar si aceptan mascotas pequeñas.",
        timestamp: "2025-10-27T16:15:00Z",
      },
    ],
  },
];

const HOST_CHAT_STORAGE_KEY = "smart-host-chats";

const readStoredHostChats = (): Conversation[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HOST_CHAT_STORAGE_KEY);
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

export default function HostMessagesPage() {
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadChats = () => {
      setLocalChats(readStoredHostChats());
    };
    loadChats();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === HOST_CHAT_STORAGE_KEY) {
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
        window.localStorage.setItem(HOST_CHAT_STORAGE_KEY, JSON.stringify(next));
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

    if (!activeConversationId) {
      setActiveConversationId(allConversations[0].id);
      return;
    }

    if (!allConversations.some((conversation) => conversation.id === activeConversationId)) {
      setActiveConversationId(allConversations[0].id);
    }
  }, [activeConversationId, allConversations]);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allConversations;
    return allConversations.filter(
      (conversation) =>
        conversation.guestName.toLowerCase().includes(term) ||
        conversation.propertyName.toLowerCase().includes(term) ||
        conversation.requestId.toLowerCase().includes(term),
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
      id: `host-${Date.now()}`,
      sender: "host",
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-light-50 px-3 py-1 text-xs font-semibold text-blue-light-700">
            <Sparkles className="h-4 w-4" />
            Chat habilitado solo para huéspedes interesados
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Conversaciones sobre reservas
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Gestiona las dudas de huéspedes interesados antes de confirmar su
            reserva. Cada chat se activa automáticamente cuando reciben tu
            espacio y manifiestan su interés en reservar.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar huésped o solicitud"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500">
                Solo aparecen huéspedes que han expresado interés en reservar
                uno de tus espacios.
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
                        <p className="text-sm font-semibold text-gray-900">
                          {conversation.guestName}
                        </p>
                        <p className="text-xs text-gray-500">{conversation.requestId}</p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          conversation.status === "pending"
                            ? "text-yellow-700"
                            : "text-emerald-600"
                        }`}
                      >
                        {conversation.status === "pending" ? "Pendiente" : "Aceptada"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {conversation.intentSummary}
                    </p>
                    {lastMessage && (
                      <p className="text-xs text-gray-400 truncate">
                        {lastMessage.sender === "host" ? "Tú:" : "Huésped:"} {lastMessage.content}
                      </p>
                    )}
                  </button>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">
                  No hay coincidencias.
                </div>
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
            {activeConversation ? (
              <>
                <div className="border-b border-gray-100 p-5 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Huésped interesado</p>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {activeConversation.guestName}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="rounded-full bg-blue-light-50 px-3 py-1 font-semibold text-blue-light-700">
                        {activeConversation.interestChannel}
                      </span>
                      <span className="rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-600">
                        {activeConversation.roomId}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {formatDate(activeConversation.checkIn)} –{" "}
                      {formatDate(activeConversation.checkOut)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {activeConversation.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      {activeConversation.guests}{" "}
                      {activeConversation.guests === 1 ? "huésped" : "huéspedes"}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 bg-blue-light-50/60 border border-blue-light-100 rounded-xl p-3">
                    {activeConversation.intentSummary}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {activeMessages.map((message) => {
                    const isHost = message.sender === "host";
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isHost ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            isHost
                              ? "bg-blue-light-500 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          <p>{message.content}</p>
                          <span
                            className={`mt-2 block text-xs ${
                              isHost ? "text-blue-light-100" : "text-gray-500"
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
                      placeholder="Escribe una respuesta para avanzar con la reserva..."
                      className="w-full resize-none rounded-2xl border-0 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />
                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Responde rápido para aumentar la probabilidad de
                        confirmación.
                      </div>
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
                    Selecciona una conversación
                  </h3>
                  <p className="text-sm text-gray-600">
                    Aquí aparecerán los huéspedes interesados en tus espacios. El
                    chat se habilita automáticamente cuando envían una solicitud
                    de reserva.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
