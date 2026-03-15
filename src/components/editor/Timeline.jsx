import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';
import './Timeline.css';

const Timeline = () => {
  return (
    <div className="timeline-panel">
      <div className="timeline-header">
        <div className="timeline-controls">
          <button className="timeline-btn"><SkipBack size={14}/></button>
          <button className="timeline-btn primary"><Play size={14}/></button>
          <button className="timeline-btn"><SkipForward size={14}/></button>
          
          <div className="timeline-divider"></div>
          
          <div className="frame-counter">
            <Clock size={12}/>
            <span>124 / 250</span>
          </div>
        </div>
      </div>
      
      <div className="timeline-track-area">
        <div className="timeline-ruler">
          {[...Array(26)].map((_, i) => (
            <div key={i} className="ruler-mark">
              <span className="ruler-num">{i * 10}</span>
            </div>
          ))}
        </div>
        
        <div className="timeline-tracks">
          <div className="track">
            <div className="track-header">Armature</div>
            <div className="track-content">
              <div className="keyframe" style={{left: '10%'}}></div>
              <div className="keyframe" style={{left: '30%'}}></div>
              <div className="keyframe active" style={{left: '50%'}}></div>
              <div className="keyframe" style={{left: '80%'}}></div>
              
              <div className="playhead" style={{left: '50%'}}></div>
            </div>
          </div>
          <div className="track">
            <div className="track-header">Camera</div>
            <div className="track-content">
              <div className="keyframe" style={{left: '5%'}}></div>
              <div className="keyframe" style={{left: '95%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
