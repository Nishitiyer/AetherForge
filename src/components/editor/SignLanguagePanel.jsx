import React, { useRef, useEffect, useState } from 'react';
import { Camera, Wand2, X, Languages } from 'lucide-react';
import './SignLanguagePanel.css';

const SignLanguagePanel = ({ isOpen, onClose, onTranslation }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState('Initializing Hand Tracking...');
  const [mode, setMode] = useState('ASL'); // ASL or ISL
  const [lastGesture, setLastGesture] = useState(null);
  const [gestureCooldown, setGestureCooldown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMediaPipe();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const loadMediaPipe = async () => {
    try {
      // Dynamically load MediaPipe from CDN
      if (!window.Hands) {
        const scripts = [
          'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
          'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
          'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
        ];
        
        for (const src of scripts) {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          document.head.appendChild(script);
          await new Promise(res => script.onload = res);
        }
      }
      startCamera();
    } catch (err) {
      setStatus('Tracking library failed to load');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setStatus('Scanning for gestures...');
        initTracking();
      }
    } catch (err) {
      setStatus('Camera access denied');
    }
  };

  const initTracking = () => {
    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480
    });
    camera.start();
  };

  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (results.multiHandLandmarks && isCameraActive) {
      for (const landmarks of results.multiHandLandmarks) {
        window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#8b5cf6', lineWidth: 3 });
        window.drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
        
        processGesture(landmarks);
      }
    }
    canvasCtx.restore();
  };

  const processGesture = (landmarks) => {
    if (gestureCooldown) return;

    // Simplified gesture logic based on landmark positions
    // Finger tips: 8 (index), 12 (middle), 16 (ring), 20 (pinky)
    // Finger bases: 5 (index), 9 (middle), 13 (ring), 17 (pinky)
    
    const fingersUp = [
      landmarks[8].y < landmarks[6].y,  // Index
      landmarks[12].y < landmarks[10].y, // Middle
      landmarks[16].y < landmarks[14].y, // Ring
      landmarks[20].y < landmarks[18].y  // Pinky
    ].filter(f => f).length;

    let detected = null;

    if (mode === 'ASL') {
      if (fingersUp === 4) detected = 'Add Character';
      else if (fingersUp === 1) detected = 'Add Cube';
      else if (fingersUp === 2) detected = 'Rotate Item';
    } else { // ISL logic
      if (fingersUp === 5) detected = 'Generate Background'; // Assuming thumb check too
      else if (landmarks[8].y < landmarks[4].y && fingersUp === 1) detected = 'Animate Walk';
      else if (landmarks[12].y < landmarks[8].y && fingersUp === 2) detected = 'Animate Wave';
    }

    if (detected && detected !== lastGesture) {
      setLastGesture(detected);
      executeGesture(detected);
    }
  };

  const executeGesture = (gesture) => {
    setStatus(`Sign: ${gesture}`);
    setGestureCooldown(true);
    
    onTranslation(gesture);
    
    setTimeout(() => {
      setGestureCooldown(false);
      setStatus('Scanning for gestures...');
    }, 2000);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sign-language-panel glass-panel animate-in">
      <div className="panel-header">
        <div className="header-title">
          <Camera size={18} />
          <span>Sign Assistant ({mode})</span>
        </div>
        <div className="header-actions">
          <button className="mode-switch" onClick={() => setMode(mode === 'ASL' ? 'ISL' : 'ASL')}>
            <Languages size={14} />
            {mode === 'ASL' ? 'To ISL' : 'To ASL'}
          </button>
          <button onClick={onClose} className="close-btn"><X size={18} /></button>
        </div>
      </div>

      <div className="camera-viewport">
        <video ref={videoRef} autoPlay playsInline muted className={isCameraActive ? 'active' : ''}></video>
        <canvas ref={canvasRef} width="640" height="480" className="tracking-canvas"></canvas>
        {!isCameraActive && <div className="camera-placeholder"><Camera size={48} opacity={0.2} /></div>}
        <div className="gesture-overlay">
          <div className="tracking-skeleton"></div>
        </div>
      </div>

      <div className="panel-status">
        <div className={`status-dot ${isCameraActive ? 'pulsing' : ''}`}></div>
        <span>{status}</span>
      </div>

      <div className="gesture-info-bar">
        <div className="info-item">
          <Wand2 size={12} />
          <span>{mode === 'ASL' ? 'ASL: 1-Index, 2-V Sign, 4-Palm' : 'ISL: 1-Point, 2-Wave, 5-Palm'}</span>
        </div>
      </div>

      <div className="accessibility-info">
        <span>Hand tracking enabled. Detected signs trigger AI prompts.</span>
      </div>
    </div>
  );
};

export default SignLanguagePanel;
