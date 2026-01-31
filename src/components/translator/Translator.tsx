import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, ArrowUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Header } from "./Header";
import { TranslatorPanel } from "./TranslatorPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { useDebounce } from "@/hooks/useDebounce";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const STORAGE_KEYS = {
  FROM_LANG: "translator_from_lang",
  TO_LANG: "translator_to_lang",
  AUTO_TRANSLATE: "translator_auto_translate",
};

export function Translator() {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const { translatedText, isLoading, error, translate } = useTranslation();

  // Load saved preferences
  const [fromLang, setFromLang] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.FROM_LANG) || "en"
  );
  const [toLang, setToLang] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.TO_LANG) || "es"
  );
  const [autoTranslate, setAutoTranslate] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.AUTO_TRANSLATE) !== "false"
  );

  const [inputText, setInputText] = useState("");
  const debouncedInput = useDebounce(inputText, 500);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FROM_LANG, fromLang);
  }, [fromLang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TO_LANG, toLang);
  }, [toLang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTO_TRANSLATE, String(autoTranslate));
  }, [autoTranslate]);

  // Auto-translate on debounced input change
  useEffect(() => {
    if (autoTranslate && debouncedInput.trim()) {
      translate(debouncedInput, fromLang, toLang);
    }
  }, [debouncedInput, fromLang, toLang, autoTranslate, translate]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSwapLanguages = useCallback(() => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(translatedText);
  }, [fromLang, toLang, translatedText]);

  const handleManualTranslate = useCallback(() => {
    if (inputText.trim()) {
      translate(inputText, fromLang, toLang);
    }
  }, [inputText, fromLang, toLang, translate]);

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Auto-translate toggle */}
        <div className="flex items-center gap-3 mb-6 justify-end">
          <Switch
            id="auto-translate"
            checked={autoTranslate}
            onCheckedChange={setAutoTranslate}
          />
          <Label htmlFor="auto-translate" className="text-sm cursor-pointer">
            Auto-translate
          </Label>
        </div>

        {/* Translation panels */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Input panel */}
          <TranslatorPanel
            type="input"
            language={fromLang}
            onLanguageChange={setFromLang}
            value={inputText}
            onChange={setInputText}
            autoFocus
          />

          {/* Swap button */}
          <div className="flex lg:flex-col items-center justify-center py-2 lg:py-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              aria-label="Swap languages"
              className="h-12 w-12 rounded-full border-2 hover:bg-accent transition-transform hover:scale-105"
            >
              {isMobile ? (
                <ArrowUpDown className="h-5 w-5" />
              ) : (
                <ArrowLeftRight className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Output panel */}
          <TranslatorPanel
            type="output"
            language={toLang}
            onLanguageChange={setToLang}
            value={translatedText}
            isLoading={isLoading}
          />
        </div>

        {/* Translate button */}
        <div className="mt-6">
          <Button
            onClick={handleManualTranslate}
            disabled={!inputText.trim() || isLoading}
            className="w-full lg:w-auto lg:min-w-[200px] lg:mx-auto lg:flex h-12 text-base font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Translating...
              </>
            ) : (
              "Translate"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
