import { useState, useRef, useEffect, useCallback } from 'react';

/** 
 * useHands: Python-Powered Stark Gesture Engine.
 * Connects to the FastAPI backend (Python 3.13) for high-performance 3D synthesis.
 */
export function useHands() {
  const socketRef = useRef(null);
  
  // Ref for sync read in useFrame (the "hot path" for 60fps)
  const gestureRef = useRef(['NONE', 'NONE']); 
  const handPosRef = useRef([{ x:0.5, y:0.5, z:0, v:0 }, { x:0.5, y:0.5, z:0, v:0 }]); 
  
  const [gestures,        setGestures]        = useState(['IDLE', 'IDLE']);
  const [landmarksList,   setLandmarksList]   = useState([]);
  const [handPosList,     setHandPosList]     = useState([{ x: 0.5, y: 0.5, z: 0 }, { x: 0.5, y: 0.5, z: 0 }]);
  const [confidenceList,  setConfidenceList]  = useState([0, 0]);
  const [permissionState, setPermissionState] = useState('prompt');
  const [isInitializing,  setIsInitializing]  = useState(false);
  const [isReady,         setIsReady]         = useState(false);
  const [frameData,       setFrameData]       = useState(null);
  
  const videoRef = useRef(null);

  /** 
   * Connect to the Python AI Hook Backend.
   */
  const requestCamera = useCallback(async () => {
    if (socketRef.current) return;
    
    setPermissionState('granted');
    setIsInitializing(true);
    
    const socket = new WebSocket('ws://localhost:8000/ws/gestures');
    
    socket.onopen = () => {
      console.log('[AetherForge Hook] Python Gesture Protocol: ENGAGED');
      setIsInitializing(false);
      setIsReady(true);
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data) return;
        
        // Update high-perf refs with fallbacks
        const gesturesData = data.gestures || ['NONE', 'NONE'];
        const handPosData = data.handPosList || [{ x: 0.5, y: 0.5, z: 0, v: 0 }, { x: 0.5, y: 0.5, z: 0, v: 0 }];
        
        gestureRef.current = gesturesData.length ? gesturesData : ['NONE', 'NONE'];
        handPosRef.current = handPosData.length ? handPosData : [{ x: 0.5, y: 0.5, z: 0, v: 0 }, { x: 0.5, y: 0.5, z: 0, v: 0 }];
        
        // Update React state
        setGestures(gesturesData.length ? gesturesData : ['IDLE', 'IDLE']);
        setLandmarksList(data.landmarksList && data.landmarksList.length ? data.landmarksList : [null, null]);
        setHandPosList(handPosData.length ? handPosData : [{ x: 0.5, y: 0.5, z: 0 }, { x: 0.5, y: 0.5, z: 0 }]);
        setConfidenceList(data.confidenceList && data.confidenceList.length ? data.confidenceList : [0, 0]);
        
        if (data.image) setFrameData(data.image);
        if (data.drawnShape && data.drawnShape !== 'unknown') {
           window.dispatchEvent(new CustomEvent('stark:drawn', { detail: data.drawnShape }));
        }
      } catch (err) {
        console.error('[AetherForge Hook] Error parsing socket data:', err);
      }
    };
    
    socket.onclose = () => {
      console.warn('[AetherForge Hook] Python Gesture Protocol: DISCONNECTED');
      setIsReady(false);
    };
    
    socket.onerror = (err) => {
      console.error('[AetherForge Hook] Connection error:', err);
      setIsInitializing(false);
    };
    
    socketRef.current = socket;
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return { 
    videoRef, 
    gestureRef, 
    handPosRef, 
    gestures, 
    landmarksList, 
    handPosList, 
    confidenceList, 
    permissionState, 
    requestCamera, 
    isInitializing,
    frameData
  };
}
