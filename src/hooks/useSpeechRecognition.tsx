
import { useState, useEffect, useRef } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
}

export const useSpeechRecognition = ({
  onResult,
  onEnd,
  continuous = true,
  interimResults = true,
}: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    // Initialize recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = 'en-US';

    // Setup event handlers
    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      onResult?.(currentTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setError(event.error);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        // Restart if we still want to listen
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      } else {
        onEnd?.();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, isListening, onEnd, onResult]);

  const startListening = () => {
    setError(null);
    setTranscript('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition', error);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
};
