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
        
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        hand_size = self.dist(wrist, landmarks[9]) or 0.1
        
        pinch_dist = self.dist(thumb_tip, index_tip)
        if pinch_dist < hand_size * 0.4:
            return "PINCH"
        
        tips = [index_tip, middle_tip, ring_tip, pinky_tip]
        is_grab = all(self.dist(tip, wrist) < hand_size * 1.1 for tip in tips)
        if is_grab:
            return "GRAB"
            
        if thumb_tip.y < landmarks[3].y and thumb_tip.y < landmarks[2].y:
            if all(self.dist(t, wrist) < hand_size * 1.6 for t in tips):
                return "THUMBS_UP"
                
        if self.dist(index_tip, wrist) > hand_size * 1.5 and self.dist(middle_tip, wrist) > hand_size * 1.5:
            if self.dist(ring_tip, wrist) < hand_size * 1.2:
                return "PEACE"

        return "IDLE"

# Instance singleton
hand_engine = HandPulseEngine()
