import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Hash, Zap, Activity } from 'lucide-react';
import './RiggingPanel.css';

const RiggingPanel = () => {
  const [expanded, setExpanded] = useState(['root']);

  const toggle = (id) => {
    setExpanded(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const BoneItem = ({ id, label, children }) => {
    const isExpanded = expanded.includes(id);
    const hasChildren = children && children.length > 0;

    return (
      <div className="bone-item">
        <div className={`bone-header ${isExpanded ? 'active' : ''}`} onClick={() => toggle(id)}>
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div style={{ width: 14 }}></div>
          )}
          <Hash size={14} className="bone-icon" />
          <span className="bone-label">{label}</span>
          <div className="bone-actions">
            <Zap size={12} title="AI Pose" />
            <Activity size={12} title="Animation Path" />
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="bone-children">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rigging-panel">
      <div className="panel-section-header">
        <User size={16} />
        <span>Skeleton Hierarchy</span>
      </div>
      
      <div className="skeleton-tree">
        <BoneItem id="root" label="Armature Root">
          <BoneItem id="spine" label="Spine">
            <BoneItem id="chest" label="Chest">
              <BoneItem id="neck" label="Neck">
                <BoneItem id="head" label="Head" />
              </BoneItem>
              <BoneItem id="shoulder_l" label="Shoulder.L">
                <BoneItem id="arm_upper_l" label="UpperArm.L">
                  <BoneItem id="arm_lower_l" label="LowerArm.L" />
                </BoneItem>
              </BoneItem>
              <BoneItem id="shoulder_r" label="Shoulder.R">
                <BoneItem id="arm_upper_r" label="UpperArm.R" />
              </BoneItem>
            </BoneItem>
          </BoneItem>
          <BoneItem id="hips" label="Hips">
            <BoneItem id="leg_l" label="Leg.L" />
            <BoneItem id="leg_r" label="Leg.R" />
          </BoneItem>
        </BoneItem>
      </div>

      <div className="rig-actions">
        <button className="btn-rig-primary">Auto-Rig (AI)</button>
        <button className="btn-rig-secondary">Reset Pose</button>
      </div>
    </div>
  );
};

export default RiggingPanel;
