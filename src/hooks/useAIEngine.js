import { useState, useCallback } from 'react';

/**
 * useAIEngine: Elite Stark-grade Python Integration Hook.
 * Communicates with the FastAPI backend for complex 3D synthesis.
 */
export function useAIEngine() {
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const generateFromPython = useCallback(async (prompt, color = '#8b5cf6', useCamera = false) => {
    setIsSynthesizing(true);
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, color, use_camera: useCamera })
      });
      
      if (!response.ok) throw new Error('AI Service Offline');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('[AetherForge AI] Error calling Python service:', err);
      return null;
    } finally {
      setIsSynthesizing(false);
    }
  }, []);

  return { generateFromPython, isSynthesizing };
}
