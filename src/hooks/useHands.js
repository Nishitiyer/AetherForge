import { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';

export function useHands() {
  const [landmarks, setLandmarks] = useState(null);
  const [gesture, setGesture] = useState('NONE');
  const [confidence, setConfidence] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setLandmarks(results.multiHandLandmarks);
        setConfidence(results.multiHandLandmarks[0][0].z ? Math.abs(results.multiHandLandmarks[0][0].z) : 0.95);
        
        // Basic Gesture Logic
        const hand = results.multiHandLandmarks[0];
        const thumbTip = hand[4];
        const indexTip = hand[8];
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) + 
          Math.pow(thumbTip.y - indexTip.y, 2)
        );

        if (distance < 0.05) {
          setGesture('PINCH_GRAB');
        } else if (hand[8].y < hand[6].y && hand[12].y < hand[10].y) {
          setGesture('OPEN_HAND');
        } else {
          setGesture('SELECT_MODE');
        }
      } else {
        setLandmarks(null);
        setGesture('NONE');
      }
    });

    if (videoRef.current) {
      const camera = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });
      camera.start();
    }

    return () => hands.close();
  }, []);

  return { videoRef, landmarks, gesture, confidence };
}
