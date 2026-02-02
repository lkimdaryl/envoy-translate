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
  continuous = true,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const processedIndicesRef = useRef<Set<number>>(new Set());
  
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

  // Initialize recognition once
  useEffect(() => {
    if (!isSupported) {
      console.log("Speech recognition not supported");
      return;
    }

    console.log("Initializing speech recognition...");
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started");
    };

    recognitionRef.current.onresult = (event: any) => {
      console.log("Speech recognition result:", event.results);
      let newFinalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Only process results we haven't seen yet
          if (!processedIndicesRef.current.has(i)) {
            newFinalTranscript += result[0].transcript;
            processedIndicesRef.current.add(i);
          }
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Show interim transcript for live feedback
      const displayTranscript = interimTranscript || newFinalTranscript;
      console.log("Transcript:", { newFinal: newFinalTranscript, interim: interimTranscript, display: displayTranscript });
      setTranscript(displayTranscript);
      
      // Only send NEW final transcript to callback
      if (newFinalTranscript && onResultRef.current) {
        console.log("Calling onResult with:", newFinalTranscript);
        onResultRef.current(newFinalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (onErrorRef.current) {
        const errorMessages: Record<string, string> = {
          "not-allowed": "Microphone access denied. Please allow microphone permissions.",
          "no-speech": "No speech detected. Please try again.",
          "network": "Network error. Please check your connection.",
          "aborted": "Speech recognition was aborted.",
        };
        onErrorRef.current(errorMessages[event.error] || `Error: ${event.error}`);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported, continuous, language]); // Added language back to reinitialize with correct lang

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const startListening = useCallback(() => {
    console.log("startListening called, recognitionRef:", !!recognitionRef.current, "isListening:", isListening);
    if (!recognitionRef.current || isListening) return;
    
    // Reset tracking for new session
    processedIndicesRef.current.clear();
    setTranscript("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
      console.log("Recognition started successfully");
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    
    recognitionRef.current.stop();
    setIsListening(false);
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
  };
}
