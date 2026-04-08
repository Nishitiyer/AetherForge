import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Globe } from 'lucide-react';
import { ORB_DATA } from '../../data/orbs.js';
import './VoiceOrb.css';

const VoiceOrb = ({ onTranscription, settings }) => {
  const [isListening, setIsListening] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const recognitionRef = useRef(null);
  
  // Find the current orb config based on the settings/id from the ORB_DATA registry
  const orbConfig = ORB_DATA[settings?.id] || ORB_DATA.sentinel;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          onTranscription(transcript);
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [onTranscription]);

  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setPulseScale(1 + Math.random() * 0.2);
      }, 50);
    } else {
      setPulseScale(1);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="voice-orb-wrapper">
      <div 
        className={`premium-orb ${isListening ? 'listening' : ''}`}
        style={{ 
          '--orb-color': orbConfig.color,
          '--orb-secondary': orbConfig.secondaryColor,
          transform: `scale(${pulseScale})`
        }}
        onClick={toggleListening}
      >
        <div className="orb-ring-outer"></div>
        <div className="orb-ring-inner"></div>
        <div className="orb-core">
          {isListening ? <Mic size={24} className="mic-active" /> : <Mic size={24} />}
        </div>
        
        {/* Multilingual Glow Indicators */}
        <div className="multilingual-indicator">
          <Globe size={10} />
          <span>MULTI_LANG_ACTIVE</span>
        </div>
      </div>
      
      <div className="orb-status-text">
        <span className="orb-name">{orbConfig.name}</span>
        <span className="orb-action">{isListening ? 'ANALYZING_SPEECH...' : 'CLICK_TO_COMMAND'}</span>
      </div>
    </div>
  );
};

export default VoiceOrb;
