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
      { type: 'Sphere', position: [-0.1, 1.65, 0.2], scale: [0.05, 0.05, 0.05], color: '#ffffff', name: 'EyeL' },
      { type: 'Sphere', position: [0.1, 1.65, 0.2], scale: [0.05, 0.05, 0.05], color: '#ffffff', name: 'EyeR' },
      { type: 'Box', position: [-0.4, 1.1, 0], scale: [0.2, 0.6, 0.2], color, name: 'ArmL' }, // L Arm
      { type: 'Box', position: [0.4, 1.1, 0], scale: [0.2, 0.6, 0.2], color, name: 'ArmR' }, // R Arm
      { type: 'Box', position: [-0.2, 0.3, 0], scale: [0.2, 0.6, 0.2], color, name: 'LegL' }, // L Leg
      { type: 'Box', position: [0.2, 0.3, 0], scale: [0.2, 0.6, 0.2], color, name: 'LegR' }, // R Leg
    ],
    animation: { type: 'Idle', amplitude: 0.1, speed: 1 }
  }),

  HUMANOID: (color = '#fde68a', isWoman = false) => ({
    type: 'Group',
    name: isWoman ? 'Woman' : 'Man',
    parts: [
      { type: 'Box', position: [0, 1.1, 0], scale: [isWoman ? 0.4 : 0.6, 0.7, 0.3], color: '#334155' }, // Torso
      { type: 'Sphere', position: [0, 1.6, 0.05], scale: [0.25, 0.28, 0.25], color }, // Head
      { type: 'Box', position: [-0.35, 1.2, 0], scale: [0.15, 0.6, 0.15], color }, // L Arm
      { type: 'Box', position: [0.35, 1.2, 0], scale: [0.15, 0.6, 0.15], color }, // R Arm
      { type: 'Box', position: [-0.18, 0.4, 0], scale: [0.18, 0.8, 0.18], color: '#1e293b' }, // L Leg
      { type: 'Box', position: [0.18, 0.4, 0], scale: [0.18, 0.8, 0.18], color: '#1e293b' }, // R Leg
      { type: 'Sphere', position: [0, 1.58, 0.1], scale: [0.22, 0.2, 0.22], color: isWoman ? '#4c1d95' : '#1e1b4b', name:'Hair' }
    ]
  }),

  BLASTER: (color = '#475569') => ({
    type: 'Group',
    name: 'Tactical Blaster',
    parts: [
      { type: 'Box', position: [0, 0, 0], scale: [0.2, 0.35, 0.7], color }, // Body
      { type: 'Cylinder', position: [0, 0.08, 0.55], scale: [0.09, 0.6, 0.09], color: '#1e293b', rotation: [Math.PI/2, 0, 0] }, // Barrel
      { type: 'Box', position: [0, -0.3, -0.15], scale: [0.15, 0.45, 0.22], color: '#334155' }, // Grip
      { type: 'Cylinder', position: [0, 0.25, 0.1], scale: [0.06, 0.35, 0.06], color: '#00f2fe', rotation: [Math.PI/2, 0, 0], name: 'Laser_Sight' }, // Scope
      { type: 'Box', position: [0, 0.1, -0.4], scale: [0.12, 0.2, 0.4], color: '#111', name: 'Stock' } // Stock
    ]
  }),

  GUN: (color) => MODEL_TEMPLATES.BLASTER(color),

  SATELLITE: (color = '#94a3b8') => ({
    type: 'Group',
    name: 'Orbital Satellite',
    parts: [
      { type: 'Box', position: [0, 0, 0], scale: [0.4, 0.4, 0.4], color }, // Core
      { type: 'Box', position: [0.8, 0, 0], scale: [1, 0.3, 0.05], color: '#4444ff' }, // Solar L
      { type: 'Box', position: [-0.8, 0, 0], scale: [1, 0.3, 0.05], color: '#4444ff' }, // Solar R
      { type: 'Cylinder', position: [0, 0.3, 0], scale: [0.05, 0.4, 0.05], color: '#fff' } // Antenna
    ]
  }),

  SABER: (color = '#00f2fe') => ({
    type: 'Group',
    name: 'Plasma Saber',
    parts: [
      { type: 'Cylinder', position: [0, 0, 0], scale: [0.06, 0.3, 0.06], color: '#475569' }, // Hilt
      { type: 'Cylinder', position: [0, 1, 0], scale: [0.04, 1.8, 0.04], color, emissive: color, emissiveIntensity: 2 } // Active Blade
    ]
  }),

  SUPERCAR: (color = '#f43f5e') => ({
    type: 'Group',
    name: 'CyberCar',
    parts: [
      { type: 'Box', position: [0, 0.25, 0], scale: [1, 0.3, 2], color }, // Chassis
      { type: 'Box', position: [0, 0.5, -0.2], scale: [0.8, 0.3, 1], color: 'rgba(0,242,254,0.4)' }, // Cockpit
      { type: 'Cylinder', position: [-0.55, 0.15, 0.7], scale: [0.3, 0.1, 0.3], color: '#111', rotation: [0, 0, Math.PI/2] }, // Wheel FL
      { type: 'Cylinder', position: [0.55, 0.15, 0.7], scale: [0.3, 0.1, 0.3], color: '#111', rotation: [0, 0, Math.PI/2] }, // Wheel FR
      { type: 'Cylinder', position: [-0.55, 0.15, -0.7], scale: [0.3, 0.1, 0.3], color: '#111', rotation: [0, 0, Math.PI/2] }, // Wheel RL
      { type: 'Cylinder', position: [0.55, 0.15, -0.7], scale: [0.3, 0.1, 0.3], color: '#111', rotation: [0, 0, Math.PI/2] } // Wheel RR
    ]
  }),

  FACE: (color = '#fde68a') => ({
    type: 'Group',
    name: 'Proto_Head',
    parts: [
      { type: 'Sphere', position: [0, 1.6, 0], scale: [0.25, 0.3, 0.25], color }, // Skull
      { type: 'Sphere', position: [-0.08, 1.65, 0.2], scale: [0.04, 0.04, 0.04], color: '#fff', name: 'EyeL' }, // Eye L
      { type: 'Sphere', position: [0.08, 1.65, 0.2], scale: [0.04, 0.04, 0.04], color: '#fff', name: 'EyeR' }, // Eye R
      { type: 'Box', position: [0, 1.55, 0.22], scale: [0.03, 0.08, 0.03], color, name: 'Nose' }, // Nose
      { type: 'Box', position: [0, 1.45, 0.18], scale: [0.1, 0.02, 0.05], color: '#ef4444', name: 'Mouth' }, // Mouth
      { type: 'Sphere', position: [-0.25, 1.6, 0.05], scale: [0.05, 0.08, 0.05], color, name: 'EarL' }, // Ear L
      { type: 'Sphere', position: [0.25, 1.6, 0.05], scale: [0.05, 0.08, 0.05], color, name: 'EarR' } // Ear R
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
  }),

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

  ICOSPHERE: (color = '#00f2fe') => ({
    type: 'IcoSphere',
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

  PLANE: (color = '#94a3b8') => ({
    type: 'Mesh',
    name: 'Plane',
    parts: [{ type: 'Plane', position: [0, 0, 0], scale: [2, 2, 1], color, rotation: [-Math.PI / 2, 0, 0] }]
  }),

  CIRCLE: (color = '#94a3b8') => ({
    type: 'Mesh',
    name: 'Circle',
    parts: [{ type: 'Circle', position: [0, 0, 0], scale: [1, 1, 1], color, rotation: [-Math.PI / 2, 0, 0] }]
  }),

  GRID: (color = '#475569') => ({
    type: 'Mesh',
    name: 'Grid',
    parts: [{ type: 'Plane', position: [0, 0, 0], scale: [5, 5, 1], color, wireframe: true, rotation: [-Math.PI / 2, 0, 0] }]
  }),

  MONKEY: (color = '#8b5cf6') => ({
    type: 'Group',
    name: 'Suzanne',
    parts: [
      { type: 'Sphere', position: [0, 0, 0], scale: [0.6, 0.5, 0.4], color }, // Head
      { type: 'Sphere', position: [-0.4, 0.1, 0.1], scale: [0.2, 0.2, 0.1], color }, // Ear L
      { type: 'Sphere', position: [0.4, 0.1, 0.1], scale: [0.2, 0.2, 0.1], color }, // Ear R
      { type: 'Sphere', position: [-0.15, 0.1, 0.3], scale: [0.1, 0.1, 0.1], color: '#fff', name: 'EyeL' },
      { type: 'Sphere', position: [0.15, 0.1, 0.3], scale: [0.1, 0.1, 0.1], color: '#fff', name: 'EyeR' },
      { type: 'Box', position: [0, -0.1, 0.3], scale: [0.2, 0.1, 0.2], color: '#d1d5db' }, // Snout
    ]
  }),

  TEXT: (color = '#ffffff') => ({
    type: 'Mesh',
    name: '3D Text',
    parts: [{ type: 'Box', position: [0, 0, 0], scale: [1.5, 0.5, 0.1], color }]
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
    parts: [{ type: 'Torus', position: [0, 0, 0], scale: [1, 0.02, 1], color, rotation: [-Math.PI / 2, 0, 0] }]
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

  // Light Objects
  LIGHT_POINT: (color = '#ffcc00') => ({
    type: 'Light',
    name: 'Point Light',
    parts: [{ type: 'Sphere', position: [0, 0, 0], scale: [0.1, 0.1, 0.1], color, emissive: color, emissiveIntensity: 2 }]
  }),

  LIGHT_SUN: (color = '#ffffff') => ({
    type: 'Light',
    name: 'Sun Light',
    parts: [{ type: 'Cylinder', position: [0, 0, 0], scale: [0.05, 1, 0.05], color, emissive: color, emissiveIntensity: 1 }]
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

  // Empty & Utilities
  EMPTY_PLAIN: () => ({
    type: 'Empty',
    name: 'Empty',
    parts: [{ type: 'Box', position: [0, 0, 0], scale: [0.1, 0.1, 0.1], color: '#ffffff', opacity: 0.5, wireframe: true }]
  }),

  EMPTY_AXES: () => ({
    type: 'Empty',
    name: 'Empty Axes',
    parts: [
      { type: 'Box', position: [0, 0, 0], scale: [1, 0.01, 0.01], color: '#ff0000' },
      { type: 'Box', position: [0, 0, 0], scale: [0.01, 1, 0.01], color: '#00ff00' },
      { type: 'Box', position: [0, 0, 0], scale: [0.01, 0.01, 1], color: '#0000ff' },
    ]
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
 */
export const assembleFromAI = (prompt, color = '#8b5cf6') => {
  const p = prompt.toLowerCase();
  let parts = [];
  let name = 'AI Construction';

  if (p.includes('robot')) {
    name = 'Neural Robot';
    parts = MODEL_TEMPLATES.ROBOT(color).parts;
  } else if (p.includes('head') || p.includes('face') || p.includes('skull')) {
    name = 'Bio_Sim: Head';
    parts = MODEL_TEMPLATES.FACE(color).parts;
  } else if (p.includes('gun') || p.includes('weapon') || p.includes('blaster') || p.includes('rifle')) {
    name = 'Tech_Gear: Tactical Blaster';
    parts = MODEL_TEMPLATES.BLASTER('#475569').parts;
  } else if (p.includes('sword') || p.includes('saber')) {
    name = 'Tech_Gear: Saber';
    parts = MODEL_TEMPLATES.SABER('#00f2fe').parts;
  } else if (p.includes('car') || p.includes('vehicle')) {
    name = 'Transport_Sim: CyberCar';
    parts = MODEL_TEMPLATES.SUPERCAR(color).parts;
  } else if (p.includes('table')) {
    name = 'Exact Table';
    parts = MODEL_TEMPLATES.TABLE(color).parts;
  } else if (p.includes('chair')) {
    name = 'Exact Chair';
    parts = MODEL_TEMPLATES.CHAIR(color).parts;
  } else if (p.includes('pillar') || p.includes('column')) {
    name = 'Exact Column';
    parts = [
      { type: 'Cylinder', position: [0, 1, 0], scale: [0.5, 2, 0.5], color },
      { type: 'Box', position: [0, 0.1, 0], scale: [0.8, 0.2, 0.8], color },
      { type: 'Box', position: [0, 2, 0], scale: [0.8, 0.2, 0.8], color },
    ];
  } else {
    name = 'Custom Assembly';
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
