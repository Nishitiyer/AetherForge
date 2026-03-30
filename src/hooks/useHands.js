import { useState, useRef, useEffect, useCallback } from 'react';

/** 
 * AetherForge elite Gesture Engine (MediaPipe Tasks Vision v0.10+) 
 * Uses the high-accuracy HandLandmarker with 0ms network latency.
 */
export function useHands() {
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const rafRef   = useRef(null);
  const gestureRef = useRef('NONE'); // Ref for sync read in useFrame

  const [gesture,         setGesture]         = useState('IDLE');
  const [landmarks,       setLandmarks]       = useState(null);
  const [handPos,         setHandPos]         = useState({ x: 0.5, y: 0.5, z: 0 });
  const [confidence,      setConfidence]      = useState(0);
  const [permissionState, setPermissionState] = useState('prompt');
  const [isReady,         setIsReady]         = useState(false);
  const [isInitializing,  setIsInitializing]  = useState(false);

  /** Step 1: Request camera stream. */
  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, frameRate: 30 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.warn('[AetherForge] Autoplay blocked or interrupted:', err);
            });
            setIsReady(true);
          }
        };
      }
      setPermissionState('granted');
    } catch (err) {
      console.error('[AetherForge] Camera Access Denied:', err);
      setPermissionState('denied');
    }
  }, []);

  /** Step 2: Classify gestures based on 3D landmarks. */
  const classifyGesture = (points) => {
    if (!points || points.length < 21) return 'NONE';

    // Tip and base indices for classification
    const thumbTip = points[4], thumbBase = points[2];
    const indexTip = points[8], indexBase = points[6];
    const middleTip = points[12];
    const ringTip = points[16];
    const pinkyTip = points[20];

    // Distance helpers
    const dist = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    
    // 1. PINCH (Index Tip to Thumb Tip)
    const pinchDist = dist(indexTip, thumbTip);
    if (pinchDist < 0.05) return 'PINCH';

    // 2. FIST (All fingers closed towards wrist)
    const wrist = points[0];
    const handSize = dist(wrist, points[9]); // Scale normalization
    const isFist = [8, 12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 0.8);
    if (isFist) return 'FIST';

    // 3. PEACE (Index and Middle extended, others closed)
    const isIndexExt = dist(points[8], wrist) > handSize * 1.2;
    const isMiddleExt = dist(points[12], wrist) > handSize * 1.2;
    const isRingClosed = dist(points[16], wrist) < handSize * 0.9;
    const isPinkyClosed = dist(points[20], wrist) < handSize * 0.9;
    if (isIndexExt && isMiddleExt && isRingClosed && isPinkyClosed) return 'PEACE';

    // 4. POINT (Index extended, others closed)
    const isIndexExtended = dist(indexTip, indexBase) > 0.08;
    const areOthersClosed = [12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 0.82);
    if (isIndexExtended && areOthersClosed) return 'POINT';

    // 5. OPEN_HAND
    if ([8, 12, 16, 20].every(idx => dist(points[idx], wrist) > handSize * 1.2)) return 'OPEN';

    return 'IDLE';
  };

  /** Step 3: Initialize Tasks-Vision HandLandmarker. */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        if (cancelled) return;

        setIsInitializing(true);
        
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm"
        );
        
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.8,
          minHandPresenceConfidence: 0.8,
          minTrackingConfidence: 0.8
        });

        if (cancelled) return;
        handsRef.current = landmarker;
        setIsInitializing(false);
        console.log('[AetherForge] Elite HandLandmarker initialized successfully');

        const detect = () => {
          if (cancelled) return;
          if (videoRef.current && videoRef.current.readyState >= 2 && handsRef.current) {
            try {
              const startTimeMs = performance.now();
              const results = handsRef.current.detectForVideo(videoRef.current, startTimeMs);

              if (results && results.landmarks && results.landmarks.length > 0) {
                const pts = results.landmarks[0];
                const g = classifyGesture(pts);
                
                gestureRef.current = g;
                setGesture(g);
                setLandmarks(pts);
                setConfidence(results.handPresenceScores ? results.handPresenceScores[0] : 0.9);
                
                setHandPos({ x: 1 - pts[8].x, y: pts[8].y, z: pts[8].z });
              } else {
                gestureRef.current = 'NONE';
                setGesture('IDLE');
                setConfidence(0);
              }
            } catch (err) {
              console.error('[AetherForge] Detection loop error:', err);
            }
          }
          rafRef.current = requestAnimationFrame(detect);
        };
        rafRef.current = requestAnimationFrame(detect);
      } catch (err) {
        setIsInitializing(false);
        console.error('[AetherForge Gesture] Task Vision init failed. Check network or GPU support:', err);
      }
    }

    if (permissionState === 'granted' && isReady) {
      init();
    }

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [permissionState, isReady]);

  return { videoRef, gestureRef, gesture, landmarks, handPos, confidence, permissionState, requestCamera, isInitializing };
}
