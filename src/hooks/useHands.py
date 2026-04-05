'''
AetherForge: Stark-Grade Python Neural Hook (Neural Interface)
Logic Engine for useHands. Handles MediaPipe 3D Tracking, Gesture Classification, and Air-Drawing Recognition.
'''

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import math
import os
import numpy as np

class HandPulseEngine:
    def __init__(self, model_filename='hand_landmarker.task'):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, 'server', model_filename)
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"MediaPipe Vision Model missing: {model_path}")

        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=2,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.detector = vision.HandLandmarker.create_from_options(options)
        
        # AIR DRAWING STATE
        self.drawing_buffer = []  # Buffer for current stroke
        self.is_drawing = False
        self.drawing_cooldown = 0
    
    def dist(self, p1, p2):
        return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)
    
    def process_frame(self, frame_np):
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_np)
        results = self.detector.detect(mp_image)
        
        payload = {
            "gestures": [],
            "landmarksList": [],
            "handPosList": [],
            "confidenceList": [],
            "drawnShape": None  # Shape detected from buffer
        }
        
        if results.hand_landmarks:
            for i, landmarks in enumerate(results.hand_landmarks):
                gesture = self.classify(landmarks)
                lms = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in landmarks]
                hp = {"x": 1.0 - landmarks[8].x, "y": landmarks[8].y, "z": landmarks[8].z, "vx": 0, "vy": 0}
                
                # --- AIR DRAWING PROTOCOL ---
                if i == 0: # Only primary hand draws
                    if gesture == "POINT":
                        self.is_drawing = True
                        self.drawing_buffer.append((hp['x'], hp['y']))
                        # Limit buffer to last 100 points
                        if len(self.drawing_buffer) > 100: self.drawing_buffer.pop(0)
                    else:
                        if self.is_drawing and len(self.drawing_buffer) > 10:
                            payload["drawnShape"] = self.analyze_drawn_path()
                            self.drawing_buffer = []
                            self.is_drawing = False
                
                payload["gestures"].append(gesture)
                payload["landmarksList"].append(lms)
                payload["handPosList"].append(hp)
                payload["confidenceList"].append(results.hand_score[i] if results.hand_score else 0.9)
                
        return payload

    def analyze_drawn_path(self):
        """Standard JARVIS-grade shape recognition (Circle/Square/Triangle)."""
        if not self.drawing_buffer: return None
        
        pts = np.array(self.drawing_buffer)
        mn, mx = pts.min(axis=0), pts.max(axis=0)
        w, h = mx[0]-mn[0], mx[1]-mn[1]
        
        # 1. CIRCLE DETECTION (AspectRatio + Center Distance Variance)
        aspect = w / h if h != 0 else 1
        if 0.7 < aspect < 1.3:
            center = pts.mean(axis=0)
            dists = np.sqrt(np.sum((pts - center)**2, axis=1))
            variance = np.std(dists) / np.mean(dists)
            if variance < 0.15: return "sphere"
            
        # 2. SQUARE/BOX DETECTION
        if 0.8 < aspect < 1.2:
             return "box"
             
        # 3. TRIANGLE/CONE DETECTION
        # Check if narrow top
        top_slice = pts[pts[:, 1] < mn[1] + h*0.2]
        if len(top_slice) > 0:
            top_w = top_slice[:, 0].max() - top_slice[:, 0].min()
            if top_w < w * 0.3: return "cone"

        return "unknown"

    def classify(self, landmarks):
        if not landmarks or len(landmarks) < 21: return "IDLE"
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        hand_size = self.dist(wrist, landmarks[9]) or 0.1
        
        def is_ext(tip, base): return self.dist(tip, wrist) > self.dist(base, wrist) * 1.2
        ix_ext, md_ext, rg_ext, pk_ext = is_ext(index_tip, landmarks[6]), is_ext(middle_tip, landmarks[10]), is_ext(ring_tip, landmarks[14]), is_ext(pinky_tip, landmarks[18])

        if self.dist(thumb_tip, index_tip) < hand_size * 0.4: return "PINCH"
        if not any([ix_ext, md_ext, rg_ext, pk_ext]): return "GRAB"
        if ix_ext and not any([md_ext, rg_ext, pk_ext]): return "POINT"
        if ix_ext and md_ext and not rg_ext and not pk_ext: return "PEACE"
        if ix_ext and pk_ext and not md_ext and not rg_ext: return "ROCK_ON"
        if ix_ext and pk_ext and md_ext and rg_ext: return "PALM"
        
        return "IDLE"

hand_engine = HandPulseEngine()
