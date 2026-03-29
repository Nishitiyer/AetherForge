import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * AetherForge: Robust Hand-Tracking Hook (v3)
 * 
 * KEY FIX: This hook loads MediaPipe scripts dynamically and calls
 * navigator.mediaDevices.getUserMedia() directly to guarantee camera
 * permission is requested regardless of the video element's DOM state.
 * 
 * IMPORTANT: The videoRef must always be mounted in the DOM (even when hidden)
 * so the camera stream has a target. See Editor.jsx for the hidden video element.
 */
export function useHands() {
  const [landmarks, setLandmarks] = useState(null);
  const [gesture, setGesture] = useState('NONE');
  const [confidence, setConfidence] = useState(0);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt'|'granted'|'denied'
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);

  const classifyGesture = useCallback((hand) => {
    const thumbTip   = hand[4];
    const indexTip   = hand[8];
    const middleTip  = hand[12];
    const ringTip    = hand[16];
    const pinkyTip   = hand[20];
    const indexMid   = hand[6];
    const middleMid  = hand[10];

    const distTI = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    );

    if (distTI < 0.05) return 'PINCH_GRAB';
    if (indexTip.y < indexMid.y && middleTip.y > middleMid.y) return 'POINTING_UP';
    if (indexTip.y < indexMid.y && middleTip.y < middleMid.y) return 'OPEN_HAND';
    if (indexTip.y > indexMid.y && middleTip.y > middleMid.y) return 'CLOSED_FIST';
    return 'IDLE';
  }, []);

  // Step 1: Request camera permission explicitly via getUserMedia
  const requestCamera = useCallback(async () => {
    try {
      setPermissionState('prompt');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;

      // Attach stream to the always-mounted video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermissionState('granted');
      setIsReady(true);
    } catch (err) {
      console.error('[AetherForge] Camera access denied:', err);
      setPermissionState('denied');
      setIsReady(false);
    }
  }, []);

  // Step 2: Once camera is ready, initialise MediaPipe hands
  useEffect(() => {
    if (!isReady) return;

    let animId;

    const initMediaPipe = async () => {
      // Dynamically import to avoid SSR issues
      const { Hands } = await import('@mediapipe/hands');
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });
      hands.onResults((results) => {
        if (results.multiHandLandmarks?.length > 0) {
          const hand = results.multiHandLandmarks[0];
          setLandmarks(results.multiHandLandmarks);
          setConfidence(0.9);
          setGesture(classifyGesture(hand));
        } else {
          setLandmarks(null);
          setGesture('NONE');
          setConfidence(0);
        }
      });
      handsRef.current = hands;

      // Frame-by-frame detection loop
      const detect = async () => {
        if (videoRef.current && !videoRef.current.paused) {
          await hands.send({ image: videoRef.current });
        }
        animId = requestAnimationFrame(detect);
      };
      detect();
    };

    initMediaPipe();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (handsRef.current) handsRef.current.close();
    };
  }, [isReady, classifyGesture]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return { videoRef, landmarks, gesture, confidence, permissionState, requestCamera };
}
