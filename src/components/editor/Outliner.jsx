import React from 'react';
import { Eye, Lock, ChevronDown, ChevronRight, Box, Image as ImageIcon, Camera, Sun } from 'lucide-react';
import './Outliner.css';

const Outliner = () => {
  const tree = [
    {
      id: 1, name: 'Scene Collection', type: 'collection', expanded: true, children: [
        { id: 2, name: 'Camera', type: 'camera', visible: true, locked: false },
        { id: 3, name: 'Directional Light', type: 'light', visible: true, locked: false },
        {
          id: 4, name: 'Tavern Environment', type: 'collection', expanded: true, children: [
            { id: 5, name: 'FloorBase', type: 'mesh', visible: true, locked: true },
            { id: 6, name: 'Walls_Main', type: 'mesh', visible: true, locked: false },
            { id: 7, name: 'WoodenTables', type: 'mesh', visible: true, locked: false },
          ]
        },
        { id: 8, name: 'Generated_Character_01', type: 'mesh', visible: false, locked: false }
      ]
    }
  ];

  const renderIcon = (type) => {
    switch (type) {
      case 'collection': return <div className="tree-icon collection"></div>;
      case 'mesh': return <Box size={14} className="tree-icon mesh" />;
      case 'camera': return <Camera size={14} className="tree-icon camera" />;
      case 'light': return <Sun size={14} className="tree-icon light" />;
      default: return <Box size={14} className="tree-icon" />;
    }
  };

  const renderTree = (items, depth = 0) => {
    return items.map(item => (
      <React.Fragment key={item.id}>
        <div className={`outliner-item ${item.id === 6 ? 'selected' : ''}`} style={{ paddingLeft: `${depth * 16 + 12}px` }}>
          <div className="item-expand">
            {item.children && (item.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
          </div>
          {renderIcon(item.type)}
          <span className="item-name">{item.name}</span>
          
          <div className="item-toggles">
            <button className={`toggle-btn ${!item.visible ? 'off' : ''}`}>
              <Eye size={14} />
            </button>
            <button className="toggle-btn">
              <Lock size={14} />
            </button>
          </div>
        </div>
        
        {item.children && item.expanded && renderTree(item.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="outliner-panel">
      <div className="outliner-search">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="outliner-tree">
        {renderTree(tree)}
      </div>
    </div>
  );
};

export default Outliner;
