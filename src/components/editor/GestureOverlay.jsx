import React, { useRef, useEffect } from 'react';

export function GestureOverlay({ landmarks, videoRef, gesture, confidence }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !landmarks) return;
    const ctx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    ctx.clearRect(0, 0, width, height);
    
    // Stark HUD Styling
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'; // cyan-500
    ctx.lineWidth = 1;

    landmarks.forEach(hand => {
      // Connect landmarks (Stark Skeleton)
      ctx.beginPath();
      // Palm
      ctx.moveTo(hand[0].x * width, hand[0].y * height);
      [1, 5, 9, 13, 17, 0].forEach(p => ctx.lineTo(hand[p].x * width, hand[p].y * height));
      
      // Fingers
      [[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16], [17,18,19,20]].forEach(finger => {
         ctx.moveTo(hand[finger[0]].x * width, hand[finger[0]].y * height);
         finger.forEach(p => ctx.lineTo(hand[p].x * width, hand[p].y * height));
      });
      ctx.stroke();

      // Landmarks (Glow dots)
      hand.forEach((point, i) => {
        ctx.fillStyle = i % 4 === 0 ? 'rgba(6, 182, 212, 0.8)' : 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, i % 4 === 0 ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Active Point Highlight
        if (gesture === 'PINCH_GRAB' && (i === 4 || i === 8)) {
           ctx.shadowBlur = 10;
           ctx.shadowColor = '#06b6d4';
           ctx.strokeStyle = '#fff';
           ctx.lineWidth = 2;
           ctx.stroke();
           ctx.shadowBlur = 0;
        }
      });
    });

  }, [landmarks, gesture]);

  return (
    <div className="relative w-full h-full bg-[#000] rounded-lg border border-white/5 overflow-hidden group">
      {/* Video Stream (Hidden or small) */}
      <video 
        ref={videoRef} 
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none grayscale"
        autoPlay 
        playsInline 
      />
      
      {/* HUD Drawing Layer */}
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Cinematic HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-24 animate-scanline" />
        <div className="absolute top-4 left-4 border-l border-t border-cyan-500/40 w-8 h-8" />
        <div className="absolute bottom-4 right-4 border-r border-b border-cyan-500/40 w-8 h-8" />
      </div>

      <div className="absolute bottom-4 left-4 flex flex-col gap-1 z-10">
         <div className="text-[10px] uppercase font-black text-cyan-400/60 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            STARK_LINK_STABLE
         </div>
      </div>
      
      <style>{`
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(300%); }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
