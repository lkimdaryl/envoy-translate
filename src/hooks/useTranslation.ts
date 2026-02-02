import { useState, useRef, useCallback } from "react";

interface TranslationResult {
  translatedText: string;
  isLoading: boolean;
  error: string | null;
}

interface UseTranslationReturn extends TranslationResult {
  translate: (text: string, fromLang: string, toLang: string) => Promise<void>;
  cancelTranslation: () => void;
  clearTranslation: () => void;
}

export function useTranslation(): UseTranslationReturn {
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelTranslation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const clearTranslation = useCallback(() => {
    cancelTranslation();
    setTranslatedText("");
    setError(null);
  }, [cancelTranslation]);

  const translate = useCallback(
    async (text: string, fromLang: string, toLang: string) => {
      // Cancel any pending request
      cancelTranslation();

      if (!text.trim()) {
        setTranslatedText("");
        setError(null);
        return;
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const encodedText = encodeURIComponent(text);
        const langPair = `${fromLang}|${toLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Translation failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.responseStatus === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }

        if (data.responseStatus !== 200) {
          throw new Error(data.responseDetails || "Translation failed");
        }

        setTranslatedText(data.responseData.translatedText);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            // Request was cancelled, don't update state
            return;
          }
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cancelTranslation]
  );

  return {
    translatedText,
    isLoading,
    error,
    translate,
    cancelTranslation,
    clearTranslation,
  };
}
