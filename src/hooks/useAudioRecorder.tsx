
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAudioRecorderProps {
  onComplete?: (blob: Blob) => void;
  debug?: boolean;
  silenceDetectionEnabled?: boolean;
  silenceThreshold?: number; // 0-100, default 15
  silenceTimeout?: number; // in ms, default 2500
}

export const useAudioRecorder = ({ 
  onComplete, 
  debug = false,
  silenceDetectionEnabled = true,
  silenceThreshold = 15,
  silenceTimeout = 2500
}: UseAudioRecorderProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const silenceStartTimeRef = useRef<number | null>(null);

  // Check microphone status
  const checkMicrophoneStatus = useCallback(async (): Promise<boolean> => {
    try {
      if (debug) console.log('Checking microphone status...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      // Log microphone settings for debugging
      if (debug) {
        const audioTrack = stream.getAudioTracks()[0];
        const settings = audioTrack.getSettings();
        console.log('Microphone settings:', settings);
      }
      
      // Get a sample audio chunk to verify the mic is working
      const testRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
      let testChunk: Blob | null = null;
      
      testRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          testChunk = e.data;
          if (debug) console.log('Received audio chunk:', e.data.size, 'bytes');
        }
      };
      
      testRecorder.start();
      await new Promise(resolve => setTimeout(resolve, 300));
      testRecorder.stop();
      
      await new Promise(resolve => {
        testRecorder.onstop = resolve;
        setTimeout(resolve, 500); // Fallback in case onstop doesn't fire
      });
      
      // Clean up the test stream
      stream.getTracks().forEach(track => track.stop());
      
      const hasAudio = testChunk !== null && testChunk.size > 0;
      setMicrophoneAccess(hasAudio);
      return hasAudio;
    } catch (err) {
      console.error('Error checking microphone:', err);
      setMicrophoneAccess(false);
      setError(err instanceof Error ? err : new Error('Unknown error checking microphone'));
      return false;
    }
  }, [debug]);

  // Init: check microphone on mount
  useEffect(() => {
    checkMicrophoneStatus();
    
    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [checkMicrophoneStatus]);

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        if (debug) console.log('Using MIME type:', type);
        return type;
      }
    }
    
    // Fallback
    return 'audio/webm';
  };

  // Setup voice activity detection
  const setupVoiceActivityDetection = (stream: MediaStream) => {
    if (!silenceDetectionEnabled) return;
    
    try {
      // Create audio context and analyzer
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Connect the stream to the analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Configure analyzer
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // Start monitoring for silence
      silenceTimerRef.current = window.setInterval(() => {
        if (!isRecording || !analyserRef.current || !dataArrayRef.current) return;
        
        // Get current audio levels
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate average volume level (0-255)
        const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / 
                        dataArrayRef.current.length;
        
        // Convert to percentage (0-100)
        const volumePercent = (average / 255) * 100;
        
        if (debug && recordingTime % 2 === 0) {
          console.log(`Current volume: ${Math.round(volumePercent)}%`);
        }
        
        // Check if volume is below threshold (silence)
        if (volumePercent < silenceThreshold) {
          if (silenceStartTimeRef.current === null) {
            silenceStartTimeRef.current = Date.now();
            if (debug) console.log('Silence detected, starting silence timer');
          } else {
            const silenceDuration = Date.now() - silenceStartTimeRef.current;
            
            // If silence persists for the timeout period, stop recording
            if (silenceDuration >= silenceTimeout && recordingTime > 2) {
              if (debug) console.log(`Silence detected for ${silenceDuration}ms, auto-stopping recording`);
              stopRecording();
            }
          }
        } else {
          // Reset silence timer if volume goes above threshold
          if (silenceStartTimeRef.current !== null) {
            if (debug) console.log('Voice activity detected, resetting silence timer');
            silenceStartTimeRef.current = null;
          }
        }
      }, 200);
    } catch (err) {
      console.error('Error setting up voice activity detection:', err);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      setAudioBlob(null);
      setError(null);
      silenceStartTimeRef.current = null;
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media Devices API not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      setMicrophoneAccess(true);
      
      // Setup voice activity detection
      if (silenceDetectionEnabled) {
        setupVoiceActivityDetection(stream);
      }
      
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          if (debug) console.log(`Recording chunk received: ${e.data.size} bytes`);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (debug) console.log('Recording stopped, processing audio...');
        const totalChunks = audioChunksRef.current.length;
        
        if (totalChunks === 0) {
          console.error('No audio chunks collected during recording');
          setError(new Error('No audio was captured. Please check your microphone.'));
          toast.error('No audio was captured. Please check your microphone.');
          setIsRecording(false);
          return;
        }
        
        // Create combined blob from all chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        if (debug) {
          console.log(`Recording complete: ${audioBlob.size} bytes, ${totalChunks} chunks`);
          console.log(`Audio MIME type: ${audioBlob.type}`);
        }
        
        if (audioBlob.size < 100) {
          console.warn('Audio blob is suspiciously small:', audioBlob.size, 'bytes');
        }
        
        setAudioBlob(audioBlob);
        setIsRecording(false);
        
        // Cleanup silence detection
        if (silenceTimerRef.current) {
          clearInterval(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        if (onComplete) {
          onComplete(audioBlob);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError(new Error('Recording error occurred'));
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data in chunks of 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start a timer to track recording duration
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      if (debug) console.log('Recording started successfully');
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err : new Error('Unknown error starting recording'));
      setMicrophoneAccess(false);
      setIsRecording(false);
      toast.error('Failed to access microphone. Please check your browser permissions.');
    }
  }, [debug, onComplete, silenceDetectionEnabled]);

  const stopRecording = useCallback(() => {
    if (debug) console.log('Stopping recording...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        // Note: onstop handler will handle the blob creation and callback
      } catch (err) {
        console.error('Error stopping recording:', err);
        setError(err instanceof Error ? err : new Error('Error stopping recording'));
      }
    } else {
      if (debug) console.log('No active recorder to stop');
    }
    
    // Always clean up the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
    }
    
    silenceStartTimeRef.current = null;
  }, [isRecording, debug]);

  return {
    isRecording,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    checkMicrophoneStatus,
    microphoneAccess
  };
};
