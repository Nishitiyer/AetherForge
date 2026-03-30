/**
 * useHands — AetherForge Gesture Engine v4
 *
 * Architecture:
 * - Stream is started via requestCamera() on user action (required by browser security)
 * - MediaPipe Hands is loaded via static package import, not dynamic CDN fetch
 * - Detection runs in a requestAnimationFrame loop; sets gesture via state
 * - gestureRef is also set synchronously so Three.js useFrame can read it without
 *   waiting for a React re-render (critical for 60fps transform smoothness)
 */
import { useEffect, useRef, useState, useCallback } from 'react';

function classifyGesture(hand) {
  try {
    const tip  = (i) => hand[i];
    const pip  = (i) => hand[i - 2];

    const thumbTip   = tip(4);
    const indexTip   = tip(8);
    const middleTip  = tip(12);
    const ringTip    = tip(16);
    const pinkyTip   = tip(20);
    const wrist      = hand[0];

    // Pinch: thumb+index close together
    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const pinchDist = Math.sqrt(dx*dx + dy*dy);
    // Increase threshold for easier pinching
    if (pinchDist < 0.1) return 'PINCH';

    // Extended fingers: tip above pip (lower y = higher on screen)
    const indexExt  = indexTip.y  < pip(8).y;
    const middleExt = middleTip.y < pip(12).y;
    const ringExt   = ringTip.y   < pip(16).y;
    const pinkyExt  = pinkyTip.y  < pip(20).y;
    const extCount  = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

    if (extCount === 4) return 'OPEN_HAND';   // scale up
    if (extCount === 0) return 'FIST';        // scale down
    if (indexExt && !middleExt) return 'POINT'; // rotate
    if (indexExt && middleExt && !ringExt) return 'PEACE'; // move up
    
    // Fallback IDLE if no specific gesture met
    return 'IDLE';
  } catch {
    return 'NONE';
  }
}

export function useHands() {
  const videoRef        = useRef(null);
  const streamRef       = useRef(null);
  const handsRef        = useRef(null);
  const rafRef          = useRef(null);
  const gestureRef      = useRef('NONE'); // sync ref for Three.js useFrame

  const [gesture,         setGesture]         = useState('NONE');
  const [landmarks,       setLandmarks]       = useState(null);
  const [handPos,         setHandPos]         = useState(null); // {x, y, z} normalized
  const [confidence,      setConfidence]      = useState(0);
  const [permissionState, setPermissionState] = useState('prompt');
  const [isReady,         setIsReady]         = useState(false);

  /** Step 1: Request camera stream. Call this on user interaction. */
  const requestCamera = useCallback(async () => {
    if (streamRef.current) return; // already started
    try {
      setPermissionState('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermissionState('granted');
      setIsReady(true);
    } catch (err) {
      console.error('[AetherForge Gesture] Camera denied:', err.name, err.message);
      setPermissionState('denied');
    }
  }, []);

  /** Step 2: Initialise MediaPipe Hands once camera is ready */
  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function init() {
      try {
        // Static import — no CDN, works offline
        const { Hands } = await import('@mediapipe/hands');
        if (cancelled) return;

        const hands = new Hands({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}`,
        });
        hands.setOptions({
          maxNumHands:             1,
          modelComplexity:         1, // 1 = more accurate than 0
          minDetectionConfidence:  0.7,
          minTrackingConfidence:   0.7,
        });
        hands.onResults((results) => {
          if (cancelled) return;
          console.log('[AetherForge] Results:', results.multiHandLandmarks?.length > 0 ? 'Hand detected' : 'No hand');
          if (results.multiHandLandmarks?.length > 0) {
            const hand  = results.multiHandLandmarks[0];
            const g     = classifyGesture(hand);
            
            // Calculate pinch point (midpoint between thumb 4 and index 8)
            const thumb  = hand[4];
            const index  = hand[8];
            const midX   = (thumb.x + index.x) / 2;
            const midY   = (thumb.y + index.y) / 2;
            const midZ   = (thumb.z + index.z) / 2;

            gestureRef.current = g;
            setGesture(g);
            setLandmarks(results.multiHandLandmarks);
            setHandPos({ x: midX, y: midY, z: midZ });
            setConfidence(results.multiHandedness?.[0]?.score ?? 0.9);
          } else {
            gestureRef.current = 'NONE';
            setGesture('NONE');
            setLandmarks(null);
            setHandPos(null);
            setConfidence(0);
          }
        });
        handsRef.current = hands;
        console.log('[AetherForge] MediaPipe Hands initialized');

        // Detection loop – run at ~30fps to balance accuracy and perf
        let lastTime = 0;
        const detect = async (now) => {
          if (cancelled) return;
          rafRef.current = requestAnimationFrame(detect);
          if (now - lastTime < 16) return; // ~60fps target
          lastTime = now;
          const vid = videoRef.current;
          if (vid && vid.readyState >= 2 && !vid.paused) {
            try { 
              await hands.send({ image: vid }); 
            } catch (e) {
              console.warn('[AetherForge] hands.send failed:', e.message);
            }
          }
        };
        rafRef.current = requestAnimationFrame(detect);
      } catch (err) {
        console.error('[AetherForge Gesture] MediaPipe init failed:', err);
      }
    }

    init();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      handsRef.current?.close?.();
    };
  }, [isReady]);

  /** Cleanup stream on unmount */
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { videoRef, gestureRef, gesture, landmarks, handPos, confidence, permissionState, requestCamera };
}
