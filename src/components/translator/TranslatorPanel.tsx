import { useRef, useEffect } from "react";
import { Copy, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSelector } from "./LanguageSelector";
import { toast } from "sonner";

interface TranslatorPanelProps {
  type: "input" | "output";
  language: string;
  onLanguageChange: (lang: string) => void;
  value: string;
  onChange?: (value: string) => void;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export function TranslatorPanel({
  type,
  language,
  onLanguageChange,
  value,
  onChange,
  isLoading = false,
  autoFocus = false,
}: TranslatorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = language;
    utterance.rate = 0.9;

    utterance.onerror = () => {
      toast.error("Failed to speak text");
    };

    window.speechSynthesis.speak(utterance);
  };

  const isOutput = type === "output";

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
        label={isOutput ? "Translate to" : "Translate from"}
      />
      <div className="relative flex-1 min-h-[150px] md:min-h-[200px]">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={isOutput}
          placeholder={isOutput ? "Translation will appear here..." : "Enter text to translate..."}
          className="h-full min-h-[150px] md:min-h-[200px] resize-none text-base leading-relaxed"
          aria-label={isOutput ? "Translated text" : "Text to translate"}
        />
        {isLoading && isOutput && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
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
