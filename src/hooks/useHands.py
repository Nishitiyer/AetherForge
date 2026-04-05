'''
AetherForge: Stark-Grade Python Neural Hook (Neural Interface)
Logic Engine for useHands. Using the advanced MediaPipe Tasks API.
'''

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import math
import os

class HandPulseEngine:
    def __init__(self, model_filename='hand_landmarker.task'):
        # Fix: find the model relative to this file or server folder
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
    
    def dist(self, p1, p2):
        return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)
    
    def process_frame(self, frame_np):
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_np)
        results = self.detector.detect(mp_image)
        
        payload = {
            "gestures": [],
            "landmarksList": [],
            "handPosList": [],
            "confidenceList": []
        }
        
        if results.hand_landmarks:
            for i, landmarks in enumerate(results.hand_landmarks):
                # 1. Classification
                gesture = self.classify(landmarks)
                
                # 2. Extract relative positions
                lms = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in landmarks]
                
                # Use Index Finger Tip (8) as main point
                hp = {
                    "x": 1.0 - landmarks[8].x, 
                    "y": landmarks[8].y, 
                    "z": landmarks[8].z,
                    "vx": 0, "vy": 0, "vz": 0, "v": 0
                }
                
                payload["gestures"].append(gesture)
                payload["landmarksList"].append(lms)
                payload["handPosList"].append(hp)
                payload["confidenceList"].append(results.hand_score[i] if results.hand_score else 0.9)
                
        return payload

    def classify(self, landmarks):
        """Advanced JARVIS-grade gesture logic."""
        if not landmarks or len(landmarks) < 21:
            return "IDLE"
        
        # 0. Benchmarks & Distances
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        hand_size = self.dist(wrist, landmarks[9]) or 0.1
        
        # Helper: Is finger extended?
        def is_ext(tip, base): 
            return self.dist(tip, wrist) > self.dist(base, wrist) * 1.2

        ix_ext = is_ext(index_tip, landmarks[6])
        md_ext = is_ext(middle_tip, landmarks[10])
        rg_ext = is_ext(ring_tip, landmarks[14])
        pk_ext = is_ext(pinky_tip, landmarks[18])

        # 1. PINCH Protocol (Thumb + Index)
        pinch_dist = self.dist(thumb_tip, index_tip)
        if pinch_dist < hand_size * 0.4:
            return "PINCH"
        
        # 2. GRAB/FIST Protocol
        if not any([ix_ext, md_ext, rg_ext, pk_ext]):
            return "GRAB"
            
        # 3. PALM (All Open)
        if all([ix_ext, md_ext, rg_ext, pk_ext]):
             # Check if thumb also out
             if self.dist(thumb_tip, landmarks[13]) > hand_size * 1.2:
                 return "PALM"
            
        # 4. POINT (Only Index)
        if ix_ext and not any([md_ext, rg_ext, pk_ext]):
            return "POINT"
            
        # 5. PEACE / V_SIGN
        if ix_ext and md_ext and not rg_ext and not pk_ext:
            return "PEACE"

        # 6. ROCK_ON (Index + Pinky)
        if ix_ext and pk_ext and not md_ext and not rg_ext:
            return "ROCK_ON"
            
        # 7. L_SIGN (Thumb + Index)
        if ix_ext and self.dist(thumb_tip, landmarks[2]) > hand_size * 1.3:
            if not any([md_ext, rg_ext, pk_ext]):
                return "L_SIGN"

        # 8. THUMBS_UP
        if thumb_tip.y < landmarks[3].y and thumb_tip.y < landmarks[2].y:
            if not any([ix_ext, md_ext, rg_ext, pk_ext]):
                return "THUMBS_UP"

        # 9. C_SIGN (Cube / Claw)
        if ix_ext and md_ext and rg_ext and pk_ext:
            if self.dist(thumb_tip, index_tip) > hand_size * 0.7:
                 return "C_SIGN"

        # 10. O_SIGN (Circle / Sphere)
        if self.dist(thumb_tip, index_tip) < hand_size * 0.2:
             if md_ext and rg_ext: # Fingers open above the circle
                 return "O_SIGN"
                 
        # 11. T_SIGN (Torus / Right Angle)
        if ix_ext and self.dist(thumb_tip, landmarks[2]) > hand_size * 1.2:
            if not any([md_ext, rg_ext, pk_ext]):
                return "T_SIGN"

        return "IDLE"

# Instance singleton
hand_engine = HandPulseEngine()
