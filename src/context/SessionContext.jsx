import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionTime, setSessionTime] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [orbSettings, setOrbSettings] = useState({
    name: localStorage.getItem('orbName') || 'Omni',
    color: localStorage.getItem('orbColor') || '#8b5cf6',
    animation: localStorage.getItem('orbAnimation') || 'Pulse',
    voice: parseInt(localStorage.getItem('orbVoice')) || 0
  });

  const isCreator = localStorage.getItem('isCreator') === 'true';

  useEffect(() => {
    // Save settings
    localStorage.setItem('orbName', orbSettings.name);
    localStorage.setItem('orbColor', orbSettings.color);
    localStorage.setItem('orbAnimation', orbSettings.animation);
    localStorage.setItem('orbVoice', orbSettings.voice.toString());
  }, [orbSettings]);

  useEffect(() => {
    if (isCreator) return;

    const today = new Date().toDateString();
    const lastSessionDate = localStorage.getItem('sessionDate');
    
    if (lastSessionDate !== today) {
      localStorage.setItem('sessionDate', today);
      localStorage.setItem('sessionStart', Date.now());
      setIsExpired(false);
    }

    const startTime = localStorage.getItem('sessionStart') || Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSessionTime(elapsed);
      
      if (elapsed >= 7200) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCreator]);

  const resetSession = () => {
    localStorage.removeItem('sessionStart');
    setSessionTime(0);
    setIsExpired(false);
  };

  return (
    <SessionContext.Provider value={{ 
      sessionTime, isExpired, isCreator, resetSession, 
      orbSettings, setOrbSettings 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
