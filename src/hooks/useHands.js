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
  const [landmarksList,   setLandmarksList]   = useState([null, null]);
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
      const data = JSON.parse(event.data);
      
      // Update high-perf refs
      gestureRef.current = data.gestures.length ? data.gestures : ['NONE', 'NONE'];
      handPosRef.current = data.handPosList.length ? data.handPosList : [{ x:0.5, y:0.5, z:0, v:0 }, { x:0.5, y:0.5, z:0, v:0 }];
      
      // Update React state
      setGestures(data.gestures.length ? data.gestures : ['IDLE', 'IDLE']);
      setLandmarksList(data.landmarksList.length ? data.landmarksList : [null, null]);
      setHandPosList(data.handPosList.length ? data.handPosList : [{ x: 0.5, y: 0.5, z: 0 }, { x: 0.5, y: 0.5, z: 0 }]);
      setConfidenceList(data.confidenceList.length ? data.confidenceList : [0, 0]);
      
      if (data.image) setFrameData(data.image);
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
