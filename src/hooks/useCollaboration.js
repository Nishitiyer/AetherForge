import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

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
