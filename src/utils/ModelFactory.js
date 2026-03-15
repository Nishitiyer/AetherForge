/**
 * ModelFactory.js
 * Programmatic construction of 3D models using Three.js primitives.
 * This ensures "exact" models rather than AI-generated approximations.
 */

export const MODEL_TEMPLATES = {
  TABLE: (color = '#8b4513') => ({
    type: 'Group',
    name: 'Table',
    parts: [
      { type: 'Box', position: [0, 0.75, 0], scale: [2, 0.1, 1.2], color }, // Top
      { type: 'Box', position: [-0.9, 0.35, -0.5], scale: [0.1, 0.7, 0.1], color }, // Leg 1
      { type: 'Box', position: [0.9, 0.35, -0.5], scale: [0.1, 0.7, 0.1], color }, // Leg 2
      { type: 'Box', position: [-0.9, 0.35, 0.5], scale: [0.1, 0.7, 0.1], color }, // Leg 3
      { type: 'Box', position: [0.9, 0.35, 0.5], scale: [0.1, 0.7, 0.1], color }, // Leg 4
    ]
  }),

  CHAIR: (color = '#4b3621') => ({
    type: 'Group',
    name: 'Chair',
    parts: [
      { type: 'Box', position: [0, 0.45, 0], scale: [0.5, 0.1, 0.5], color }, // Seat
      { type: 'Box', position: [0, 0.75, -0.2], scale: [0.5, 0.6, 0.05], color }, // Back
      { type: 'Box', position: [-0.2, 0.2, -0.2], scale: [0.05, 0.4, 0.05], color }, // Leg 1
      { type: 'Box', position: [0.2, 0.2, -0.2], scale: [0.05, 0.4, 0.05], color }, // Leg 2
      { type: 'Box', position: [-0.2, 0.2, 0.2], scale: [0.05, 0.4, 0.05], color }, // Leg 3
      { type: 'Box', position: [0.2, 0.2, 0.2], scale: [0.05, 0.4, 0.05], color }, // Leg 4
    ]
  }),

  ROBOT: (color = '#94a3b8') => ({
    type: 'Group',
    name: 'Robot',
    parts: [
      { type: 'Box', position: [0, 1, 0], scale: [0.6, 0.8, 0.4], color }, // Torso
      { type: 'Box', position: [0, 1.6, 0], scale: [0.4, 0.4, 0.4], color: '#6366f1' }, // Head
      { type: 'Box', position: [-0.4, 1.1, 0], scale: [0.2, 0.6, 0.2], color }, // L Arm
      { type: 'Box', position: [0.4, 1.1, 0], scale: [0.2, 0.6, 0.2], color }, // R Arm
      { type: 'Box', position: [-0.2, 0.3, 0], scale: [0.2, 0.6, 0.2], color }, // L Leg
      { type: 'Box', position: [0.2, 0.3, 0], scale: [0.2, 0.6, 0.2], color }, // R Leg
    ]
  }),

  STAIRS: (color = '#cbd5e1') => ({
    type: 'Group',
    name: 'Stairs',
    parts: Array.from({ length: 5 }, (_, i) => ({
      type: 'Box',
      position: [0, i * 0.2, i * 0.2],
      scale: [1, 0.2, 0.2],
      color
    }))
  })
};

// Advanced primitives mapping
export const PRIMITIVES = {
  Box: (args = [1, 1, 1]) => <boxGeometry args={args} />,
  Sphere: (args = [1, 32, 32]) => <sphereGeometry args={args} />,
  Cylinder: (args = [0.5, 0.5, 1, 32]) => <cylinderGeometry args={args} />,
  Cone: (args = [0.5, 1, 32]) => <coneGeometry args={args} />,
  Torus: (args = [0.5, 0.2, 16, 100]) => <torusGeometry args={args} />,
};

/**
 * assembleFromAI: Parses a text prompt into a set of primitive instructions.
 * For now, this uses a robust mapping to simulate the "Exact" construction
 * the user expects, ensuring it's always editable.
 */
export const assembleFromAI = (prompt, color = '#8b5cf6') => {
  const p = prompt.toLowerCase();
  let parts = [];
  let name = "AI Construction";

  if (p.includes('robot')) {
    name = "Exact Robot";
    parts = MODEL_TEMPLATES.ROBOT(color).parts;
  } else if (p.includes('table')) {
    name = "Exact Table";
    parts = MODEL_TEMPLATES.TABLE(color).parts;
  } else if (p.includes('chair')) {
    name = "Exact Chair";
    parts = MODEL_TEMPLATES.CHAIR(color).parts;
  } else if (p.includes('pillar') || p.includes('column')) {
    name = "Exact Column";
    parts = [
      { type: 'Cylinder', position: [0, 1, 0], scale: [0.5, 2, 0.5], color },
      { type: 'Box', position: [0, 0.1, 0], scale: [0.8, 0.2, 0.8], color },
      { type: 'Box', position: [0, 2, 0], scale: [0.8, 0.2, 0.8], color },
    ];
  } else {
    // Basic Fallback: A clever assembly of a "Model"
    name = "Custom Assembly";
    parts = [
      { type: 'Box', position: [0, 0.5, 0], scale: [1, 1, 1], color },
      { type: 'Sphere', position: [0, 1.25, 0], scale: [0.5, 0.5, 0.5], color: '#ffffff' }
    ];
  }

  return {
    id: `ai-${Math.random().toString(36).substr(2, 9)}`,
    type: 'Group',
    name,
    parts,
    position: [0, 0, 0],
    scale: [1, 1, 1]
  };
};

export const createModel = (templateKey, color) => {
  if (MODEL_TEMPLATES[templateKey]) {
    return {
      id: `model-${Math.random().toString(36).substr(2, 9)}`,
      ...MODEL_TEMPLATES[templateKey](color),
      position: [0, 0, 0],
      scale: [1, 1, 1],
    };
  }
  return null;
};
