import sys
import os
import json
import random
import cv2
import numpy as np
import base64
import time
import asyncio
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# --- Stark Neural Path Injection ---
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOKS_DIR = os.path.join(ROOT_DIR, 'src', 'hooks')
sys.path.append(ROOT_DIR)
sys.path.append(HOOKS_DIR)

print(f"[AetherForge] Project Root: {ROOT_DIR}")
print(f"[AetherForge] Hooks Dir: {HOOKS_DIR}")
print(f"[AetherForge] Current Path: {os.getcwd()}")

# Importing the STARK Python Hooks as requested by the user.
try:
    import useHands
    import useAIEngine
    hand_engine = useHands.hand_engine
    ai_engine = useAIEngine.ai_engine
    print("[AetherForge] Neural Hooks: SYNCHRONIZED")
except ImportError as e:
    print(f"[CRITICAL] AetherForge Stark Hooks failure: {e}")
    # Fallback to local import if needed
    try:
        from src.hooks import useHands, useAIEngine
        hand_engine = useHands.hand_engine
        ai_engine = useAIEngine.ai_engine
        print("[AetherForge] Neural Hooks: FIXED (src prefix)")
    except:
        sys.exit(1)

app = FastAPI(title="AetherForge AI Engine (Python Native Hooks)")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Types ---

class Part(BaseModel):
    type: str
    position: List[float]
    scale: List[float]
    rotation: Optional[List[float]] = [0, 0, 0]
    color: str
    name: Optional[str] = None
    emissive: Optional[str] = None
    emissiveIntensity: Optional[float] = 0

class ModelResponse(BaseModel):
    id: str
    type: str
    name: str
    parts: List[Part]
    position: List[float]
    scale: List[float]
    castShadow: bool = True
    receiveShadow: bool = True
    metadata: Optional[dict] = None

class GenerationRequest(BaseModel):
    prompt: Optional[str] = ""
    color: Optional[str] = "#8b5cf6"
    use_camera: Optional[bool] = False

# --- Camera Controller ---

class CameraManager:
    def __init__(self):
        self.cap = None

    def get_frame(self):
        if self.cap is None or not self.cap.isOpened():
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                return None
        
        ret, frame = self.cap.read()
        if not ret:
            return None
        return cv2.flip(frame, 1)

    def release(self):
        if self.cap:
            self.cap.release()
            self.cap = None

camera_manager = CameraManager()

# --- Endpoints ---

@app.post("/generate", response_model=ModelResponse)
async def generate(data: GenerationRequest):
    # Offloading all synthesis logic to src/hooks/useAIEngine.py
    frame = None
    if data.use_camera:
        frame = camera_manager.get_frame()
        
    result = ai_engine.synthesize(data.prompt, frame, data.color)
    return ModelResponse(**result)

@app.websocket("/ws/gestures")
async def websocket_gestures(websocket: WebSocket):
    await websocket.accept()
    print("[AetherForge] Python Native Hook Connection: ENGAGED")
    
    try:
        while True:
            frame = camera_manager.get_frame()
            if frame is None:
                await asyncio.sleep(0.1)
                continue
            
            # Offloading all hand tracking logic to src/hooks/useHands.py
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            payload = hand_engine.process_frame(rgb_frame)
            
            # Encode frame for frontend video display (Holographic MJPEG)
            _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 65])
            payload["image"] = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
            
            # Send back to React
            await websocket.send_json(payload)
            
            # Throttle for ~30 FPS stability
            await asyncio.sleep(0.033) 
            
    except WebSocketDisconnect:
        print("[AetherForge] Python Native Hook Connection: CLOSED")
    finally:
        camera_manager.release()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
