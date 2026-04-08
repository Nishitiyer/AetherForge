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
        # ... existing init code ...
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
        
        # AIR DRAWING & KINETIC STATE
        self.drawing_buffer = [] 
        self.is_drawing = False
        self.last_hp = [None, None] # To track velocity
        self.last_timestamp = 0

    def dist(self, p1, p2):
        # MediaPipe landmarks can be objects with x,y,z or dicts
        try:
            return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)
        except AttributeError:
            return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2 + (p1['z'] - p2['z'])**2)

    def calculate_velocity(self, current_hp, hand_idx):
        if self.last_hp[hand_idx] is None:
            return 0, 0, 0
        
        # Calculate deltas (1.0 = full screen)
        dx = current_hp['x'] - self.last_hp[hand_idx]['x']
        dy = current_hp['y'] - self.last_hp[hand_idx]['y']
        
        # Scale for JARVIS-grade sensitivity (matching Editor.jsx 120 threshold)
        # Assuming 30fps, 1.0 unit across screen should be high velocity
        vx = dx * 1000 
        vy = dy * 1000
        v = math.sqrt(vx**2 + vy**2)
        
        return vx, vy, v

    def process_frame(self, frame_np):
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_np)
        results = self.detector.detect(mp_image)
        
        payload = {
            "gestures": [],
            "landmarksList": [],
            "handPosList": [],
            "confidenceList": [],
            "drawnShape": None 
        }
        
        if results.hand_landmarks:
            for i, landmarks in enumerate(results.hand_landmarks):
                gesture = self.classify(landmarks)
                lms = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in landmarks]
                
                # Raw position (Index tip)
                hp_now = {"x": 1.0 - landmarks[8].x, "y": landmarks[8].y, "z": landmarks[8].z}
                
                # Velocity synthesis
                vx, vy, v = self.calculate_velocity(hp_now, i)
                hp_now.update({"vx": vx, "vy": vy, "v": v})
                
                # Update history
                self.last_hp[i] = hp_now
                
                # --- AIR DRAWING PROTOCOL ---
                if i == 0: 
                    if gesture == "POINT":
                        self.is_drawing = True
                        self.drawing_buffer.append((hp_now['x'], hp_now['y']))
                        if len(self.drawing_buffer) > 100: self.drawing_buffer.pop(0)
                    else:
                        if self.is_drawing and len(self.drawing_buffer) > 10:
                            payload["drawnShape"] = self.analyze_drawn_path()
                            self.drawing_buffer = []
                            self.is_drawing = False
                
                payload["gestures"].append(gesture)
                payload["landmarksList"].append(lms)
                payload["handPosList"].append(hp_now)
                
                score = 0.9
                if results.handedness and i < len(results.handedness):
                    score = results.handedness[i][0].score
                payload["confidenceList"].append(score)
        else:
            # Clear history if hands lost
            self.last_hp = [None, None]
                
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
        
        # Base of fingers for extension check
        thumb_ip = landmarks[3]
        index_mcp = landmarks[5]
        middle_mcp = landmarks[9]
        ring_mcp = landmarks[13]
        pinky_mcp = landmarks[17]

        hand_size = self.dist(wrist, middle_mcp) or 0.1
        
        def is_ext(tip, mcp): return self.dist(tip, wrist) > self.dist(mcp, wrist) * 1.15
        
        ix_ext = is_ext(index_tip, index_mcp)
        md_ext = is_ext(middle_tip, middle_mcp)
        rg_ext = is_ext(ring_tip, ring_mcp)
        pk_ext = is_ext(pinky_tip, pinky_mcp)
        th_ext = is_ext(thumb_tip, thumb_ip)

        # 1. PINCH / OK (Precision checks)
        dist_th_ix = self.dist(thumb_tip, index_tip)
        if dist_th_ix < hand_size * 0.3:
            if md_ext and rg_ext and pk_ext: return "OK"
            return "PINCH"

        # 2. GRAB / FIST (All closed)
        if not any([ix_ext, md_ext, rg_ext, pk_ext]):
            return "GRAB"

        # 3. THUMBS UP / DOWN
        if th_ext and not any([ix_ext, md_ext, rg_ext, pk_ext]):
            if thumb_tip.y < thumb_ip.y: return "THUMBS_UP"
            return "THUMBS_DOWN"

        # 4. GUN (L-SIGN) - Thumb and Index extended
        if th_ext and ix_ext and not any([md_ext, rg_ext, pk_ext]):
            return "GUN"

        # 5. POINT
        if ix_ext and not any([md_ext, rg_ext, pk_ext]): return "POINT"

        # 6. PEACE
        if ix_ext and md_ext and not rg_ext and not pk_ext: return "PEACE"

        # 7. ROCK ON
        if ix_ext and pk_ext and not md_ext and not rg_ext: return "ROCK_ON"

        # 8. PALM / STOP
        if ix_ext and md_ext and rg_ext and pk_ext: return "PALM"
        
        return "IDLE"

hand_engine = HandPulseEngine()
