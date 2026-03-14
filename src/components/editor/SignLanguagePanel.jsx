import React, { useRef, useEffect, useState } from 'react';
import { Camera, WandSparkles, X } from 'lucide-react';
import './SignLanguagePanel.css';

const SignLanguagePanel = ({ isOpen, onClose, onTranslation }) => {
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState('Initializing Hand Tracking...');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setStatus('Scanning for gestures...');
      }
    } catch (err) {
      setStatus('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const simulateGesture = (gesture) => {
    setStatus(`Detected Sign: ${gesture}`);
    setTimeout(() => {
      onTranslation(gesture);
      setStatus('Scanning for gestures...');
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="sign-language-panel glass-panel animate-in">
      <div className="panel-header">
        <div className="header-title">
          <Camera size={18} />
          <span>Sign Language Assistant</span>
        </div>
        <button onClick={onClose} className="close-btn"><X size={18} /></button>
      </div>

      <div className="camera-viewport">
        <video ref={videoRef} autoPlay playsInline muted className={isCameraActive ? 'active' : ''}></video>
        {!isCameraActive && <div className="camera-placeholder"><Camera size={48} opacity={0.2} /></div>}
        <div className="gesture-overlay">
          <div className="tracking-skeleton"></div>
        </div>
      </div>

      <div className="panel-status">
        <div className="status-dot pulsing"></div>
        <span>{status}</span>
      </div>

      <div className="gesture-presets">
        <p>Shortcuts (Simulated)</p>
        <div className="preset-grid">
          <button onClick={() => simulateGesture('Add Cube')}>Cube</button>
          <button onClick={() => simulateGesture('Generate Character')}>Character</button>
          <button onClick={() => simulateGesture('Rotate Item')}>Rotate</button>
        </div>
      </div>

      <div className="accessibility-info">
        <WandSparkles size={14} className="text-primary" />
        <span>Perform gestures to control AetherForge AI.</span>
      </div>
    </div>
  );
};

export default SignLanguagePanel;
