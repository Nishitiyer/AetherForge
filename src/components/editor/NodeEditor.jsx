import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import './NodeEditor.css';

const initialNodes = [
  { 
    id: 'node-1', 
    type: 'input', 
    data: { label: 'Texture: Carbon Fiber' }, 
    position: { x: 50, y: 50 },
    style: { background: '#1e293b', color: '#fff', border: '1px solid #4f46e5' }
  },
  { 
    id: 'node-2', 
    data: { label: 'Normal Map' }, 
    position: { x: 50, y: 150 },
    style: { background: '#1e293b', color: '#fff', border: '1px solid #4f46e5' }
  },
  { 
    id: 'node-3', 
    type: 'output', 
    data: { label: 'Material Output' }, 
    position: { x: 400, y: 100 },
    style: { background: '#4f46e5', color: '#fff', border: '1px solid #6366f1' }
  },
];

const initialEdges = [
  { id: 'e1-3', source: 'node-1', target: 'node-3', animated: true },
  { id: 'e2-3', source: 'node-2', target: 'node-3' },
];

const NodeEditor = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div className="node-editor-container">
      <div className="node-editor-toolbar">
        <span className="editor-title">AetherNodes - Shader Editor</span>
        <div className="toolbar-actions">
          <button className="node-btn">Add Node</button>
          <button className="node-btn primary">Compile Shader</button>
        </div>
      </div>
      <div className="react-flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          theme="dark"
        >
          <Background color="#334155" gap={20} />
          <Controls />
          <MiniMap style={{ background: '#0f172a' }} nodeColor="#4f46e5" maskColor="rgba(15, 23, 42, 0.7)" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default NodeEditor;
