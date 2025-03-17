
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface AudioRecorderOptions {
  onDataAvailable?: (data: Blob) => void;
  onComplete?: (recording: Blob) => void;
  mimeType?: string;
  timeSlice?: number;
  debug?: boolean;
}

export const useAudioRecorder = (options: AudioRecorderOptions = {}) => {
  const {
    onDataAvailable,
    onComplete,
    timeSlice = 1000,
    debug = true, // Enable debug mode by default
  } = options;
  
  // Use a supported mime type that works across browsers
  const mimeType = 'audio/webm';

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Check browser compatibility at initialization
  useEffect(() => {
    const checkBrowserCompatibility = () => {
      const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined';
      const isUserMediaSupported = navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
      
      if (!isMediaRecorderSupported || !isUserMediaSupported) {
        const errorMsg = !isMediaRecorderSupported 
          ? 'MediaRecorder API is not supported in this browser.' 
          : 'Media devices API is not supported in this browser.';
        
        console.error(errorMsg);
        setError(new Error(errorMsg));
        return false;
      }
      
      return true;
    };
    
    const isCompatible = checkBrowserCompatibility();
    if (debug && isCompatible) {
      console.log('Browser supports required audio recording APIs');
    }
  }, [debug]);

  // Check if the browser supports the specified mime type
  const checkMimeTypeSupport = useCallback(() => {
    if (typeof MediaRecorder === 'undefined') {
      return false;
    }
    
    try {
      return MediaRecorder.isTypeSupported(mimeType);
    } catch (e) {
      return false;
    }
  }, [mimeType]);

  // Request microphone access separately to handle permissions explicitly
  const requestMicrophoneAccess = useCallback(async (): Promise<MediaStream | null> => {
    try {
      if (debug) console.log('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      if (debug) console.log('Microphone access granted');
      setMicrophoneAccess(true);
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error accessing microphone:', errorMessage);
      
      let userFriendlyMessage = 'Failed to access your microphone.';
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        userFriendlyMessage = 'Microphone access denied. Please allow microphone access in your browser settings and try again.';
      } else if (errorMessage.includes('NotFoundError')) {
        userFriendlyMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (errorMessage.includes('NotReadableError')) {
        userFriendlyMessage = 'Your microphone is busy or not functioning properly. Please check your device.';
      }
      
      setError(new Error(userFriendlyMessage));
      setMicrophoneAccess(false);
      toast.error(userFriendlyMessage);
      return null;
    }
  }, [debug]);

  // Start recording
  const startRecording = useCallback(async () => {
    // If already recording, stop first
    if (isRecording) {
      if (debug) console.log('Already recording, stopping first');
      await stopRecording();
    }
    
    try {
      // Reset state for new recording
      audioChunks.current = [];
      setAudioBlob(null);
      setError(null);
      setRecordingTime(0);

      // Request microphone access
      const stream = await requestMicrophoneAccess();
      if (!stream) {
        throw new Error('Failed to access microphone');
      }
      
      mediaStream.current = stream;

      // Check if mime type is supported, fallback if not
      const isMimeTypeSupported = checkMimeTypeSupport();
      const recorderOptions = isMimeTypeSupported ? { mimeType } : {};
      
      if (debug) console.log(`Using mime type: ${isMimeTypeSupported ? mimeType : 'browser default'}`);

      // Create a new MediaRecorder instance
      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorder.current = recorder;

      // Add chunks as they become available
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
          if (onDataAvailable) {
            onDataAvailable(event.data);
          }
          if (debug) console.log(`Received audio chunk: ${event.data.size} bytes`);
        } else {
          console.warn('Empty audio data received');
        }
      };

      // Handle recording stop event
      recorder.onstop = () => {
        if (debug) console.log(`Recording stopped. Total chunks: ${audioChunks.current.length}`);
        
        // Ensure we have data before creating a blob
        if (audioChunks.current.length > 0) {
          // Create blob with explicit mime type to ensure compatibility
          const recording = new Blob(audioChunks.current, { type: mimeType });
          if (debug) console.log(`Recording completed: ${recording.size} bytes, type: ${recording.type}`);
          setAudioBlob(recording);
          if (onComplete) {
            onComplete(recording);
          }
        } else {
          console.error("No audio data recorded");
          setError(new Error("No audio data recorded. Please check your microphone settings and try again."));
          toast.error("No audio data was recorded. Please check your microphone.");
        }

        // Stop the media stream
        stopMediaTracks();

        // Clear the timer
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
      };

      // Log state changes
      recorder.onstart = () => {
        if (debug) console.log('MediaRecorder started');
      };
      
      recorder.onpause = () => {
        if (debug) console.log('MediaRecorder paused');
      };
      
      recorder.onresume = () => {
        if (debug) console.log('MediaRecorder resumed');
      };
      
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError(new Error('Recording error occurred'));
        toast.error("An error occurred during recording.");
      };

      // Start recording immediately with chunks delivered every timeSlice ms
      recorder.start(timeSlice);
      setIsRecording(true);
      if (debug) console.log('Recording started');

      // Start the timer
      timerInterval.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error starting recording:', errorMessage);
      setError(err instanceof Error ? err : new Error('Failed to start recording'));
      
      if (mediaStream.current) {
        stopMediaTracks();
      }
      
      toast.error(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [mimeType, onDataAvailable, onComplete, timeSlice, checkMimeTypeSupport, requestMicrophoneAccess, debug, isRecording]);

  // Helper function to stop media tracks
  const stopMediaTracks = useCallback(() => {
    if (mediaStream.current) {
      if (debug) console.log('Stopping media tracks');
      mediaStream.current.getTracks().forEach((track) => {
        track.stop();
        if (debug) console.log(`Stopped ${track.kind} track`);
      });
      mediaStream.current = null;
    }
  }, [debug]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
      if (debug) console.log('Stopping recording...');
      mediaRecorder.current.stop();
      setIsRecording(false);
    } else {
      console.warn('Attempted to stop recording, but no active recorder found. Current state:', 
                  mediaRecorder.current ? mediaRecorder.current.state : 'no recorder');
    }
  }, [debug]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      if (debug) console.log('Recording paused');
    }
  }, [isRecording, debug]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      if (debug) console.log('Recording resumed');
    }
  }, [isRecording, debug]);

  // Check microphone status
  const checkMicrophoneStatus = useCallback(async () => {
    if (debug) console.log('Checking microphone status...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTracks = stream.getAudioTracks();
      
      if (audioTracks.length === 0) {
        setError(new Error('No audio tracks found. Please check your microphone.'));
        setMicrophoneAccess(false);
        return false;
      }
      
      // Check if any track is actually receiving data
      const trackSettings = audioTracks[0].getSettings();
      if (debug) console.log('Microphone settings:', trackSettings);
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      setMicrophoneAccess(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Microphone check error:', errorMessage);
      setError(new Error('Failed to access microphone: ' + errorMessage));
      setMicrophoneAccess(false);
      return false;
    }
  }, [debug]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debug) console.log('Cleaning up audio recorder');
      
      if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
        mediaRecorder.current.stop();
      }
      
      stopMediaTracks();
      
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [stopMediaTracks, debug]);

  return {
    isRecording,
    recordingTime,
    audioBlob,
    error,
    microphoneAccess,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    checkMicrophoneStatus
  };
};
