import { useRef, useEffect } from "react";
import { Copy, Volume2, Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

// Language code mapping from ISO 639-1 to BCP 47 for speech recognition
const getRecognitionLanguage = (langCode: string): string => {
  const mapping: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU",
    ja: "ja-JP",
    ko: "ko-KR",
    zh: "zh-CN",
    ar: "ar-SA",
    hi: "hi-IN",
    nl: "nl-NL",
    pl: "pl-PL",
    tr: "tr-TR",
  };
  return mapping[langCode] || `${langCode}-${langCode.toUpperCase()}`;
};

interface TranslatorPanelProps {
  type: "input" | "output";
  language: string;
  value: string;
  onChange?: (value: string) => void;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export function TranslatorPanel({
  type,
  language,
  value,
  onChange,
  isLoading = false,
  autoFocus = false,
}: TranslatorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInput = type === "input";
  const isOutput = type === "output";

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    language: getRecognitionLanguage(language),
    continuous: true,
    onResult: (transcript) => {
      if (onChange && isInput) {
        onChange(value + (value ? " " : "") + transcript);
      }
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleCopy = async () => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSpeak = () => {
    if (!value.trim()) return;
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported in this browser");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = language;
    utterance.rate = 0.9;

    utterance.onerror = () => {
      toast.error("Failed to speak text");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative min-h-[150px] md:min-h-[180px]">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={isOutput}
          placeholder={isOutput ? "Translation will appear here..." : "Enter text or use microphone..."}
          className={cn(
            "h-full min-h-[150px] md:min-h-[180px] resize-none text-base leading-relaxed",
            isInput && isSupported && "pr-14"
          )}
          aria-label={isOutput ? "Translated text" : "Text to translate"}
        />
        
        {/* Mic button overlaid inside input textarea */}
        {isInput && isSupported && (
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={handleMicClick}
            aria-label={isListening ? "Stop recording" : "Start voice input"}
            className={cn(
              "absolute bottom-3 right-3 h-10 w-10 transition-all",
              isListening && "animate-pulse"
            )}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {isLoading && isOutput && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Output panel buttons */}
      {isOutput && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!value.trim()}
            aria-label="Copy translation"
            className="h-10 w-10"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSpeak}
            disabled={!value.trim()}
            aria-label="Listen to translation"
            className="h-10 w-10"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
