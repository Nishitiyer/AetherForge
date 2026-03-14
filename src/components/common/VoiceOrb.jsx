import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import './VoiceOrb.css';

const VoiceOrb = ({ onTranscription, settings }) => {
  const [isListening, setIsListening] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const speak = (text) => {
    if (!synthRef.current) return;
    const voices = synthRef.current.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voices[settings.voice]) {
      utterance.voice = voices[settings.voice];
    }
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscription(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [onTranscription]);

  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setPulseScale(1 + Math.random() * 0.4);
      }, 100);
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
    <div className="voice-orb-container">
      <div 
        className={`voice-orb ${isListening ? 'listening' : ''} anim-${settings.animation.toLowerCase()}`}
        style={{ 
          transform: `scale(${pulseScale})`,
          background: `conic-gradient(from 180deg at 50% 50%, ${settings.color} 0deg, #000 360deg)`
        }}
        onClick={toggleListening}
      >
        <div className="orb-inner"></div>
        <div 
          className="orb-glow" 
          style={{ background: settings.color }}
        ></div>
        {isListening ? <Mic size={20} /> : <MicOff size={20} />}
      </div>
      <div className="orb-label">{isListening ? 'Listening...' : settings.name}</div>
    </div>
  );
};

export default VoiceOrb;
