import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const getStorageItem = (key, fallback) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key) || fallback;
      }
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
    return fallback;
  };

  const [userType, setUserType] = useState(getStorageItem('userType', 'USER')); // USER, CREATOR, ADMIN
  const [isOrbSelected, setIsOrbSelected] = useState(getStorageItem('isOrbSelected', 'false') === 'true');
  const [selectedOrbId, setSelectedOrbId] = useState(getStorageItem('selectedOrbId', 'nova'));
  
  const [orbSettings, setOrbSettings] = useState({
    name: getStorageItem('orbName', 'Omni'),
    color: getStorageItem('orbColor', '#00d4ff'),
    animation: getStorageItem('orbAnimation', 'Pulse'),
    voice: parseInt(getStorageItem('orbVoice', '0')) || 0
  });

  const [sessionTime, setSessionTime] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const CREATOR_KEY = "Lalitha76!";

  // Persistence
  useEffect(() => {
    localStorage.setItem('userType', userType);
    localStorage.setItem('isOrbSelected', isOrbSelected.toString());
    localStorage.setItem('selectedOrbId', selectedOrbId);
    localStorage.setItem('orbName', orbSettings.name);
    localStorage.setItem('orbColor', orbSettings.color);
    localStorage.setItem('orbAnimation', orbSettings.animation);
    localStorage.setItem('orbVoice', orbSettings.voice.toString());
  }, [userType, isOrbSelected, selectedOrbId, orbSettings]);

  useEffect(() => {
    if (userType === 'CREATOR' || userType === 'ADMIN') {
      setIsExpired(false);
      return;
    }

    const today = new Date().toDateString();
    const lastSessionDate = localStorage.getItem('sessionDate');
    const startTime = parseInt(localStorage.getItem('sessionStart')) || Date.now();
    
    if (lastSessionDate !== today) {
      localStorage.setItem('sessionDate', today);
      localStorage.setItem('sessionStart', Date.now().toString());
      setIsExpired(false);
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSessionTime(elapsed);
      
      // 2 hour session for free users
      if (elapsed >= 7200) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userType]);

  const loginAsCreator = (key) => {
    if (key === CREATOR_KEY) {
      setUserType('CREATOR');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserType('USER');
    setIsOrbSelected(false);
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <SessionContext.Provider value={{ 
      userType, setUserType,
      isOrbSelected, setIsOrbSelected,
      selectedOrbId, setSelectedOrbId,
      orbSettings, setOrbSettings,
      sessionTime, isExpired,
      loginAsCreator, logout,
      CREATOR_KEY
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
