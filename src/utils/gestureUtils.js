/** Distance helper */
export const dist = (p1, p2) => {
  if (!p1 || !p2) return 0;
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

/**
 * Classify gestures based on 3D landmarks.
 * Works with MediaPipe HandLandmarker results.
 */
export const classifyGesture = (points) => {
  if (!points || points.length < 21) return 'NONE';

  // Tip and base indices for classification
  const thumbTip = points[4], thumbBase = points[2];
  const indexTip = points[8], indexBase = points[6];
  const wrist = points[0];

  // Scale normalization for distant hands (Wrist to Middle Knuckle distance as anchor)
  const handSize = dist(wrist, points[9]) || 0.1; 

  // 1. PINCH (Index Tip to Thumb Tip) 
  const pinchDistance = dist(indexTip, thumbTip);
  const areOthersOpenPinch = [12, 16, 20].every(idx => dist(points[idx], wrist) > handSize * 1.1);
  if (pinchDistance < handSize * 0.4 && areOthersOpenPinch) return 'PINCH'; 

  // 2. GRAB / FIST (All tips collected near wrist)
  const isFist = [8, 12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 1.0);
  if (isFist) return 'GRAB';

  // 3. GUN (Thumb & Index extended, others closed)
  const isThumbExt = dist(thumbTip, wrist) > handSize * 1.2;
  const isIndexExt = dist(indexTip, wrist) > handSize * 1.2;
  const isOthersClosedGun = [12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 1.0);
  if (isThumbExt && isIndexExt && isOthersClosedGun) return 'GUN';

  // 4. THUMBS_UP (Thumb up, others in fist)
  const isThumbUp = thumbTip.y < thumbBase.y - (handSize * 0.3);
  const areOthersFist = [8, 12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 0.9);
  if (isThumbUp && areOthersFist) return 'THUMBS_UP';

  // 5. PEACE
  const isPeaceIndex = dist(points[8], wrist) > handSize * 1.2;
  const isPeaceMiddle = dist(points[12], wrist) > handSize * 1.2;
  const isRingClosed = dist(points[16], wrist) < handSize * 0.9;
  const isPinkyClosed = dist(points[20], wrist) < handSize * 0.9;
  if (isPeaceIndex && isPeaceMiddle && isRingClosed && isPinkyClosed) return 'PEACE';

  // 6. POINT
  const isPointIndex = dist(indexTip, indexBase) > handSize * 0.8;
  const areOthersClosed = [12, 16, 20].every(idx => dist(points[idx], wrist) < handSize * 0.95);
  if (isPointIndex && areOthersClosed) return 'POINT';

  // 7. SPREAD / OPEN
  const isSpread = [8, 12, 16, 20].every(idx => dist(points[idx], wrist) > handSize * 1.4);
  if (isSpread) return 'SPREAD';

  return 'IDLE';
};

/** JARVIS: Calculate distance between two points in 3D (normalized 0-1 range) */
export const calculateHandDistance = (h1, h2) => {
  if (!h1 || !h2) return 0;
  return Math.sqrt((h1.x - h2.x)**2 + (h1.y - h2.y)**2 + (h1.z - h2.z)**2);
};

/** JARVIS: Calculate midpoint between two hands */
export const calculateHandMidpoint = (h1, h2) => {
  if (!h1 || !h2) return { x: 0.5, y: 0.5, z: 0 };
  return {
    x: (h1.x + h2.x) / 2,
    y: (h1.y + h2.y) / 2,
    z: (h1.z + h2.z) / 2
  };
};

/** Simple lerp for smooth vector transitions */
export const lerp = (v1, v2, alpha) => v1 + (v2 - v1) * alpha;

/** Calculate direction of velocity for 'Flick' actions */
export const getVelocityVector = (h, prevH) => {
  if (!h || !prevH) return { vx: 0, vy: 0, vz: 0 };
  return {
    vx: (h.x - prevH.x) * 100,
    vy: (h.y - prevH.y) * 100,
    vz: (h.z - prevH.z) * 100
  };
};
