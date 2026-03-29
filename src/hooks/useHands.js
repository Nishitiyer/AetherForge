import { useState, useEffect, useRef } from 'react';

const useHands = (active) => {
  const [gesture, setGesture] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!active) {
      if (cameraRef.current) cameraRef.current.stop();
      return;
    }

    const initHands = async () => {
      // Use dynamic import for MediaPipe to avoid SSR issues if any
      const { Hands } = await import('@mediapipe/hands');
      const { Camera } = await import('@mediapipe/camera_utils');

      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const lms = results.multiHandLandmarks[0];
          setLandmarks(lms);
          
          // Basic Gesture Detection
          // 1. Pinch Detection (Thumb tip and Index tip)
          const thumbTip = lms[4];
          const indexTip = lms[8];
          const dist = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
          );
          
          if (dist < 0.05) {
            setGesture('PINCH');
          } else {
            // 2. Open Palm (Distance between palm and fingers)
            const middleTip = lms[12];
            const wrist = lms[0];
            const palmDist = Math.sqrt(
              Math.pow(middleTip.x - wrist.x, 2) + 
              Math.pow(middleTip.y - wrist.y, 2)
            );
            
            // 3. Thumbs Up (Thumb up, others closed)
            const thumbUp = lms[4].y < lms[3].y && lms[3].y < lms[2].y;
            const indexClosed = lms[8].y > lms[6].y;
            const middleClosed = lms[12].y > lms[10].y;
            
            if (palmDist > 0.4) setGesture('PALM_OPEN');
            else if (thumbUp && indexClosed && middleClosed) setGesture('THUMBS_UP');
            else setGesture('NONE');
          }
        } else {
          setLandmarks(null);
          setGesture(null);
        }
      });

      handsRef.current = hands;

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            await hands.send({ image: videoRef.current });
          },
          width: 640,
          height: 480
        });
        camera.start();
        cameraRef.current = camera;
      }
    };

    initHands();

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (handsRef.current) handsRef.current.close();
    };
  }, [active]);

  return { gesture, landmarks, videoRef };
};

export default useHands;
