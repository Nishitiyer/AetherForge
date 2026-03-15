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
