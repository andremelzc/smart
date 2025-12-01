import { useRouter } from "next/navigation";
import { useState } from "react";

interface StartConversationParams {
  propertyId: number;
  initialMessage?: string;
  bookingId?: number;
}

interface StartConversationResult {
  conversationId: number;
  isNew: boolean;
  error?: string;
}

export function useStartConversation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startConversation = async (
    params: StartConversationParams
  ): Promise<StartConversationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start conversation");
      }

      const data = await response.json();
      return {
        conversationId: data.conversationId,
        isNew: data.isNew,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const startConversationAndNavigate = async (
    params: StartConversationParams
  ) => {
    const result = await startConversation(params);
    if (result) {
      router.push(`/account/messages?conversationId=${result.conversationId}`);
    }
  };

  return {
    startConversation,
    startConversationAndNavigate,
    isLoading,
    error,
  };
}
