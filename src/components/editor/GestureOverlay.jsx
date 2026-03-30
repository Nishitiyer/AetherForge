import React, { useRef, useEffect } from 'react';
import './GestureOverlay.css';

/**
 * AetherForge Gesture Overlay - MK85 HUD Edition
 * High-fidelity holographic HUD for hand-tracking visualization.
 */
export const GestureOverlay = ({ videoRef, landmarksList, gestures, confidenceList }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (landmarksList) {
        landmarksList.forEach((landmarks, handIdx) => {
          if (!landmarks) return;

          const gesture = gestures[handIdx];
          const color = '#00e5ff'; // Cyan hologram
          const glowColor = 'rgba(0, 229, 255, 0.5)';

          // Draw Connections (Skeleton)
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          
          const drawLink = (i1, i2) => {
            ctx.beginPath();
            ctx.moveTo(landmarks[i1].x * canvas.width, landmarks[i1].y * canvas.height);
            ctx.lineTo(landmarks[i2].x * canvas.width, landmarks[i2].y * canvas.height);
            ctx.stroke();
          };

          // Palm/Wrist
          [0, 1, 2, 5, 9, 13, 17, 0].forEach((idx, i, arr) => {
            if (i < arr.length - 1) drawLink(arr[i], arr[i+1]);
          });
          
          // Fingers
          [[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16], [17,18,19,20]].forEach(finger => {
            for(let i=0; i<finger.length-1; i++) drawLink(finger[i], finger[i+1]);
          });

          // Hand Node Circles
          landmarks.forEach((pt, i) => {
            ctx.fillStyle = i % 4 === 0 ? color : '#fff';
            ctx.beginPath();
            ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Gesture Tooltip Widget
          const wrist = landmarks[0];
          ctx.save();
          ctx.translate(wrist.x * canvas.width, wrist.y * canvas.height - 40);
          
          // Outer Ring
          ctx.strokeStyle = color;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(0, 0, 30, 0, Math.PI * 2);
          ctx.stroke();
          
          // Label
          ctx.font = 'bold 10px Rajdhani, monospace';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(gesture || 'STARK_OS_SEARCHING', 0, -35);
          
          ctx.restore();
        });
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [landmarksList, gestures]);

  return (
    <div className="gesture-overlay">
      <div className="camera-container">
        <video ref={videoRef} className="video-feed" autoPlay playsInline muted />
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
          className="hud-canvas"
        />
        
        <div className="hud-corner top-left" />
        <div className="hud-corner top-right" />
        <div className="hud-corner bottom-left" />
        <div className="hud-corner bottom-right" />
        
        <div className="iron-man-scanner" />
        
        <div className="gesture-label-box">
           <span className="label-key">MARK_85_INITIATED</span>
           <span className="label-val">{gestures[0] !== 'IDLE' ? gestures[0] : "SCANNING..."}</span>
        </div>
      </div>
    </div>
  );
};
