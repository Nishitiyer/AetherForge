import { useState, useRef, useEffect, useCallback } from 'react';

/** 
 * AetherForge elite Gesture Engine (MediaPipe Tasks Vision v0.10+) 
 * Uses the high-accuracy HandLandmarker with 0ms network latency.
 */
export function useHands() {
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const rafRef   = useRef(null);
  const gestureRef = useRef(['NONE', 'NONE']); // Ref for sync read in useFrame (Dual-Hand)
  const handPosRef = useRef([{ x:0.5, y:0.5, z:0, v:0 }, { x:0.5, y:0.5, z:0, v:0 }]); // Ref for sync read in useFrame
  const prevHandPosRef = useRef([{ x:0.5, y:0.5, z:0 }, { x:0.5, y:0.5, z:0 }]); // For velocity tracking

  const [gestures,        setGestures]        = useState(['IDLE', 'IDLE']);
  const [landmarksList,   setLandmarksList]   = useState([null, null]);
  const [handPosList,     setHandPosList]     = useState([{ x: 0.5, y: 0.5, z: 0 }, { x: 0.5, y: 0.5, z: 0 }]);
  const [confidenceList,  setConfidenceList]  = useState([0, 0]);
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
    const middleTip = points[12], middleBase = points[10];
    const ringTip = points[16], ringBase = points[14];
    const pinkyTip = points[20], pinkyBase = points[18];
    const wrist = points[0];

    // Distance helper
    const dist = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

    // Scale normalization for distant hands (Wrist to Middle Knuckle distance as anchor)
    const handSize = dist(wrist, points[9]) || 0.1; 

    // 1. PINCH (Index Tip to Thumb Tip) 
    const pinchDist = dist(indexTip, thumbTip);
    if (pinchDist < handSize * 0.3) return 'PINCH'; 

    // 2. GRAB / FIST (All fingers closed towards wrist)
    const isFist = [8, 12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 0.95);
    if (isFist) return 'GRAB';

    // 3. GUN (Thumb and Index extended, others closed)
    const isThumbExt = dist(thumbTip, thumbBase) > handSize * 0.4;
    const isIndexExt = dist(indexTip, indexBase) > handSize * 0.6;
    const isOthersClosedGun = [12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 1.0);
    if (isThumbExt && isIndexExt && isOthersClosedGun) return 'GUN';

    // 4. THUMBS_UP (Thumb extended vertically, others closed)
    const isThumbUp = thumbTip.y < thumbBase.y - (handSize * 0.3);
    const areOthersFist = [8, 12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 0.9);
    if (isThumbUp && areOthersFist) return 'THUMBS_UP';

    // 5. PEACE (Index and Middle extended, others closed)
    const isPeaceIndex = dist(points[8], wrist) > handSize * 1.2;
    const isPeaceMiddle = dist(points[12], wrist) > handSize * 1.2;
    const isRingClosed = dist(points[16], wrist) < handSize * 0.9;
    const isPinkyClosed = dist(points[20], wrist) < handSize * 0.9;
    if (isPeaceIndex && isPeaceMiddle && isRingClosed && isPinkyClosed) return 'PEACE';

    // 6. POINT (Index extended, others closed)
    const isPointIndex = dist(indexTip, indexBase) > handSize * 0.8;
    const areOthersClosed = [12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 0.95);
    if (isPointIndex && areOthersClosed) return 'POINT';

    // 7. SPREAD / OPEN_HAND
    const isSpread = [8, 12, 16, 20].every(idx => dist(points[idx], wrist) > handSize * 1.4);
    if (isSpread) return 'SPREAD';

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
          numHands: 2,
          minHandDetectionConfidence: 0.5, // Lowered for better range detection
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
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
                const newGestures = [];
                const newLandmarks = [];
                const newPosList = [];
                const newConfidences = [];

                results.landmarks.forEach((pts, i) => {
                  const g = classifyGesture(pts);
                  newGestures[i] = g;
                  newLandmarks[i] = pts;
                  
                  // Calculate velocity (Z-change) - Exponentially weighted for smooth but reactive creation
                  const prevZ = prevHandPosRef.current[i]?.z || pts[8].z;
                  const deltaZ = (prevZ - pts[8].z);
                  const velocity = deltaZ * 200; // Positive = PUSH towards camera
                  
                  const hp = { 
                    x: 1 - pts[8].x, 
                    y: pts[8].y, 
                    z: pts[8].z, 
                    v: velocity,
                    isRight: results.handedness ? results.handedness[i][0].label === 'Right' : true
                  };
                  newPosList[i] = hp;
                  newConfidences[i] = results.handPresenceScores ? results.handPresenceScores[i] : 0.9;
                  
                  prevHandPosRef.current[i] = { x: hp.x, y: hp.y, z: hp.z };
                });

                gestureRef.current = newGestures;
                handPosRef.current = newPosList;
                
                setGestures(newGestures);
                setLandmarksList(newLandmarks);
                setHandPosList(newPosList);
                setConfidenceList(newConfidences);
              } else {
                gestureRef.current = ['NONE', 'NONE'];
                setGestures(['IDLE', 'IDLE']);
                setConfidenceList([0, 0]);
                setLandmarksList([null, null]);
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

  return { 
    videoRef, 
    gestureRef, 
    handPosRef, 
    gestures, 
    landmarksList, 
    handPosList, 
    confidenceList, 
    permissionState, 
    requestCamera, 
    isInitializing 
  };
}
