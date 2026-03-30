import { classifyGesture } from './gestureUtils.js';

/** Precise mock factory for landmarks */
const createLandmarks = (wrist, thumbTip, indexTip, middleTip, ringTip, pinkyTip, midKnuckle) => {
  const pts = Array(21).fill(0).map(() => ({ x: 0, y: 0, z: 0 }));
  pts[0]  = wrist;
  pts[4]  = thumbTip;
  pts[2]  = { x: thumbTip.x, y: thumbTip.y + 0.05, z: 0 }; // Thumb base closer to tip
  pts[8]  = indexTip;
  pts[6]  = { x: indexTip.x, y: indexTip.y + 0.1, z: 0 }; // Index base
  pts[12] = middleTip;
  pts[10] = { x: middleTip.x, y: middleTip.y + 0.1, z: 0 };
  pts[16] = ringTip;
  pts[14] = { x: ringTip.x, y: ringTip.y + 0.1, z: 0 };
  pts[20] = pinkyTip;
  pts[18] = { x: pinkyTip.x, y: pinkyTip.y + 0.1, z: 0 };
  pts[9]  = midKnuckle || { x: 0, y: -0.2, z: 0 }; // Middle knuckle for handSize
  return pts;
};

const runTests = () => {
  console.log('--- AetherForge Gesture Engine Unit Tests ---');
  let passed = 0;
  let total = 0;

  const test = (name, pts, expected) => {
    total++;
    const result = classifyGesture(pts);
    if (result === expected) {
      console.log(`✅ [PASS] ${name}: ${result}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}: Expected ${expected}, got ${result}`);
    }
  };

  const wrist = { x: 0, y: 0, z: 0 };
  const midKnuckle = { x: 0, y: -0.2, z: 0 }; // handSize = 0.2

  // 1. GRAB (All fingers near wrist)
  test('GRAB (Fist)', createLandmarks(
    wrist, {x:0.02, y:0.02, z:0}, {x:0.03, y:0.03, z:0}, {x:0.04, y:0.04, z:0}, {x:0.05, y:0.05, z:0}, {x:0.06, y:0.06, z:0}, midKnuckle
  ), 'GRAB');

  // 2. SPREAD (All fingers far)
  test('SPREAD (Open)', createLandmarks(
    wrist, {x:0.4, y:0.4, z:0}, {x:0.5, y:0.5, z:0}, {x:0.6, y:0.6, z:0}, {x:0.7, y:0.7, z:0}, {x:0.8, y:0.8, z:0}, midKnuckle
  ), 'SPREAD');

  // 3. PINCH (Thumb/Index touching, others open)
  test('PINCH', createLandmarks(
    wrist, {x:0.01, y:0.01, z:0}, {x:0.02, y:0.02, z:0}, {x:0.5, y:0.5, z:0}, {x:0.5, y:0.5, z:0}, {x:0.5, y:0.5, z:0}, midKnuckle
  ), 'PINCH');

  // 4. GUN (Thumb/Index extended, others closed)
  test('GUN', createLandmarks(
    wrist, 
    {x:0.3, y:0.3, z:0}, {x:0.5, y:0.5, z:0}, // Extended
    {x:0.05, y:0.05, z:0}, {x:0.05, y:0.05, z:0}, {x:0.05, y:0.05, z:0}, // Closed
    midKnuckle
  ), 'GUN');

  console.log('-------------------------------------------');
  console.log(`Results: ${passed}/${total} tests passed.`);
  process.exit(passed === total ? 0 : 1);
};

runTests();
