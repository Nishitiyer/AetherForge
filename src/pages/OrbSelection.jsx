import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/landing/Hero.jsx';
import { useSession } from '../context/SessionContext.jsx';
import './OrbSelection.css';

const OrbSelection = () => {
  const { setSelectedOrbId, setIsOrbSelected, setOrbSettings, orbSettings } = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Selection, 2: Customization

  const handleConfirmSelection = () => {
    setStep(2);
  };

  const handleFinalize = () => {
    setIsOrbSelected(true);
    navigate('/editor');
  };

  return (
    <div className="orb-selection-page">
      <div className="selection-overlay">
        {step === 1 ? (
          <div className="selection-intro">
            <h1 className="text-gradient">Select Your AI Core</h1>
            <p className="subtitle">The Ironman Chestplate assembly is initializing. Cycle through orbs to find your companion.</p>
          </div>
        ) : (
          <div className="customization-panel glass-panel">
            <h2 className="text-gradient">Configure Your Orb</h2>
            <div className="config-group">
              <label>Orb Name</label>
              <input 
                type="text" 
                value={orbSettings.name} 
                onChange={(e) => setOrbSettings({...orbSettings, name: e.target.value})} 
              />
            </div>
            <div className="config-group">
              <label>Theme Color</label>
              <input 
                type="color" 
                value={orbSettings.color} 
                onChange={(e) => setOrbSettings({...orbSettings, color: e.target.value})} 
              />
            </div>
            <button className="btn-primary w-full mt-4" onClick={handleFinalize}>Initialize AetherForge</button>
          </div>
        )}
      </div>

      <Hero 
        isSelectionMode={true} 
        onConfirm={handleConfirmSelection} 
      />
      
      <style>{`
        .orb-selection-page {
          width: 100vw;
          height: 100vh;
          background: #000;
          overflow: hidden;
          position: relative;
        }
        .selection-overlay {
          position: absolute;
          top: 2rem;
          left: 0;
          right: 0;
          z-index: 100;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .selection-intro {
          max-width: 600px;
        }
        .customization-panel {
          pointer-events: auto;
          position: absolute;
          top: 50%;
          right: 5%;
          transform: translateY(-50%);
          width: 350px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          z-index: 200;
        }
        .config-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
        }
        .config-group label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #00d4ff;
          letter-spacing: 1px;
        }
        .config-group input {
          background: rgba(0,0,0,0.5);
          border: 1px solid #333;
          color: #fff;
          padding: 0.8rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default OrbSelection;
