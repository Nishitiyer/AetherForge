import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export const useCollaboration = (projectId) => {
  const [otherCursors, setOtherCursors] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    // Only initialize socket on client side
    if (typeof window !== 'undefined' && !socketRef.current) {
      const socketUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://aether-forge-server.vercel.app';
      
      try {
        socketRef.current = io(socketUrl, {
          transports: ['websocket'],
          reconnection: true
        });

        socketRef.current.on('connect_error', () => {
          console.warn('Collaboration server unreachable. Working in solo mode.');
        });
      } catch (err) {
        console.error('Socket initialization failed:', err);
      }
    }

    const socket = socketRef.current;
    if (!socket) return;

    if (projectId) {
      socket.emit('join-project', projectId);
    }

    socket.on('user-cursor', (data) => {
      setOtherCursors(prev => ({
        ...prev,
        [data.userId]: data.position
      }));
    });

    return () => {
      socket.off('user-cursor');
    };
  }, [projectId]);

  const updateCursor = (position) => {
    if (socketRef.current) {
      socketRef.current.emit('cursor-move', { projectId, position });
    }
  };

  return { otherCursors, updateCursor };
};
