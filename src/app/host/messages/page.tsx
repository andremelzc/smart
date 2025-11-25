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
import { useRouter, useSearchParams } from "next/navigation";

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
  status: "pending" | "accepted" | "confirmed"; // Unificamos estados
  messages: ChatMessage[];
  
  // Campos específicos del Host (que tu código usa)
  guestName?: string;
  intentSummary?: string;
  interestChannel?: string;
  requestId?: string; // Mapearemos reservationId aquí si falta
  roomId?: string;

  // Campos específicos del Guest (que podrían venir del storage)
  reservationId?: string;
  hostName?: string;
  autoCreatedAt?: string;
};

// Usamos la MISMA clave que el lado del huésped para que compartan mensajes
const SHARED_STORAGE_KEY = "smart-guest-chats";

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
    ],
  },
];

// Función para leer y ADAPTAR los chats que vienen del lado del Guest
const readStoredChats = (): Conversation[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHARED_STORAGE_KEY);
    
    // Si no hay nada, inicializamos con los mocks del Host
    if (!raw) {
       window.localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(conversationsMock));
       return conversationsMock;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Adaptador: Asegura que los chats creados por el Guest tengan los campos que espera el Host
    return parsed.map((chat: Conversation) => ({
      ...chat,
      // Si falta guestName (el guest no sabe su propio nombre a veces en el objeto), ponemos fallback
      guestName: chat.guestName || "Huésped (Usuario)",
      // Mapeamos reservationId a requestId si este último falta
      requestId: chat.requestId || chat.reservationId || "SOL-GENERIC",
      // Generamos un resumen por defecto si falta
      intentSummary: chat.intentSummary || `Solicitud de reserva para ${chat.guests} personas`,
      interestChannel: chat.interestChannel || "Reserva Directa",
      roomId: chat.roomId || "GENERAL"
    }));

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
    } catch { return ""; }
};

const formatDate = (iso: string) => {
    try {
        return new Date(iso).toLocaleDateString("es-PE", {
            month: "short",
            day: "numeric",
        });
    } catch { return ""; }
};

export default function HostMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialReservationId = searchParams.get("reservationId");

  const [searchTerm, setSearchTerm] = useState("");
  const [localChats, setLocalChats] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");

  // Cargar chats al inicio
  useEffect(() => {
    const chats = readStoredChats();
    setLocalChats(chats);

    // Si hay un ID en la URL, seleccionarlo
    if (initialReservationId) {
       // Buscamos por requestId o reservationId o id del chat
       const target = chats.find(c => c.reservationId === initialReservationId || c.id === initialReservationId || c.requestId === initialReservationId);
       if (target) {
           setActiveConversationId(target.id);
       }
    }
  }, [initialReservationId]);

  // Escuchar cambios en localStorage (para ver mensajes del Guest en tiempo real)
  useEffect(() => {
      const handleStorage = (e: StorageEvent) => {
          if (e.key === SHARED_STORAGE_KEY) {
              setLocalChats(readStoredChats());
          }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistLocalChats = useCallback((newChats: Conversation[]) => {
    setLocalChats(newChats);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(newChats));
    }
  }, []);

  // Filtrado
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

    const updatedChats = localChats.map(c => {
        if (c.id === activeConversation.id) {
            return { ...c, messages: [...c.messages, newMessage] };
        }
        return c;
    });

    persistLocalChats(updatedChats);
    setMessageDraft("");
  };

  // Scroll al fondo al cambiar de chat o recibir mensaje
  const messagesEndRef = useCallback((node: HTMLDivElement) => {
      if (node) {
          node.scrollIntoView({ behavior: 'smooth' });
      }
  }, [activeConversation?.messages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
      
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-light-50 px-3 py-1 text-xs font-semibold text-blue-light-700 mb-2">
            <Sparkles className="h-4 w-4" />
            Chat habilitado
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
        <p className="text-gray-600 text-sm">
            Gestiona la comunicación directa con tus huéspedes interesados.
        </p>
      </div>

      <div className="flex-1 grid gap-6 lg:grid-cols-[320px_1fr] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        
        {/* Sidebar - Lista de Chats */}
        <aside className="flex flex-col border-r border-gray-100 bg-white">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar anfitrión o reserva"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 px-1">
              Solo verás las conversaciones de reservas activas.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const lastMessage = conversation.messages[conversation.messages.length - 1];

              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`w-full text-left p-4 transition-all hover:bg-gray-50 ${
                    isActive ? "bg-blue-50/60 border-l-4 border-blue-500" : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-gray-900 truncate max-w-[160px]">
                      {conversation.guestName}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        conversation.status === 'pending' ? 'bg-blue-100 text-blue-700' : 
                        conversation.status === 'accepted' || conversation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                        {conversation.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2 truncate">{conversation.propertyName}</p>
                  <p className="text-xs text-gray-400 mb-1 font-mono">{conversation.requestId}</p>

                  <p className="text-xs text-gray-600 truncate mt-2 flex items-center gap-1">
                     {lastMessage ? (
                        <>
                            <span className="font-medium text-gray-800">{lastMessage.sender === 'host' ? 'Tú: ' : ''}</span>
                            {lastMessage.content}
                        </>
                     ) : <span className="italic text-gray-400">Sin mensajes</span>}
                  </p>
                </button>
              );
            })}
             {filteredConversations.length === 0 && (
                 <div className="p-8 text-center text-gray-400 text-sm">No se encontraron chats</div>
             )}
          </div>
        </aside>

        {/* Área de Chat */}
        <section className="flex flex-col bg-gray-50/30 h-full overflow-hidden">
          {activeConversation ? (
            <>
              {/* Header Chat */}
              <div className="bg-white border-b border-gray-100 p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Chat generado automáticamente</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{activeConversation.guestName}</h2>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400"/>
                            <span>{formatDate(activeConversation.checkIn)} - {formatDate(activeConversation.checkOut)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400"/>
                            <span>{activeConversation.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-gray-400"/>
                            <span>{activeConversation.guests} huéspedes</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Creado el {formatDate(activeConversation.messages[0]?.timestamp || new Date().toISOString())}, justo después de enviar tu solicitud.
                    </p>
                </div>
                
                <div className="flex flex-col items-end justify-start">
                   <Button variant="text" className="text-blue-600 hover:text-blue-700 text-sm font-medium px-0">
                        Ver reserva
                   </Button>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {activeConversation.messages.map((msg) => {
                  const isHost = msg.sender === "host";
                  return (
                    <div key={msg.id} className={`flex w-full ${isHost ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                            isHost 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}>
                            <p>{msg.content}</p>
                            <p className={`text-[10px] mt-2 text-right ${isHost ? 'text-blue-200' : 'text-gray-400'}`}>
                                {formatTime(msg.timestamp)}
                            </p>
                        </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                 <div className="mb-3 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">Comparte detalles con el anfitrión para acelerar la confirmación...</p>
                        <p className="text-xs font-medium text-blue-600">Consejo: responde rápido para mantener tu lugar.</p>
                    </div>
                 </div>

                 <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    <textarea
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl py-3 px-4 text-sm resize-none min-h-[48px] max-h-[120px]"
                        rows={1}
                    />
                    <Button 
                        type="submit"
                        disabled={!messageDraft.trim()}
                        className="rounded-xl w-12 h-12 flex items-center justify-center p-0 bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                 </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/30">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No hay chat seleccionado</h3>
              <p className="text-gray-500 max-w-xs mt-1">Selecciona una conversación de la lista para ver los detalles y responder.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}