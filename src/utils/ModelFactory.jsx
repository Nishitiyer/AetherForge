/**
 * ModelFactory.js
 * Programmatic construction of 3D models using Three.js primitives.
 * This ensures "exact" models rather than AI-generated approximations.
 */

export const MODEL_TEMPLATES = {
  CUBE: (color = '#8b5cf6') => ({
    type: 'Mesh',
    name: 'Cube',
    parts: [{ type: 'Box', position: [0, 0, 0], scale: [1, 1, 1], color }]
  }),

  UVSPHERE: (color = '#ffffff') => ({
    type: 'Mesh',
    name: 'UV Sphere',
    parts: [{ type: 'Sphere', position: [0, 0, 0], scale: [1, 1, 1], color, detail: 32 }]
  }),

  ICOSPHERE: (color = '#ffffff') => ({
    type: 'Mesh',
    name: 'Ico Sphere',
    parts: [{ type: 'Sphere', position: [0, 0, 0], scale: [1, 1, 1], color, isIco: true, detail: 2 }]
  }),

  CYLINDER: (color = '#94a3b8') => ({
    type: 'Mesh',
    name: 'Cylinder',
    parts: [{ type: 'Cylinder', position: [0, 0, 0], scale: [1, 1, 1], color }]
  }),

  CONE: (color = '#94a3b8') => ({
    type: 'Mesh',
    name: 'Cone',
    parts: [{ type: 'Cone', position: [0, 0, 0], scale: [1, 1, 1], color }]
  }),

  TORUS: (color = '#94a3b8') => ({
    type: 'Mesh',
    name: 'Torus',
    parts: [{ type: 'Torus', position: [0, 0, 0], scale: [1, 1, 1], color }]
  }),

  GRID: (color = '#475569') => ({
    type: 'Mesh',
    name: 'Grid',
    parts: [{ type: 'Plane', position: [0, 0, 0], scale: [2, 2, 1], color, segments: 10, rotation: [-Math.PI / 2, 0, 0] }]
  }),

  MONKEY: (color = '#8b5cf6') => ({
    type: 'Group',
    name: 'Suzanne',
    parts: [
      { type: 'Sphere', position: [0, 0, 0], scale: [0.6, 0.5, 0.4], color }, // Head
      { type: 'Sphere', position: [-0.4, 0.1, 0.1], scale: [0.2, 0.2, 0.1], color }, // Ear L
      { type: 'Sphere', position: [0.4, 0.1, 0.1], scale: [0.2, 0.2, 0.1], color }, // Ear R
      { type: 'Sphere', position: [-0.15, 0.1, 0.3], scale: [0.1, 0.1, 0.1], color: '#fff', name: 'EyeL' }, // Eye L
      { type: 'Sphere', position: [0.15, 0.1, 0.3], scale: [0.1, 0.1, 0.1], color: '#fff', name: 'EyeR' }, // Eye R
      { type: 'Box', position: [0, -0.1, 0.3], scale: [0.2, 0.1, 0.2], color: '#d1d5db' }, // Snout
    ]
  }),

  // Curve Objects
  BEZIER_CURVE: (color = '#00f2fe') => ({
    type: 'Curve',
    name: 'Bezier Curve',
    parts: [{ type: 'Torus', position: [0, 0, 0], scale: [1, 0.05, 1], color, arc: Math.PI / 2 }]
  }),

  BEZIER_CIRCLE: (color = '#00f2fe') => ({
    type: 'Curve',
    name: 'Bezier Circle',
    parts: [{ type: 'Torus', position: [0, 0, 0], scale: [1, 0.02, 1], color }]
  }),

  PATH: (color = '#00f2fe') => ({
    type: 'Curve',
    name: 'Path',
    parts: [{ type: 'Box', position: [0, 0, 0], scale: [2, 0.01, 0.01], color }]
  }),

  // Surface
  NURBS_SPHERE: (color = '#0ea5e9') => ({
    type: 'Surface',
    name: 'NURBS Sphere',
    parts: [{ type: 'Sphere', position: [0, 0, 0], scale: [1, 1, 1], color, opacity: 0.8 }]
  }),

  // Metaballs
  METABALL: (color = '#f59e0b') => ({
    type: 'Metaball',
    name: 'Metaball',
    parts: [{ type: 'Sphere', position: [0, 0, 0], scale: [1, 1, 1], color, isMeta: true }]
  }),

  // Text
  TEXT: (color = '#ffffff') => ({
    type: 'Mesh',
    name: 'Text',
    parts: [{ type: 'Box', position: [0, 0, 0], scale: [1.5, 0.5, 0.1], color, isText: true }]
  }),

  // Light Objects
  LIGHT_POINT: (color = '#ffcc00') => ({
    type: 'Light',
    name: 'Point Light',
    parts: [{ type: 'Sphere', position: [0, 0, 0], scale: [0.1, 0.1, 0.1], color, emissive: color, emissiveIntensity: 2 }]
  }),

  LIGHT_SUN: (color = '#ffffff') => ({
    type: 'Light',
    name: 'Sun Light',
    parts: [{ type: 'Cylinder', position: [0, 2, 0], scale: [0.05, 1, 0.05], color, emissive: color, emissiveIntensity: 1 }]
  }),

  LIGHT_SPOT: (color = '#ffffff') => ({
    type: 'Light',
    name: 'Spot Light',
    parts: [{ type: 'Cone', position: [0, 2, 0], scale: [0.2, 0.4, 0.2], color, emissive: color, emissiveIntensity: 1 }]
  }),

  LIGHT_AREA: (color = '#ffffff') => ({
    type: 'Light',
    name: 'Area Light',
    parts: [{ type: 'Plane', position: [0, 2, 0], scale: [1, 1, 1], color, emissive: color, emissiveIntensity: 0.8 }]
  }),

  // Empty
  EMPTY_PLAIN: () => ({
    type: 'Empty',
    name: 'Empty',
    parts: [{ type: 'Box', position: [0, 0, 0], scale: [0.1, 0.1, 0.1], color: '#ffffff', opacity: 0.5, wireframe: true }]
  }),

  CAMERA: () => ({
    type: 'Camera',
    name: 'Camera',
    parts: [
      { type: 'Box', position: [0, 0, 0], scale: [0.5, 0.3, 0.4], color: '#444' },
      { type: 'Cone', position: [0, 0, 0.3], scale: [0.2, 0.3, 0.2], color: '#222', rotation: [Math.PI / 2, 0, 0] }
    ]
  }),
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
    scale: [1, 1, 1],
    animation: p.includes('walk') ? { type: 'Walk', speed: 2 } : 
               p.includes('wave') ? { type: 'Wave', speed: 3 } : 
               { type: 'Idle', speed: 1 }
  };
};

