
import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioRecorderOptions {
  onDataAvailable?: (data: Blob) => void;
  onComplete?: (recording: Blob) => void;
  mimeType?: string;
  timeSlice?: number;
}

export const useAudioRecorder = (options: AudioRecorderOptions = {}) => {
  const {
    onDataAvailable,
    onComplete,
    timeSlice = 1000,
  } = options;
  
  // Use a supported mime type that works across browsers
  const mimeType = 'audio/webm';

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

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

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Reset state for new recording
      audioChunks.current = [];
      setAudioBlob(null);
      setError(null);
      setRecordingTime(0);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;

      // Check if mime type is supported, fallback if not
      const isMimeTypeSupported = checkMimeTypeSupport();
      const recorderOptions = isMimeTypeSupported ? { mimeType } : {};
      
      console.log(`Using mime type: ${isMimeTypeSupported ? mimeType : 'browser default'}`);

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
          console.log(`Received audio chunk: ${event.data.size} bytes`);
        } else {
          console.warn('Empty audio data received');
        }
      };

      // Handle recording stop event
      recorder.onstop = () => {
        console.log(`Recording stopped. Total chunks: ${audioChunks.current.length}`);
        
        // Ensure we have data before creating a blob
        if (audioChunks.current.length > 0) {
          // Create blob with explicit mime type to ensure compatibility
          const recording = new Blob(audioChunks.current, { type: mimeType });
          console.log(`Recording completed: ${recording.size} bytes, type: ${recording.type}`);
          setAudioBlob(recording);
          if (onComplete) {
            onComplete(recording);
          }
        } else {
          console.error("No audio data recorded");
          setError(new Error("No audio data recorded"));
        }

        // Stop the media stream
        if (mediaStream.current) {
          mediaStream.current.getTracks().forEach((track) => track.stop());
        }

        // Clear the timer
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
      };

      // Start recording immediately with chunks delivered every timeSlice ms
      recorder.start(timeSlice);
      setIsRecording(true);
      console.log('Recording started');

      // Start the timer
      timerInterval.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error starting recording:', errorMessage);
      setError(err instanceof Error ? err : new Error('Failed to start recording'));
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError(new Error('Microphone access denied. Please allow microphone access and try again.'));
      }
    }
  }, [mimeType, onDataAvailable, onComplete, timeSlice, checkMimeTypeSupport]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
      console.log('Stopping recording...');
      mediaRecorder.current.stop();
      setIsRecording(false);
    } else {
      console.warn('Attempted to stop recording, but no active recorder found');
    }
  }, []);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      console.log('Recording paused');
    }
  }, [isRecording]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      console.log('Recording resumed');
    }
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
        mediaRecorder.current.stop();
      }
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return {
    isRecording,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
};
