import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

export const useProctoring = (candidateId, assessmentId) => {
  const videoRef = useRef(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [violation, setViolation] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Models should be placed in the public/models directory
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error('Error loading face-api models', err);
      }
    };
    loadModels();
  }, []);

  const socket = useSocket();

  const reportViolation = async (type, imageBase64 = null) => {
    setViolation(type);
    try {
      await axios.post('http://localhost:5000/api/violations', {
        candidateId,
        assessmentId,
        violationType: type,
        proofImageUrl: imageBase64
      });

      if (socket) {
        socket.emit('violation_detected', {
          candidateId,
          assessmentId,
          violationType: type
        });
      }
    } catch (err) {
      console.error('Failed to report violation', err);
    }
  };

  useEffect(() => {
    if (!isModelsLoaded || !videoRef.current) return;

    let interval;
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        
        interval = setInterval(async () => {
          if (videoRef.current) {
            const detections = await faceapi.detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            );

            if (detections.length === 0) {
              reportViolation('NoFace');
            } else if (detections.length > 1) {
              reportViolation('MultipleFaces');
            }
          }
        }, 5000);
      } catch (err) {
        console.error('Webcam access denied', err);
      }
    };

    startWebcam();

    return () => {
      if (interval) clearInterval(interval);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isModelsLoaded, candidateId, assessmentId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('TabSwitch');
      }
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      reportViolation('CopyPaste');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [candidateId, assessmentId]);

  return { videoRef, isModelsLoaded, violation };
};
