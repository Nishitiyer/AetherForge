import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Sparkles, Check, X } from 'lucide-react';
import { useSession } from '../context/SessionContext.jsx';
import Footer from '../components/landing/Footer.jsx';
import Navbar from '../components/common/Navbar.jsx';

const CreatorPortal = () => {
  const [keyInput, setKeyInput] = useState('');
  const [status, setStatus] = useState('IDLE'); // IDLE, WRONG, SUCCESS
  const { loginAsCreator } = useSession();
  const navigate = useNavigate();

  const handleVerify = () => {
    const success = loginAsCreator(keyInput);
    if (success) {
      setStatus('SUCCESS');
      setTimeout(() => navigate('/orb-selection'), 1500);
    } else {
      setStatus('WRONG');
      setTimeout(() => setStatus('IDLE'), 2000);
    }
  };

  return (
    <div className="creator-portal-page dark-workspace h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Holographic grid background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="portal-card glass-panel p-10 max-w-md w-full relative z-10 text-center">
          <div className="icon-wrapper mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center shadow-2xl pulse-glow">
              <Shield size={40} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">CREATOR_GATEWAY</h1>
          <p className="text-slate-400 text-sm mb-8">Access the restricted AetherForge Forge utilizing your unique Creator ID.</p>

          <div className="input-group relative mb-6">
            <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="password" 
              placeholder="Enter Creator Key..."
              className="key-input w-full p-4 pl-12 bg-black/50 border border-slate-800 rounded-lg text-white focus:border-cyan-500 transition-all outline-none"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>

          <button 
            className={`verify-btn w-full p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              status === 'SUCCESS' ? 'bg-green-500 text-white' : 
              status === 'WRONG' ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-cyan-400'
            }`}
            onClick={handleVerify}
            disabled={status !== 'IDLE'}
          >
            {status === 'IDLE' && <>VERIFY_IDENT <Sparkles size={18}/></>}
            {status === 'SUCCESS' && <>ACCESS_GRANTED <Check size={18}/></>}
            {status === 'WRONG' && <>INVALID_ID <X size={18}/></>}
          </button>
          
          <p className="mt-8 text-[10px] text-slate-600 font-mono tracking-widest">SECURE_CHANNEL_A1_77</p>
        </div>
      </div>
      
      <Footer />
      
      <style>{`
        .creator-portal-page {
          background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);
        }
        .pulse-glow {
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
          animation: glow-pulse 2s infinite alternate;
        }
        @keyframes glow-pulse {
          from { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          to { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default CreatorPortal;
