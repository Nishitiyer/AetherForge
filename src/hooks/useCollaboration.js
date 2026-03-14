import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Socket is initialized on demand or with conditional URL
let socket;
try {
  socket = io(location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://aether-forge-server.vercel.app');
} catch (e) {
  socket = { on: () => {}, off: () => {}, emit: () => {} };
}

export const useCollaboration = (projectId) => {
  const [otherCursors, setOtherCursors] = useState({});

  useEffect(() => {
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
    socket.emit('cursor-move', { projectId, position });
  };

  return { otherCursors, updateCursor };
};

export default socket;
