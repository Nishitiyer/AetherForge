import React from 'react';
import './GestureOverlay.css';

/**
 * AetherForge Gesture Overlay
 * Minimal holographic HUD for hand-tracking visualization.
 */
export const GestureOverlay = ({ videoRef, landmarks, gesture, confidence }) => {
  return (
    <div className="gesture-overlay">
      <div className="camera-container">
        <video ref={videoRef} className="video-feed" autoPlay playsInline muted />
        <div className="hud-lines" />
        <div className="gesture-label-box">
           <span className="label-key">GESTURE_STATE</span>
           <span className="label-val">{gesture || "SEARCHING..."}</span>
        </div>
        <div className="confidence-bar-container">
           <div className="confidence-bg" />
           <div 
             className="confidence-fill" 
             style={{ width: `${(confidence || 0) * 100}%` }} 
           />
        </div>
      </div>
    </div>
  );
};
