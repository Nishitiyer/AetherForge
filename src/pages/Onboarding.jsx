import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gamepad2, Film, LayoutDashboard, ChevronRight } from 'lucide-react';
import './Onboarding.css';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    experience: '',
    goal: '',
    style: ''
  });
  
  const navigate = useNavigate();

  const handleSelect = (category, value) => {
    setSelections({ ...selections, [category]: value });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container glass-panel">
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
          <span className="step-indicator">Step {step} of 3</span>
        </div>

        <div className="onboarding-content">
          {step === 1 && (
            <div className="step-content animate-in">
              <h2>What's your 3D experience level?</h2>
              <p>Tailor AetherForge's interface to match your workflow.</p>
              
              <div className="options-grid">
                <OptionCard 
                  title="Beginner" 
                  description="I'm new to 3D and want AI to do the heavy lifting."
                  selected={selections.experience === 'beginner'}
                  onClick={() => handleSelect('experience', 'beginner')}
                  icon={<Sparkles size={24} />}
                />
                <OptionCard 
                  title="Intermediate" 
                  description="I know my way around standard 3D software."
                  selected={selections.experience === 'intermediate'}
                  onClick={() => handleSelect('experience', 'intermediate')}
                  icon={<LayoutDashboard size={24} />}
                />
                <OptionCard 
                  title="Professional" 
                  description="I need advanced topology, UV, and material control."
                  selected={selections.experience === 'professional'}
                  onClick={() => handleSelect('experience', 'professional')}
                  icon={<span style={{ fontWeight: 800, fontSize: 20 }}>PRO</span>}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content animate-in">
              <h2>What do you want to create?</h2>
              <p>Select your primary goal to help us suggest the right workspaces.</p>
              
              <div className="options-grid grid-2col">
                <OptionCard 
                  title="Game Development" 
                  description="Optimized models, characters, and assets for engines."
                  selected={selections.goal === 'games'}
                  onClick={() => handleSelect('goal', 'games')}
                  icon={<Gamepad2 size={24} />}
                />
                <OptionCard 
                  title="Animation & VFX" 
                  description="Rigged models and cinematic environments."
                  selected={selections.goal === 'animation'}
                  onClick={() => handleSelect('goal', 'animation')}
                  icon={<Film size={24} />}
                />
                <OptionCard 
                  title="Concept Art" 
                  description="Fast visual ideation and prototyping."
                  selected={selections.goal === 'concept'}
                  onClick={() => handleSelect('goal', 'concept')}
                  icon={<Sparkles size={24} />}
                />
                <OptionCard 
                  title="Industrial / Product" 
                  description="High realism materials and precise lighting."
                  selected={selections.goal === 'product'}
                  onClick={() => handleSelect('goal', 'product')}
                  icon={<LayoutDashboard size={24} />}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content animate-in">
              <h2>What's your preferred default style?</h2>
              <p>You can change this per-generation, but it sets your baseline.</p>
              
              <div className="options-grid">
                <OptionCard 
                  title="Hyper-Realistic" 
                  description="Photoreal textures, physically based rendering."
                  selected={selections.style === 'realistic'}
                  onClick={() => handleSelect('style', 'realistic')}
                  imageStyle="linear-gradient(135deg, #1a1a2e, #16213e)"
                />
                <OptionCard 
                  title="Stylized / Anime" 
                  description="Toon shaders, cel-shaded looks, vibrant colors."
                  selected={selections.style === 'stylized'}
                  onClick={() => handleSelect('style', 'stylized')}
                  imageStyle="linear-gradient(135deg, #ff9a9e, #fecfef)"
                />
                <OptionCard 
                  title="Low Poly" 
                  description="Flat shading, faceted geometry, retro feel."
                  selected={selections.style === 'lowpoly'}
                  onClick={() => handleSelect('style', 'lowpoly')}
                  imageStyle="linear-gradient(135deg, #84fab0, #8fd3f4)"
                />
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-footer">
          <button 
            className="btn-secondary" 
            onClick={() => setStep(Math.max(1, step - 1))}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            Back
          </button>
          
          <button 
            className="btn-primary flex-center" 
            onClick={handleNext}
            disabled={
              (step === 1 && !selections.experience) ||
              (step === 2 && !selections.goal) ||
              (step === 3 && !selections.style)
            }
          >
            {step === 3 ? 'Go to Dashboard' : 'Continue'}
            {step < 3 && <ChevronRight size={18} style={{ marginLeft: 8 }} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const OptionCard = ({ title, description, selected, onClick, icon, imageStyle }) => (
  <div className={`option-card ${selected ? 'selected' : ''}`} onClick={onClick}>
    {icon && <div className="option-icon">{icon}</div>}
    {imageStyle && <div className="option-image-preview" style={{ background: imageStyle }}></div>}
    <div className="option-text">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <div className="option-radio">
      <div className="radio-inner"></div>
    </div>
  </div>
);

export default Onboarding;