/**
 * ANIMATION_LOGIC: Defines how primitive types/names react to animation states.
 */
export const applyAnimation = (parts, animation, time) => {
  return parts.map(part => {
    const newPos = [...part.position];
    const newRot = part.rotation ? [...part.rotation] : [0, 0, 0];

    if (animation.type === 'Walk') {
      if (part.name?.includes('LegL')) newPos[2] = Math.sin(time * animation.speed) * 0.3;
      if (part.name?.includes('LegR')) newPos[2] = Math.cos(time * animation.speed) * 0.3;
      if (part.name?.includes('ArmL')) newPos[2] = Math.cos(time * animation.speed) * 0.2;
      if (part.name?.includes('ArmR')) newPos[2] = Math.sin(time * animation.speed) * 0.2;
    }

    if (animation.type === 'Wave') {
      if (part.name === 'ArmR') {
        newRot[0] = -Math.PI / 2;
        newPos[0] = 0.5 + Math.sin(time * animation.speed) * 0.1;
        newPos[1] = 1.3 + Math.cos(time * animation.speed) * 0.1;
      }
    }

    if (animation.type === 'Idle') {
      newPos[1] += Math.sin(time * animation.speed) * 0.01;
    }

    return { ...part, position: newPos, rotation: newRot };
  });
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
