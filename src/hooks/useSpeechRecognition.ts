import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
}

export function useSpeechRecognition({
  language = "en-US",
  continuous = false, // Changed to false to prevent duplicate results
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false); // Ref to prevent double-starts
  const lastResultIndexRef = useRef(-1); // Track last processed result index
  
  // Use refs for callbacks to avoid recreating recognition instance
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  
  // Keep refs updated
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Initialize recognition once (without language in deps to avoid re-init)
  useEffect(() => {
    if (!isSupported) {
      console.log("Speech recognition not supported");
      return;
    }

    console.log("Initializing speech recognition...");
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = false; // Only get final results to prevent duplicates
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started");
      isListeningRef.current = true;
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      console.log("Speech recognition result:", event.results);
      
      // Only process new results (results we haven't seen yet)
      for (let i = lastResultIndexRef.current + 1; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript.trim();
          console.log("Final result at index", i, ":", finalText);
          
          if (finalText && onResultRef.current) {
            onResultRef.current(finalText);
          }
          
          setTranscript(prev => prev + (prev ? " " : "") + finalText);
          lastResultIndexRef.current = i;
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      isListeningRef.current = false;
      setIsListening(false);
      
      // Don't show error for no-speech as it's common
      if (event.error !== "no-speech" && onErrorRef.current) {
        const errorMessages: Record<string, string> = {
          "not-allowed": "Microphone access denied. Please allow microphone permissions.",
          "network": "Network error. Please check your connection.",
          "aborted": "Speech recognition was aborted.",
        };
        onErrorRef.current(errorMessages[event.error] || `Error: ${event.error}`);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      isListeningRef.current = false;
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        isListeningRef.current = false;
      }
    };
  }, [isSupported, continuous]);

  // Update language when it changes (without reinitializing)
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const startListening = useCallback(() => {
    console.log("startListening called, recognitionRef:", !!recognitionRef.current, "isListeningRef:", isListeningRef.current);
    
    // Use ref to prevent double-starts (more reliable than state)
    if (!recognitionRef.current || isListeningRef.current) {
      console.log("Skipping start - already listening or no recognition");
      return;
    }
    
    // Reset tracking for new session
    lastResultIndexRef.current = -1;
    setTranscript("");
    
    try {
      recognitionRef.current.start();
      console.log("Recognition started successfully");
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return;
    
    recognitionRef.current.stop();
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
  };
}
