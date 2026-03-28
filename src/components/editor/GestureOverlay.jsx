import React, { useRef, useEffect } from 'react';

const GestureOverlay = ({ videoRef, landmarks, active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !landmarks || !active) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw landmarks
    ctx.fillStyle = '#00f2fe';
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
    ctx.lineWidth = 2;

    // Very simplified skeleton drawing
    landmarks.forEach((pt) => {
      const x = (1 - pt.x) * width; // Flip horizontally
      const y = pt.y * height;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw lines between basic joints
    const drawLine = (p1Idx, p2Idx) => {
      const p1 = landmarks[p1Idx];
      const p2 = landmarks[p2Idx];
      ctx.beginPath();
      ctx.moveTo((1 - p1.x) * width, p1.y * height);
      ctx.lineTo((1 - p2.x) * width, p2.y * height);
      ctx.stroke();
    };

    // Wrist to fingers
    [0, 1, 5, 9, 13, 17].forEach((idx, i, arr) => {
      if (i > 0) drawLine(arr[i-1], idx);
    });
    // Individual fingers
    [1,2,3,4].forEach(idx => drawLine(idx-1, idx)); // Thumb
    [5,6,7,8].forEach(idx => drawLine(idx-1, idx)); // Index
    [9,10,11,12].forEach(idx => drawLine(idx-1, idx)); // Middle
    
  }, [landmarks, active]);

  if (!active) return null;

  return (
    <div className="gesture-overlay-container">
      <video ref={videoRef} className="hidden-video" playsInline style={{ display: 'none' }} />
      <canvas 
        ref={canvasRef} 
        width={320} 
        height={240} 
        className="gesture-canvas glass-panel"
      />
      <div className="gesture-hint">AETHER_VISION ACTIVE</div>
      
      <style>{`
        .gesture-overlay-container {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
          pointer-events: none;
        }
        .gesture-canvas {
          width: 200px;
          height: 150px;
          border: 1px solid rgba(0, 242, 254, 0.3);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.4);
          transform: scaleX(-1); /* Mirror view */
        }
        .gesture-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px;
          color: #00f2fe;
          text-align: center;
          margin-top: 4px;
          letter-spacing: 2px;
          text-shadow: 0 0 5px rgba(0, 242, 254, 0.5);
        }
      `}</style>
    </div>
  );
};

export default GestureOverlay;
