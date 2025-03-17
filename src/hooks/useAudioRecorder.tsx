
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
    mimeType = 'audio/webm',
    timeSlice = 1000,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      audioChunks.current = [];
      setAudioBlob(null);
      setError(null);
      setRecordingTime(0);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;

      // Create a new MediaRecorder instance
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current = recorder;

      // Handle data available event
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          onDataAvailable?.(event.data);
        }
      };

      // Handle recording stop event
      recorder.onstop = () => {
        const recording = new Blob(audioChunks.current, { type: mimeType });
        setAudioBlob(recording);
        onComplete?.(recording);

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

      // Start recording
      recorder.start(timeSlice);
      setIsRecording(true);

      // Start the timer
      timerInterval.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start recording'));
      console.error('Error starting recording:', err);
    }
  }, [mimeType, onDataAvailable, onComplete, timeSlice]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
    }
  }, [isRecording]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
    }
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && isRecording) {
        mediaRecorder.current.stop();
      }
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isRecording]);

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
